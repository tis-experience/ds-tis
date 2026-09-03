#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

import {
  REACT_REGISTRY_COMPONENTS,
  SHADCN_REGISTRY,
} from "./lib/technology-implementations.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURE = path.join(ROOT, "tests", "consumer", "react-vite");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ds-tis-shadcn-consumer-"));
const appDir = path.join(tempRoot, "app");
const packDir = path.join(tempRoot, "pack");
const extractedPackageRoot = path.join(packDir, "extracted");
const registryRoot = path.join(tempRoot, "registry");
const registryDir = path.join(registryRoot, SHADCN_REGISTRY.channel);
const npmCache = path.join(tempRoot, "npm-cache");
const shimDir = path.join(tempRoot, "bin");
const shadcnExecutable = path.join(
  ROOT,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "shadcn.cmd" : "shadcn",
);
const errors = [];

console.log("\n═══ test-shadcn-consumer ════════════════════");

function expect(condition, message) {
  if (!condition) errors.push(message);
}

async function waitForFocus(locator, { contained = false, timeout = 3000 } = {}) {
  try {
    return await locator.evaluate(
      (element, options) => new Promise((resolve) => {
        const startedAt = performance.now();

        function checkFocus() {
          const focused = options.contained
            ? element.contains(document.activeElement)
            : element === document.activeElement;

          if (focused) {
            resolve(true);
            return;
          }

          if (performance.now() - startedAt >= options.timeout) {
            resolve(false);
            return;
          }

          requestAnimationFrame(checkFocus);
        }

        checkFocus();
      }),
      { contained, timeout },
    );
  } catch {
    return false;
  }
}

function run(label, command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    shell: false,
    env: { ...process.env, npm_config_cache: npmCache },
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(`${label} falhou (exit ${result.status ?? "null"})\n${result.stdout ?? ""}${result.stderr ?? ""}`);
  }
  return result;
}

function runAsync(label, command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      encoding: "utf8",
      shell: false,
      env: { ...process.env, npm_config_cache: npmCache },
      ...options,
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
    });
    child.once("error", reject);
    child.once("close", (status) => {
      if (status !== 0) {
        reject(new Error(`${label} falhou (exit ${status ?? "null"})\n${stdout}${stderr}`));
        return;
      }
      resolve({ status, stdout, stderr });
    });
  });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function linkWorkspaceDependency(packageName, target = path.join(ROOT, "node_modules", packageName)) {
  if (!fs.existsSync(target)) {
    throw new Error(`${packageName}: dependência local ausente em ${target}`);
  }
  const destination = path.join(appDir, "node_modules", ...packageName.split("/"));
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.symlinkSync(target, destination, process.platform === "win32" ? "junction" : "dir");
}

function contentType(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".json")) return "application/json; charset=utf-8";
  if (file.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

async function startStaticServer(directory) {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const file = path.resolve(directory, relative);
    if (!file.startsWith(`${directory}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": contentType(file),
    });
    fs.createReadStream(file).pipe(response);
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return {
    server,
    url: `http://127.0.0.1:${server.address().port}`,
  };
}

function closeServer(server) {
  return new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

let registryServer = null;
let appServer = null;
let browser = null;

try {
  fs.mkdirSync(packDir, { recursive: true });
  fs.cpSync(FIXTURE, appDir, { recursive: true });

  const pack = run("npm pack", "npm", ["pack", "--json", "--pack-destination", packDir]);
  const packed = JSON.parse(pack.stdout.slice(pack.stdout.indexOf("[")));
  const tarball = path.join(packDir, packed[0]?.filename ?? "missing.tgz");
  expect(fs.existsSync(tarball), "npm pack deve gerar o tarball atual do ds-tis");
  fs.mkdirSync(extractedPackageRoot, { recursive: true });
  run("extração do tarball", "tar", ["-xzf", tarball, "-C", extractedPackageRoot]);
  const packedDsDependency = path.join(extractedPackageRoot, "package");
  expect(
    fs.existsSync(path.join(packedDsDependency, "package.json")),
    "tarball ds-tis deve conter package.json",
  );

  run(
    "build do registry",
    process.execPath,
    ["scripts/build-shadcn-registry.mjs", "--output", registryDir],
  );

  const localDsDependency = `file:${tarball}`;
  for (const file of fs.readdirSync(registryDir).filter((name) => name.endsWith(".json"))) {
    const absolute = path.join(registryDir, file);
    const item = readJson(absolute);
    if (Array.isArray(item.dependencies)) {
      item.dependencies = item.dependencies.map((dependency) =>
        dependency.startsWith("ds-tis@") ? localDsDependency : dependency,
      );
      writeJson(absolute, item);
    }
  }

  const fixturePackagePath = path.join(appDir, "package.json");
  const fixturePackage = readJson(fixturePackagePath);
  fixturePackage.dependencies["ds-tis"] = localDsDependency;
  writeJson(fixturePackagePath, fixturePackage);

  fs.mkdirSync(path.join(appDir, "node_modules"), { recursive: true });
  for (const dependency of [
    "@base-ui/react",
    "class-variance-authority",
    "clsx",
    "lucide-react",
    "react",
    "react-dom",
    "tailwind-merge",
  ]) {
    linkWorkspaceDependency(dependency);
  }
  linkWorkspaceDependency("ds-tis", packedDsDependency);

  // O root já instalou e fixou estas dependências pelo package-lock. O shim
  // impede uma segunda ida à rede caso o CLI tente reinstalar versões que já
  // estão disponíveis no fixture por links locais.
  fs.mkdirSync(shimDir, { recursive: true });
  const npmShim = path.join(shimDir, process.platform === "win32" ? "npm.cmd" : "npm");
  fs.writeFileSync(
    npmShim,
    process.platform === "win32"
      ? "@echo off\r\necho Dependencies already provided by workspace lockfile.\r\n"
      : "#!/bin/sh\necho 'Dependencies already provided by workspace lockfile.'\n",
    "utf8",
  );
  fs.chmodSync(npmShim, 0o755);

  const registryServing = await startStaticServer(registryRoot);
  registryServer = registryServing.server;
  const componentsConfigPath = path.join(appDir, "components.json");
  const componentsConfig = readJson(componentsConfigPath);
  componentsConfig.registries[SHADCN_REGISTRY.namespace] = `${registryServing.url}/${SHADCN_REGISTRY.channel}/{name}.json`;
  writeJson(componentsConfigPath, componentsConfig);

  const registryArguments = REACT_REGISTRY_COMPONENTS.map(
    ({ item }) => `${SHADCN_REGISTRY.namespace}/${item}`,
  );
  await runAsync(
    "shadcn add do consumer",
    shadcnExecutable,
    ["add", "--yes", "--cwd", appDir, ...registryArguments],
    {
      cwd: appDir,
      env: {
        ...process.env,
        npm_config_cache: npmCache,
        PATH: `${shimDir}${path.delimiter}${process.env.PATH ?? ""}`,
      },
    },
  );

  for (const { item } of REACT_REGISTRY_COMPONENTS) {
    expect(
      fs.existsSync(path.join(appDir, "src", "components", "ui", `${item}.tsx`)),
      `${item}: source não foi instalado pelo shadcn`,
    );
  }
  expect(
    fs.existsSync(path.join(appDir, "src", "components", "ui", "tis-utils.ts")),
    "tis-utils.ts não foi instalado pelo shadcn",
  );

  const installedPackage = readJson(path.join(appDir, "package.json"));
  expect(installedPackage.dependencies?.["ds-tis"] === localDsDependency, "consumer deve instalar o tarball ds-tis atual");
  expect(installedPackage.dependencies?.["@base-ui/react"] === "1.6.0", "consumer deve fixar Base UI 1.6.0");

  const globalCss = fs.readFileSync(path.join(appDir, "src", "index.css"), "utf8");
  const firstStatement = globalCss.replace(/\/\*[\s\S]*?\*\//g, "").trimStart();
  expect(firstStatement.startsWith('@import "ds-tis/css";'), "ds-tis/css deve ser o primeiro import global");
  expect(globalCss.includes("var(--ds-toggle-track-fill-on-default)"), "adapter do Switch deve chegar ao consumer");
  expect(globalCss.includes("var(--ds-modal-overlay-bg-default)"), "adapter do Dialog deve chegar ao consumer");
  expect(globalCss.includes("var(--ds-popover-arrow-fill-default)"), "adapter do Popover deve chegar ao consumer");
  expect(globalCss.includes("var(--ds-menu-item-bg-focused)"), "adapter do Select deve chegar ao consumer");
  expect(globalCss.includes(".ds-tis-menu__item[data-checked]"), "adapter do Menu deve chegar ao consumer");
  expect(globalCss.includes(".ds-tooltip__content.ds-tis-tooltip__popup"), "adapter do Tooltip deve chegar ao consumer");
  expect(globalCss.includes(".ds-tab--disabled"), "adapter de estado disabled do Tabs deve chegar ao consumer");
  expect(globalCss.includes('[data-slot="tabs-list"]'), "overflow local do Tabs deve chegar ao consumer");
  expect(globalCss.includes('[data-slot="tabs-trigger"]'), "nowrap do label de Tabs deve chegar ao consumer");
  expect(globalCss.includes(".ds-tis-toast__content"), "adapter do Toast deve chegar ao consumer");
  expect(globalCss.includes(".ds-tis-toast[data-limited]"), "limite visual do Toast deve chegar ao consumer");

  const viteExecutable = path.join(
    ROOT,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "vite.cmd" : "vite",
  );
  run("build Vite do consumer", viteExecutable, ["build"], { cwd: appDir });
  const distDir = path.join(appDir, "dist");
  expect(fs.existsSync(path.join(distDir, "index.html")), "Vite não gerou dist/index.html");

  await closeServer(registryServer);
  registryServer = null;
  const appServing = await startStaticServer(distDir);
  appServer = appServing.server;

  browser = await chromium.launch();
  const browserContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await browserContext.newPage();
  await page.goto(appServing.url, { waitUntil: "networkidle" });

  expect(await page.getByRole("heading", { name: "Preferências da conta" }).isVisible(), "app React não renderizou");
  expect(await page.locator('[data-slot="alert"]').count() === 1, "Alert instalado não renderizou");
  expect(await page.locator('[data-slot="badge"]').count() === 2, "Badge instalado não renderizou os estados");
  expect(await page.locator('[data-slot="card"]').count() === 4, "Card instalado não preservou a composição da tela");
  expect(await page.locator('[data-slot="separator"]').count() === 1, "Separator instalado não renderizou");
  expect(await page.locator('[data-slot="skeleton"][aria-hidden="true"]').count() === 3, "Skeleton instalado deve permanecer silencioso");
  expect(await page.locator('[data-slot="spinner"][role="status"]').count() === 1, "Spinner instalado deve anunciar status");
  expect(await page.locator('[data-slot="input"]').inputValue() === "Marcell", "Input instalado perdeu o valor inicial");
  expect(await page.locator('[data-slot="textarea"]').inputValue() === "Experience Engineering", "Textarea instalado perdeu o valor inicial");

  const selectTrigger = page.getByRole("combobox", { name: "País" });
  expect((await selectTrigger.textContent())?.includes("Brasil"), "Select instalado perdeu o valor inicial");
  await selectTrigger.click();
  const unavailableOption = page.getByRole("option", { name: "Indisponível" });
  expect(await unavailableOption.getAttribute("aria-disabled") === "true", "Select instalado perdeu a opção disabled");
  await page.getByRole("option", { name: "Chile" }).click();
  expect((await selectTrigger.textContent())?.includes("Chile"), "Select instalado não atualizou o valor");
  expect(await page.locator('input[name="country"]').inputValue() === "cl", "Select instalado não preservou o valor de formulário");

  const checkbox = page.locator('[data-slot="checkbox"]');
  await checkbox.click();
  expect(await checkbox.getAttribute("data-checked") !== null, "Checkbox instalado não alternou estado");

  const sms = page.locator('[data-slot="radio-group-item"]').nth(1);
  await page.getByText("SMS", { exact: true }).click();
  expect(await sms.getAttribute("data-checked") !== null, "Radio Group instalado não selecionou SMS");

  const toggle = page.locator('[data-slot="switch"]');
  expect(await toggle.getAttribute("data-checked") !== null, "Switch deve iniciar ligado");
  await toggle.click();
  expect(await toggle.getAttribute("data-checked") === null, "Switch instalado não alternou estado");

  const accordionTriggers = page.locator('[data-slot="accordion-trigger"]');
  expect(await accordionTriggers.count() === 2, "Accordion instalado deve expor os dois triggers do consumer");
  await accordionTriggers.nth(1).click();
  expect(await page.getByText("A atualização é aplicada imediatamente após salvar.").isVisible(), "Accordion instalado não abriu o painel");
  await page.keyboard.press("ArrowUp");
  expect(
    await waitForFocus(accordionTriggers.first()),
    "Accordion instalado não moveu foco com ArrowUp",
  );
  await page.keyboard.press("End");
  expect(
    await waitForFocus(accordionTriggers.nth(1)),
    "Accordion instalado não moveu foco com End",
  );

  const tablist = page.getByRole("tablist", { name: "Seções da conta" });
  const tabs = tablist.getByRole("tab");
  expect(await tabs.count() === 3, "Tabs instalado deve expor três tabs");
  expect(await tabs.first().getAttribute("aria-selected") === "true", "Tabs deve iniciar em Visão geral");
  expect(await tabs.nth(2).getAttribute("aria-disabled") === "true", "Tabs perdeu o item disabled");
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  expect(
    await tabs.nth(1).getAttribute("aria-selected") === "true" &&
      await waitForFocus(tabs.nth(1)),
    "Tabs não ativou Segurança com ArrowRight",
  );
  await page.keyboard.press("End");
  expect(
    await waitForFocus(tabs.nth(1)),
    "Tabs não ignorou Cobrança disabled com End",
  );
  await page.keyboard.press("Home");
  expect(await tabs.first().getAttribute("aria-selected") === "true", "Tabs não voltou à primeira tab com Home");
  expect(
    await page.getByRole("tabpanel").getByText("Preferências gerais desta conta.").isVisible(),
    "Tabs não sincronizou o painel selecionado",
  );

  const menuTrigger = page.getByRole("button", { name: "Ações da conta" });
  await menuTrigger.click();
  const accountMenu = page.getByRole("menu", { name: "Ações da conta" });
  const menuOpened = await accountMenu
    .waitFor({ state: "visible", timeout: 3000 })
    .then(() => true, () => false);
  expect(menuOpened, "Menu instalado não abriu");
  expect(
    await waitForFocus(accountMenu, { contained: true }),
    "Menu instalado não moveu o foco inicial para um comando",
  );
  const disabledMenuItem = page.getByRole("menuitem", { name: "Transferir propriedade" });
  expect(await disabledMenuItem.getAttribute("aria-disabled") === "true", "Menu instalado perdeu o item disabled");
  await page.keyboard.press("End");
  const destructiveMenuItem = page.getByRole("menuitem", { name: "Excluir conta" });
  expect(
    await waitForFocus(destructiveMenuItem),
    "Menu instalado não moveu foco para a última ação com End",
  );
  await page.keyboard.press("Home");
  const firstMenuItem = page.getByRole("menuitem", { name: "Salvar agora" });
  expect(
    await waitForFocus(firstMenuItem),
    "Menu instalado não moveu foco para a primeira ação com Home",
  );
  await page.keyboard.press("Escape");
  const menuClosed = await accountMenu
    .waitFor({ state: "hidden", timeout: 3000 })
    .then(() => true, () => false);
  expect(menuClosed, "Menu instalado não fechou com Escape");
  expect(
    await waitForFocus(menuTrigger),
    "Menu instalado não restaurou foco ao trigger",
  );

  const popoverTrigger = page.getByRole("button", { name: "Ver contexto" });
  await popoverTrigger.click();
  expect(await page.getByText("As preferências são aplicadas somente a esta conta.").isVisible(), "Popover instalado não abriu");
  const popoverDialog = page.getByRole("dialog");
  expect(
    await waitForFocus(popoverDialog, { contained: true }),
    "Popover instalado não moveu foco para o conteúdo",
  );
  await page.keyboard.press("Escape");
  const popoverClosed = await page
    .getByText("As preferências são aplicadas somente a esta conta.")
    .waitFor({ state: "hidden", timeout: 3000 })
    .then(() => true, () => false);
  expect(popoverClosed, "Popover instalado não fechou com Escape");
  expect(
    await waitForFocus(popoverTrigger),
    "Popover instalado não restaurou foco ao trigger",
  );

  const tooltipTrigger = page.getByRole("button", { name: "Sobre as preferências" });
  await tooltipTrigger.hover();
  const tooltip = page.getByRole("tooltip");
  expect(
    await tooltip.waitFor({ state: "visible", timeout: 3000 }).then(() => true, () => false),
    "Tooltip instalado não abriu em hover",
  );
  expect(
    await tooltipTrigger.getAttribute("aria-describedby") === await tooltip.getAttribute("id"),
    "Tooltip instalado não preservou aria-describedby",
  );
  const tooltipBox = await tooltip.boundingBox();
  if (tooltipBox) {
    await page.mouse.move(tooltipBox.x + tooltipBox.width / 2, tooltipBox.y + tooltipBox.height / 2);
    await page.waitForTimeout(180);
    expect(await tooltip.isVisible(), "Tooltip instalado não permaneceu aberto ao mover o pointer para o conteúdo");
  }
  await tooltipTrigger.focus();
  await page.keyboard.press("Escape");
  expect(
    await tooltip.waitFor({ state: "hidden", timeout: 3000 }).then(() => true, () => false),
    "Tooltip instalado não fechou com Escape",
  );
  expect(
    await waitForFocus(tooltipTrigger),
    "Tooltip instalado moveu foco para fora do trigger",
  );

  const toastTrigger = page.getByRole("button", { name: "Mostrar confirmação Toast" });
  await toastTrigger.click();
  const toast = page.locator('[data-slot="toast"]').first();
  expect(
    await toast.waitFor({ state: "visible", timeout: 3000 }).then(() => true, () => false),
    "Toast instalado não abriu",
  );
  expect(await toast.getAttribute("data-type") === "success", "Toast perdeu o tipo success");
  expect(await toast.getByText("Configuração confirmada").isVisible(), "Toast perdeu o título");
  expect(await toast.getByRole("button", { name: "Desfazer" }).isVisible(), "Toast perdeu a action");
  const toastBox = await toast.boundingBox();
  expect(
    toastBox && toastBox.x >= 0 && toastBox.x + toastBox.width <= 390,
    `Toast excedeu o viewport de 390px (${JSON.stringify(toastBox)})`,
  );
  await toast.getByRole("button", { name: "Desfazer" }).click();
  expect(
    await toast.isVisible(),
    "Action do Toast deveria manter a mensagem disponível até dismiss explícito",
  );
  await toast.getByRole("button", { name: "Dispensar" }).click();
  expect(
    await toast.waitFor({ state: "hidden", timeout: 3000 }).then(() => true, () => false),
    "Close do Toast não dispensou a mensagem",
  );

  await page.getByRole("button", { name: "Revisar alterações" }).click();
  const installedDialog = page.getByRole("dialog");
  expect(await installedDialog.isVisible(), "Dialog instalado não abriu");
  const installedDialogCloseIcon = installedDialog.getByRole("button", { name: "Fechar revisão" }).locator("svg");
  expect(await installedDialogCloseIcon.count() === 1, "Dialog instalado perdeu o ícone de fechar");
  expect(
    await installedDialogCloseIcon.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }),
    "Dialog instalado colapsou visualmente o ícone de fechar",
  );
  await page.keyboard.press("Escape");
  const dialogClosed = await page
    .getByRole("dialog")
    .waitFor({ state: "hidden", timeout: 3000 })
    .then(() => true, () => false);
  expect(dialogClosed, "Dialog instalado não fechou com Escape");

  await page.getByRole("button", { name: "Salvar preferências" }).click();
  expect(await page.getByText("Preferências salvas.").isVisible(), "Button instalado não submeteu o formulário");
  expect(await page.getByText("As alterações já estão disponíveis para esta conta.").isVisible(), "Alert instalado não refletiu o sucesso do consumer");
  await page.getByRole("button", { name: "Dispensar confirmação" }).click();
  expect(await page.getByText("Revise antes de salvar").isVisible(), "AlertClose instalado não delegou dismiss ao consumer");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow <= 1, `consumer criou overflow horizontal em 390px (${overflow}px)`);

  const submitButton = page.getByRole("button", { name: "Salvar preferências" });
  const buttonContract = await submitButton.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return { height: rect.height, radius: style.borderRadius };
  });
  expect(Math.abs(buttonContract.height - 40) <= 0.5, `Button instalado perdeu a altura md de 40px (${buttonContract.height}px)`);
  expect(buttonContract.radius === "8px", `Button instalado perdeu o radius de 8px (${buttonContract.radius})`);

  const axeLight = await new AxeBuilder({ page }).analyze();
  expect(axeLight.violations.length === 0, `consumer React light tem ${axeLight.violations.length} violações Axe: ${axeLight.violations.map((violation) => violation.id).join(", ")}`);

  const lightBackground = await page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.evaluate(() => {
    document.documentElement.dataset.mode = "dark";
  });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.waitForTimeout(200);
  const darkBackground = await page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(darkBackground !== lightBackground, "consumer instalado não aplicou o modo dark dos tokens TIS");

  await page.setViewportSize({ width: 320, height: 720 });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const narrowOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(narrowOverflow <= 1, `consumer criou overflow horizontal em 320px (${narrowOverflow}px)`);

  const axeDark = await new AxeBuilder({ page }).analyze();
  expect(
    axeDark.violations.length === 0,
    `consumer React dark tem ${axeDark.violations.length} violações Axe: ${axeDark.violations.map((violation) => `${violation.id} em ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`).join("; ")}`,
  );

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  console.log(`✅ PASS — ${REACT_REGISTRY_COMPONENTS.length} componentes instalados via @tis, Vite build, interação e Axe`);
} catch (error) {
  console.error(`\n❌ Consumer React/Vite inválido:\n${error.stack || error.message}`);
  console.error(`Fixture temporário: ${tempRoot}`);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  if (registryServer) await closeServer(registryServer);
  if (appServer) await closeServer(appServer);
  if (process.env.DS_KEEP_SHADCN_CONSUMER !== "1") {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}
