#!/usr/bin/env node

import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const failures = [];
let checks = 0;
let server;
let browser;

function ok(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

function freePort() {
  return new Promise((resolve, reject) => {
    const candidate = net.createServer();
    candidate.listen(0, '127.0.0.1', () => {
      const { port } = candidate.address();
      candidate.close((error) => (error ? reject(error) : resolve(port)));
    });
    candidate.on('error', reject);
  });
}

async function waitForPort(port, timeout = 8000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const ready = await new Promise((resolve) => {
      const socket = net.createConnection(port, '127.0.0.1');
      socket.on('connect', () => {
        socket.end();
        resolve(true);
      });
      socket.on('error', () => resolve(false));
    });
    if (ready) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
}

try {
  const port = await freePort();
  server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {
    cwd: ROOT,
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  ok(await waitForPort(port), 'Servidor de teste não iniciou.');

  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/tests/toast/runtime.html`, {
    waitUntil: 'networkidle',
  });
  await page.waitForFunction(() => document.documentElement.dataset.toastReady === 'true');

  const initial = await page.evaluate(() => {
    const root = document.querySelector('#scoped-root');
    const [controller] = window.toastApi.initToasts(root);
    document.querySelector('#outside').focus();
    const id = window.toastApi.showToast({
      type: 'success',
      style: 'solid',
      title: 'Salvo',
      description: 'Rascunho atualizado',
      actions: [
        { label: 'Desfazer' },
        { label: 'Ver' },
        { label: 'Ignorada' },
      ],
    });
    const toast = controller.root.querySelector(`[data-toast-id="${id}"]`);
    return {
      initialized: controller.root.dataset.dsToastInit,
      politeRole: controller.root.querySelector('.ds-toast-region__polite')?.getAttribute('role'),
      assertiveRole: controller.root.querySelector('.ds-toast-region__assertive')?.getAttribute('role'),
      className: toast?.className,
      title: toast?.querySelector('.ds-toast__title')?.textContent,
      description: toast?.querySelector('.ds-toast__description')?.textContent,
      actions: toast?.querySelectorAll('.ds-toast__actions .ds-button').length,
      activeElement: document.activeElement?.id,
      id,
    };
  });

  ok(initial.initialized === 'true', 'initToasts deve marcar a region.');
  ok(initial.politeRole === 'status', 'Tipos não-error devem usar role=status.');
  ok(initial.assertiveRole === 'alert', 'Error deve ter region role=alert.');
  ok(initial.className.includes('ds-toast--success') && initial.className.includes('ds-toast--solid'), 'Type e Style devem refletir options.');
  ok(initial.title === 'Salvo' && initial.description === 'Rascunho atualizado', 'Title e Description devem usar a anatomia pública.');
  ok(initial.actions === 2, 'O runtime deve limitar actions a duas Buttons públicas.');
  ok(initial.activeElement === 'outside', 'Toast não deve mover foco.');

  await page.waitForTimeout(100);
  ok(
    await page.locator(`[data-toast-id="${initial.id}"]`).count() === 1,
    'Toast com actions não deve ter auto-hide por padrão.',
  );

  const errorHost = await page.evaluate(() => {
    const id = window.toastApi.showToast({ type: 'error', title: 'Falha', duration: 0 });
    const toast = document.querySelector(`[data-toast-id="${id}"]`);
    return toast?.parentElement?.className;
  });
  ok(errorHost === 'ds-toast-region__assertive', 'Error deve ser inserido na live region assertive.');

  const timedId = await page.evaluate(() => window.toastApi.showToast({
    type: 'info',
    title: 'Temporário',
    duration: 40,
  }));
  await page.waitForTimeout(100);
  ok(
    await page.locator(`[data-toast-id="${timedId}"]`).count() === 0,
    'Toast sem action deve respeitar duration e auto-hide.',
  );

  const queue = await page.evaluate(() => {
    const dismissed = [];
    const region = document.querySelector('[data-ds-toast-region]');
    region.addEventListener('ds-toast-dismiss', (event) => dismissed.push(event.detail.reason));
    for (let index = 0; index < 6; index += 1) {
      window.toastApi.showToast({ id: `queue-${index}`, title: `Toast ${index}`, duration: 0 });
    }
    return {
      count: region.querySelectorAll('[data-ds-toast]').length,
      firstStillPresent: Boolean(region.querySelector('[data-toast-id="queue-0"]')),
      overflow: dismissed.includes('overflow'),
    };
  });
  ok(queue.count === 5, 'Fila deve limitar toasts visíveis a cinco.');
  ok(!queue.firstStillPresent && queue.overflow, 'Overflow deve remover o toast mais antigo e emitir motivo.');

  const actionId = await page.evaluate(() => {
    window.actionCalls = 0;
    window.actionEvents = 0;
    document.querySelector('[data-ds-toast-region]').addEventListener('ds-toast-action', () => {
      window.actionEvents += 1;
    });
    return window.toastApi.showToast({
      id: 'action-toast',
      title: 'Ação',
      actions: [{ label: 'Executar', onAction: () => { window.actionCalls += 1; } }],
    });
  });
  await page.locator(`[data-toast-id="${actionId}"] .ds-button`).click();
  const actionResult = await page.evaluate(() => ({
    calls: window.actionCalls,
    events: window.actionEvents,
  }));
  ok(actionResult.calls === 1 && actionResult.events === 1, 'Action deve chamar callback e emitir ds-toast-action.');

  await page.locator(`[data-toast-id="${actionId}"] .ds-button`).focus();
  await page.keyboard.press('Escape');
  ok(
    await page.locator(`[data-toast-id="${actionId}"]`).count() === 0,
    'Escape deve dispensar o toast que contém foco.',
  );

  const lifecycle = await page.evaluate(() => {
    const root = document.querySelector('#scoped-root');
    const region = root.querySelector('[data-ds-toast-region]');
    window.toastApi.destroyToasts(root);
    const preserved = region.isConnected;
    const markerRemoved = !region.hasAttribute('data-ds-toast-init');
    const [controller] = window.toastApi.initToasts(root);
    return {
      preserved,
      markerRemoved,
      reinitialized: controller.root.dataset.dsToastInit === 'true',
    };
  });
  ok(lifecycle.preserved, 'destroyToasts deve preservar region declarada pelo consumidor.');
  ok(lifecycle.markerRemoved, 'destroyToasts deve remover o marker de init.');
  ok(lifecycle.reinitialized, 'Runtime deve permitir re-init após destroy.');
} catch (error) {
  failures.push(error.stack || error.message);
} finally {
  if (browser) await browser.close();
  if (server) server.kill('SIGTERM');
}

if (failures.length) {
  console.error(`FAIL — ${failures.length}/${checks} checks`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PASS — ${checks} checks`);
