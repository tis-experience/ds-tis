#!/usr/bin/env node

import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const APP = path.join(ROOT, "tests", "consumer", "angular-app", "dist", "angular-consumer", "browser");
const STORYBOOK = path.join(ROOT, "storybook-angular-static");
const EVIDENCE = path.join(ROOT, "docs", "agents", "runs", "2026-08-28-angular-output", "evidence");
const failures = [];

for (const entry of [path.join(APP, "index.html"), path.join(STORYBOOK, "index.html")]) {
  if (!fs.existsSync(entry)) throw new Error(`artefacto browser ausente: ${entry}`);
}

const mime = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  const isStorybook = pathname.startsWith("/storybook/");
  const root = isStorybook ? STORYBOOK : APP;
  const relative = isStorybook ? pathname.slice("/storybook/".length) : pathname.slice(1);
  let file = path.resolve(root, relative || "index.html");
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": `${mime[path.extname(file)] ?? "application/octet-stream"}; charset=utf-8` });
  fs.createReadStream(file).pipe(response);
});
await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));

const expect = (condition, message) => { if (!condition) failures.push(message); };
const axe = async (label) => {
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.length === 0, `${label}: Axe encontrou ${result.violations.map((item) => item.id).join(", ")}`);
};

try {
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.locator("h1").waitFor();

  await page.locator('[data-testid="button-form"] [data-tis-angular-button]').first().click();
  expect((await page.locator('[data-testid="submit-count"]').textContent())?.includes("1"), "Button type=submit não submeteu o form nativo");

  const badges = page.locator("[data-tis-angular-badge]");
  expect(await badges.count() === 2, "Badge não renderizou os dois exemplos do consumer");
  expect(
    await badges.first().evaluate((node) =>
      node.textContent?.trim() === "Aprovado" &&
      node.getAttribute("data-tone") === "success" &&
      node.getAttribute("data-variant") === "subtle" &&
      node.classList.contains("ds-badge--success") &&
      node.classList.contains("ds-badge--subtle")),
    "Badge não preservou conteúdo, tom, variante ou classes públicas",
  );

  const input = page.getByRole("textbox", { name: "E-mail" });
  const inputWrapper = page.locator("tis-input .ds-input");
  expect(await input.getAttribute("name") === "email", "Input não encaminhou name ao elemento nativo");
  expect(await input.getAttribute("aria-describedby") !== null, "Input não associou helper por aria-describedby");
  expect(await input.getAttribute("required") !== null, "Input não encaminhou required ao elemento nativo");
  await page.getByRole("button", { name: "Guardar e-mail" }).click();
  await page.waitForFunction(() => document.querySelector("tis-input input")?.getAttribute("aria-invalid") === "true");
  expect(await input.getAttribute("aria-invalid") === "true", "Input required não expôs aria-invalid após submit");
  expect(await page.getByText("Digite um e-mail para continuar", { exact: true }).isVisible(), "Input não exibiu mensagem de erro associada");
  await input.fill("ana@empresa.com");
  await page.waitForFunction(() => document.querySelector('[data-testid="input-value"]')?.textContent?.includes("ana@empresa.com"));
  expect((await page.locator('[data-testid="input-value"]').textContent())?.includes("ana@empresa.com"), "ControlValueAccessor do Input não atualizou Angular Forms");
  expect(await input.getAttribute("aria-invalid") === null, "Input manteve estado inválido após valor válido");
  await input.focus();
  expect(await inputWrapper.evaluate((node) => node.matches(":focus-within")), "Input não expôs estado de foco no wrapper");

  const textarea = page.getByRole("textbox", { name: "Mensagem" });
  const textareaWrapper = page.locator("tis-textarea .ds-textarea");
  expect(await textarea.getAttribute("name") === "message", "Textarea não encaminhou name ao elemento nativo");
  expect((await textarea.getAttribute("aria-describedby"))?.split(" ").length === 2, "Textarea não associou contador e helper por aria-describedby");
  expect(await textarea.getAttribute("required") !== null, "Textarea não encaminhou required ao elemento nativo");
  await page.getByRole("button", { name: "Guardar mensagem" }).click();
  await page.waitForFunction(() => document.querySelector("tis-textarea textarea")?.getAttribute("aria-invalid") === "true");
  expect(await textarea.getAttribute("aria-invalid") === "true", "Textarea required não expôs aria-invalid após submit");
  expect(await page.getByText("Escreva uma mensagem para continuar", { exact: true }).isVisible(), "Textarea não exibiu mensagem de erro associada");
  await textarea.fill("Contexto para revisão.");
  await page.waitForFunction(() => document.querySelector('[data-testid="textarea-value"]')?.textContent?.includes("22"));
  expect((await page.locator("tis-textarea .ds-field__counter").textContent())?.includes("22/500"), "Textarea não atualizou o contador");
  expect(await textarea.getAttribute("aria-invalid") === null, "Textarea manteve estado inválido após valor válido");
  await textarea.focus();
  expect(await textareaWrapper.evaluate((node) => node.matches(":focus-within")), "Textarea não expôs estado de foco no wrapper");

  const checkbox = page.locator('tis-checkbox input[type="checkbox"]');
  expect(await checkbox.getAttribute("name") === "weeklySummary", "Checkbox não encaminhou name ao input nativo");
  expect(await checkbox.getAttribute("aria-describedby") !== null, "Checkbox não associou description/helper por aria-describedby");
  await page.getByRole("button", { name: "Guardar preferência" }).click();
  await page.waitForFunction(() => document.querySelector('tis-checkbox input[type="checkbox"]')?.getAttribute("aria-invalid") === "true");
  expect(await checkbox.getAttribute("aria-invalid") === "true", "Checkbox required não expôs aria-invalid após submit");
  expect(await page.getByText("Selecione esta opção para continuar", { exact: true }).isVisible(), "Checkbox não exibiu mensagem de erro associada");
  await page.keyboard.press("Shift+Tab");
  expect(await checkbox.evaluate((node) => node === document.activeElement), "Navegação por teclado não alcançou o Checkbox");
  expect(await checkbox.evaluate((node) => node.matches(":focus-visible")), "Checkbox não exibiu focus ring por teclado");
  await page.keyboard.press("Space");
  await page.waitForFunction(() => document.querySelector('[data-testid="checkbox-value"]')?.textContent?.includes("sim"));
  expect(await checkbox.isChecked(), "Space não marcou o Checkbox nativo");
  expect((await page.locator('[data-testid="checkbox-value"]').textContent())?.includes("sim"), "ControlValueAccessor não atualizou Angular Forms");
  expect(await checkbox.getAttribute("aria-invalid") === null, "Checkbox manteve estado inválido após seleção válida");

  const radioGroup = page.locator('tis-radio-group fieldset.ds-radio-group');
  const radios = page.locator('tis-radio-group input[type="radio"]');
  expect(await radios.count() === 3, "Radio não renderizou três opções nativas");
  expect(await radios.first().getAttribute("name") === "notificationChannel", "Radio não encaminhou name comum ao grupo");
  expect(await radios.nth(2).isDisabled(), "Radio não preservou disabled da opção");
  await page.getByRole("button", { name: "Guardar canal" }).click();
  await page.waitForFunction(() => document.querySelector('tis-radio-group fieldset')?.getAttribute("aria-invalid") === "true");
  expect(await radioGroup.getAttribute("aria-invalid") === "true", "Radio required não expôs aria-invalid após submit");
  expect(await page.getByText("Escolha um canal para continuar", { exact: true }).isVisible(), "Radio não exibiu mensagem de erro associada");
  await page.getByRole("button", { name: "Guardar canal" }).focus();
  await page.keyboard.press("Shift+Tab");
  const radioFocusState = await radios.evaluateAll((nodes) => nodes.map((node) => ({
    active: node === document.activeElement,
    disabled: node.disabled,
    focusVisible: node.matches(":focus-visible"),
  })));
  expect(
    radioFocusState.filter((state) => state.active && state.focusVisible && !state.disabled).length === 1,
    `Navegação por teclado ou focus ring do Radio inválidos (${JSON.stringify(radioFocusState)})`,
  );
  await page.keyboard.press("Space");
  await page.waitForFunction(() => !document.querySelector('[data-testid="radio-value"]')?.textContent?.includes("nenhum"));
  const firstRadioValue = (await page.locator('[data-testid="radio-value"]').textContent())?.trim();
  await page.keyboard.press("ArrowDown");
  await page.waitForFunction((previous) => document.querySelector('[data-testid="radio-value"]')?.textContent?.trim() !== previous, firstRadioValue);
  const selectedRadios = await radios.evaluateAll((nodes) => nodes
    .filter((node) => node.checked)
    .map((node) => node.value));
  expect(
    selectedRadios.length === 1 && selectedRadios[0] !== "push",
    `ArrowDown não moveu a seleção exclusiva ou ignorou disabled (${JSON.stringify(selectedRadios)})`,
  );
  expect((await page.locator('[data-testid="radio-value"]').textContent())?.includes(selectedRadios[0]), "ControlValueAccessor do Radio não atualizou Angular Forms");
  expect(await radioGroup.getAttribute("aria-invalid") === null, "Radio manteve estado inválido após seleção válida");

  const toggle = page.locator('tis-toggle input[role="switch"]');
  expect(await toggle.getAttribute("name") === "securityAlerts", "Toggle não encaminhou name ao input nativo");
  expect(await toggle.getAttribute("aria-describedby") !== null, "Toggle não associou description/helper por aria-describedby");
  expect(await toggle.isChecked(), "Toggle não recebeu o valor inicial do Angular Forms");
  await toggle.press("Space");
  await page.waitForFunction(() => document.querySelector('[data-testid="toggle-value"]')?.textContent?.includes("desligados"));
  expect(!(await toggle.isChecked()), "Space não desligou o Toggle nativo");
  expect(await toggle.evaluate((node) => node.matches(":focus-visible")), "Toggle não exibiu focus ring por teclado");
  expect((await page.locator('[data-testid="toggle-value"]').textContent())?.includes("desligados"), "ControlValueAccessor do Toggle não atualizou Angular Forms");

  const select = page.getByRole("combobox", { exact: true, name: "País" });
  const selectWrapper = page.locator("tis-select .ds-select");
  expect(await select.getAttribute("name") === "country", "Select não encaminhou name ao elemento nativo");
  expect(await select.getAttribute("aria-describedby") !== null, "Select não associou helper por aria-describedby");
  expect(await select.getAttribute("required") !== null, "Select não encaminhou required ao elemento nativo");
  expect(await select.inputValue() === "", "Select deveria iniciar no placeholder");
  await page.getByRole("button", { exact: true, name: "Guardar país" }).click();
  await page.waitForFunction(() => document.querySelector("tis-select select")?.getAttribute("aria-invalid") === "true");
  expect(await select.getAttribute("aria-invalid") === "true", "Select required não expôs aria-invalid após submit");
  expect(await page.getByText("Selecione um país para continuar", { exact: true }).isVisible(), "Select não exibiu mensagem de erro associada");
  await select.selectOption("cl");
  await page.waitForFunction(() => document.querySelector('[data-testid="select-value"]')?.textContent?.includes("cl"));
  expect(await select.inputValue() === "cl", "Select nativo não selecionou Chile");
  expect((await page.locator('[data-testid="select-value"]').textContent())?.includes("cl"), "ControlValueAccessor do Select não atualizou Angular Forms");
  expect(await select.getAttribute("aria-invalid") === null, "Select manteve estado inválido após seleção válida");
  await page.getByRole("button", { exact: true, name: "Guardar país" }).focus();
  await page.keyboard.press("Shift+Tab");
  expect(await select.evaluate((node) => node === document.activeElement), "Navegação por teclado não alcançou o Select");
  expect(await selectWrapper.evaluate((node) => node.matches(":focus-within")), "Select não expôs estado de foco no wrapper");

  const combobox = page.getByRole("combobox", { exact: true, name: "Buscar país" });
  const comboboxWrapper = page.locator("tis-combobox .ds-combobox");
  expect(await combobox.getAttribute("name") === "searchCountry", "Combobox não encaminhou name ao input nativo");
  expect(await combobox.getAttribute("aria-describedby") !== null, "Combobox não associou helper por aria-describedby");
  expect(await combobox.getAttribute("required") !== null, "Combobox não encaminhou required ao input nativo");
  expect(await combobox.getAttribute("aria-expanded") === "false", "Combobox deveria iniciar fechado");
  await page.getByRole("button", { exact: true, name: "Guardar país filtrado" }).click();
  await page.waitForFunction(() => document.querySelector("tis-combobox input")?.getAttribute("aria-invalid") === "true");
  expect(await page.getByText("Selecione um país para continuar", { exact: true }).isVisible(), "Combobox não exibiu mensagem de erro associada");
  await combobox.fill("Bra");
  await page.waitForFunction(() => document.querySelectorAll("tis-combobox .ds-combobox__option").length === 1);
  expect(await combobox.getAttribute("aria-expanded") === "true", "Combobox não abriu ao filtrar");
  expect((await page.locator("tis-combobox .ds-combobox__option").textContent())?.trim() === "Brasil", "Combobox não filtrou a lista");
  await combobox.press("ArrowDown");
  expect(Boolean(await combobox.getAttribute("aria-activedescendant")), "Combobox não expôs aria-activedescendant ao navegar");
  await combobox.press("Enter");
  await page.waitForFunction(() => document.querySelector('[data-testid="combobox-value"]')?.textContent?.includes("br"));
  expect(await combobox.inputValue() === "Brasil", "Combobox não refletiu o label selecionado no input");
  expect(await combobox.getAttribute("aria-expanded") === "false", "Combobox não fechou após selecionar");
  expect((await page.locator('[data-testid="combobox-value"]').textContent())?.includes("br"), "ControlValueAccessor do Combobox não atualizou Angular Forms");
  expect(await combobox.getAttribute("aria-invalid") === null, "Combobox manteve estado inválido após seleção válida");
  await page.locator("tis-combobox .ds-combobox__clear").click();
  await page.waitForFunction(() => document.querySelector('[data-testid="combobox-value"]')?.textContent?.includes("nenhum"));
  expect(await combobox.inputValue() === "", "Clear do Combobox não limpou o input");
  await combobox.fill("Ind");
  await combobox.press("ArrowDown");
  await combobox.press("Enter");
  expect((await page.locator('[data-testid="combobox-value"]').textContent())?.includes("nenhum"), "Combobox selecionou opção disabled");
  await combobox.press("Escape");
  await page.waitForFunction(() => document.querySelector("tis-combobox input")?.getAttribute("aria-expanded") === "false");
  expect(await combobox.getAttribute("aria-expanded") === "false", "Escape não fechou o Combobox");
  expect(await combobox.evaluate((node) => node === document.activeElement), "Combobox não preservou foco no input após Escape");
  expect(await comboboxWrapper.evaluate((node) => node.matches(":focus-within")), "Combobox não expôs estado de foco no wrapper");

  const menuTrigger = page.getByRole("button", { name: "Ações do documento" });
  const menu = page.getByRole("menu", { name: "Ações do documento" });
  const menuItems = menu.getByRole("menuitem");
  expect(await menuTrigger.getAttribute("aria-expanded") === "false", "Menu deveria iniciar fechado");
  await menuTrigger.click();
  await page.waitForFunction(() => document.querySelector("[data-tis-angular-menu-trigger]")?.getAttribute("aria-expanded") === "true");
  expect(await menu.isVisible(), "Menu não abriu pelo trigger");
  expect(await menuItems.count() === 3, "Menu não renderizou os três comandos");
  expect(await menuItems.first().evaluate((node) => node === document.activeElement), "Menu não focou o primeiro comando ao abrir");
  await page.keyboard.press("ArrowDown");
  expect(await menuItems.nth(1).getAttribute("aria-disabled") === "true", "Menu não preservou aria-disabled");
  expect(await menuItems.nth(1).evaluate((node) => node === document.activeElement), "Menu disabled não permaneceu alcançável por setas");
  await page.keyboard.press("Enter");
  expect(await menuTrigger.getAttribute("aria-expanded") === "true", "Menu ativou indevidamente um item disabled");
  await page.keyboard.type("Ex");
  expect(await menuItems.nth(2).evaluate((node) => node === document.activeElement), "Typeahead do Menu não encontrou Excluir");
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.querySelector("[data-tis-angular-menu-trigger]")?.getAttribute("aria-expanded") === "false");
  expect(await menuTrigger.getAttribute("aria-expanded") === "false", "Escape não fechou o Menu");
  expect(await menuTrigger.evaluate((node) => node === document.activeElement), "Menu não retornou foco ao trigger após Escape");
  await menuTrigger.click();
  await menuItems.first().click();
  await page.waitForFunction(() => document.querySelector('[data-testid="menu-action"]')?.textContent?.includes("edit"));
  expect(await menuTrigger.getAttribute("aria-expanded") === "false", "Menu não fechou após comando habilitado");
  expect((await page.locator('[data-testid="menu-action"]').textContent())?.includes("edit"), "Menu não emitiu o comando selecionado");

  const tooltipTrigger = page.locator("[data-tis-angular-tooltip-trigger]");
  const tooltipContent = page.locator(".tis-angular-tooltip-overlay [role=\"tooltip\"]");
  expect(await tooltipContent.count() === 0, "Tooltip deveria iniciar fechado");
  await tooltipTrigger.focus();
  await tooltipContent.waitFor({ state: "visible" });
  const tooltipId = await tooltipContent.getAttribute("id");
  expect(Boolean(tooltipId), "Tooltip não gerou id estável");
  expect(
    (await tooltipTrigger.getAttribute("aria-describedby"))?.split(/\s+/).includes(tooltipId),
    "Tooltip não associou trigger e conteúdo por aria-describedby",
  );
  expect(await tooltipTrigger.evaluate((node) => node === document.activeElement), "Tooltip moveu o foco para fora do trigger");
  await page.keyboard.press("Escape");
  await tooltipContent.waitFor({ state: "detached" });
  expect(await tooltipTrigger.evaluate((node) => node === document.activeElement), "Tooltip não preservou foco no trigger após Escape");

  await page.getByRole("button", { exact: true, name: "Guardar país" }).focus();
  await page.mouse.move(0, 0);
  await tooltipTrigger.hover();
  await tooltipContent.waitFor({ state: "visible" });
  await page.waitForTimeout(40);
  const tooltipBox = await tooltipContent.boundingBox();
  if (tooltipBox) await page.mouse.move(tooltipBox.x + tooltipBox.width / 2, tooltipBox.y + tooltipBox.height / 2);
  await page.waitForTimeout(180);
  expect(await tooltipContent.isVisible(), "Tooltip não permaneceu aberto com o ponteiro sobre o conteúdo");
  await page.mouse.move(0, 0);
  await tooltipContent.waitFor({ state: "detached" });

  const toastTrigger = page.getByRole("button", { exact: true, name: "Mostrar Toast" });
  await toastTrigger.click();
  const toast = page.locator("[data-tis-angular-toast]").first();
  await toast.waitFor({ state: "visible" });
  expect(await page.locator(".ds-toast-region__polite").getAttribute("role") === "status", "Toast não expôs região polite");
  expect(await page.locator(".ds-toast-region__assertive").getAttribute("role") === "alert", "Toast não expôs região assertive");
  await toast.getByRole("button", { name: "Desfazer" }).click();
  expect(await toast.isVisible(), "Action do Toast dispensou a mensagem indevidamente");
  await page.waitForFunction(() => document.querySelector('[data-testid="toast-action-count"]')?.textContent?.includes("1"));
  expect((await page.locator('[data-testid="toast-action-count"]').textContent())?.includes("1"), "Action do Toast não executou callback");
  await toast.getByRole("button", { name: "Dispensar" }).focus();
  await page.keyboard.press("Escape");
  await toast.waitFor({ state: "detached" });

  await toastTrigger.click();
  const contextualToast = page.locator("[data-tis-angular-toast]").first();
  await contextualToast.waitFor({ state: "visible" });
  await toastTrigger.focus();
  await page.keyboard.press("Escape");
  expect(await contextualToast.isVisible(), "Escape fora do Toast dispensou a mensagem");
  await contextualToast.getByRole("button", { name: "Dispensar" }).click();
  await contextualToast.waitFor({ state: "detached" });

  for (let index = 0; index < 6; index += 1) await toastTrigger.click();
  expect(await page.locator("[data-tis-angular-toast]").count() === 5, "Toast não limitou a fila visível a cinco mensagens");
  while (await page.locator("[data-tis-angular-toast] .ds-toast__close").count()) {
    await page.locator("[data-tis-angular-toast] .ds-toast__close").first().evaluate((button) => button.click());
  }

  const tabs = page.locator("button[tistab]");
  const tabPanels = page.locator("[tistabpanel]");
  expect(await tabs.count() === 3, "Tabs não renderizou três tabs");
  expect(await tabs.nth(0).getAttribute("aria-selected") === "true", "Tabs não selecionou o primeiro item inicialmente");
  expect(await tabPanels.evaluateAll((nodes) => nodes.filter((node) => !node.hidden).length) === 1, "Tabs deve manter apenas um painel visível");
  expect(await tabs.nth(2).isDisabled(), "Tabs não preservou disabled nativo");
  await tabs.nth(0).focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() => document.querySelectorAll("button[tistab]")[1]?.getAttribute("aria-selected") === "true");
  expect(await tabs.nth(1).evaluate((node) => node === document.activeElement), "ArrowRight não moveu o foco no Tabs");
  expect(await tabs.nth(1).getAttribute("aria-selected") === "true", "Tabs em follow mode não acompanhou o foco");
  expect((await page.locator('[data-testid="tabs"] [role="status"]').textContent())?.includes("team"), "Tabs não sincronizou selectedTab no consumer");
  await page.keyboard.press("End");
  expect(await tabs.nth(1).evaluate((node) => node === document.activeElement), "End deveria ignorar a tab disabled");
  await page.keyboard.press("Home");
  expect(await tabs.nth(0).evaluate((node) => node === document.activeElement), "Home não retornou à primeira tab");
  expect(await tabs.nth(0).evaluate((node) => node.matches(":focus-visible")), "Tabs não preservou focus ring por teclado");

  const triggers = page.locator("button[tisaccordiontrigger]");
  expect(await triggers.count() === 3, "Accordion não renderizou três triggers");
  await triggers.nth(1).click();
  await page.waitForTimeout(150);
  const accordionState = await triggers.evaluateAll((nodes) => nodes.map((node) => ({
    disabled: node.hasAttribute("disabled"),
    expanded: node.getAttribute("aria-expanded"),
  })));
  expect(await triggers.nth(0).getAttribute("aria-expanded") === "false", `Accordion single não recolheu o primeiro item (${JSON.stringify(accordionState)})`);
  expect(await triggers.nth(1).getAttribute("aria-expanded") === "true", `Accordion single não expandiu o segundo item (${JSON.stringify(accordionState)})`);
  expect(
    !(await triggers.nth(1).evaluate((node) => node.matches(":focus-visible"))),
    "Accordion manteve focus ring de teclado após pointer click",
  );
  expect(
    !(await triggers.nth(1).evaluate((node) => node === document.activeElement)),
    "Accordion deveria manter a interação por pointer sem foco persistente",
  );
  await triggers.nth(0).focus();
  await page.keyboard.press("ArrowDown");
  expect(await triggers.nth(1).evaluate((node) => node === document.activeElement), "ArrowDown não moveu foco no Accordion");
  expect(await triggers.nth(1).evaluate((node) => node.matches(":focus-visible")), "ArrowDown não preservou focus ring de teclado");
  await page.keyboard.press("End");
  expect(await triggers.nth(1).evaluate((node) => node === document.activeElement), "End deveria ignorar o item disabled");
  await page.keyboard.press("Home");
  expect(await triggers.nth(0).evaluate((node) => node === document.activeElement), "Home não retornou ao primeiro trigger");
  expect(await triggers.nth(2).isDisabled(), "item disabled do Accordion perdeu disabled nativo");

  const popoverTrigger = page.locator("[data-tis-angular-popover-trigger]");
  await popoverTrigger.click();
  const panel = page.locator(".tis-angular-popover-overlay .ds-popover__panel");
  await panel.waitFor();
  expect(await popoverTrigger.getAttribute("aria-expanded") === "true", "Popover não sincronizou aria-expanded");
  expect(await popoverTrigger.getAttribute("aria-controls") === await panel.getAttribute("id"), "Popover não associou trigger e panel");
  await page.waitForFunction(() => document.querySelector(".tis-angular-popover-overlay select") === document.activeElement).catch(() => {});
  expect(await page.locator(".tis-angular-popover-overlay select").evaluate((node) => node === document.activeElement), "Popover não moveu foco inicial");
  await page.keyboard.press("Escape");
  await panel.waitFor({ state: "detached" });
  await page.waitForFunction(() => document.querySelector('[data-testid="close-reason"]')?.textContent?.includes("escape")).catch(() => {});
  expect(await popoverTrigger.evaluate((node) => node === document.activeElement), "Popover não retornou foco após Escape");
  expect((await page.locator('[data-testid="close-reason"]').textContent())?.includes("escape"), "Popover não emitiu razão Escape");

  await popoverTrigger.click();
  await panel.waitFor();
  await page.locator("h1").click({ position: { x: 2, y: 2 } });
  await panel.waitFor({ state: "detached" });
  expect(await popoverTrigger.evaluate((node) => node === document.activeElement), "Popover não retornou foco após click externo");

  const modalTrigger = page.getByRole("button", { name: "Revisar alterações" });
  await modalTrigger.click();
  const modal = page.locator(".tis-angular-modal-pane .ds-modal");
  await modal.waitFor();
  expect(await modal.getAttribute("role") === "dialog", "Modal não expôs role=dialog");
  expect(await modal.getAttribute("aria-modal") === "true", "Modal não expôs aria-modal=true");
  const modalTitleId = await modal.getAttribute("aria-labelledby");
  const modalDescriptionId = await modal.getAttribute("aria-describedby");
  expect(Boolean(modalTitleId) && await page.locator(`#${modalTitleId}`).count() === 1, "Modal não associou title por aria-labelledby");
  expect(Boolean(modalDescriptionId) && await page.locator(`#${modalDescriptionId}`).count() === 1, "Modal não associou description por aria-describedby");
  expect(
    await page.locator("#consumer-modal-name").evaluate((node) => node === document.activeElement),
    "Modal não moveu foco para o marcador inicial",
  );
  expect(
    await page.locator("html").evaluate((node) => node.classList.contains("cdk-global-scrollblock")),
    "Modal não bloqueou scroll da página",
  );
  const modalClose = modal.getByRole("button", { name: "Fechar modal" });
  const modalSave = modal.getByRole("button", { name: "Guardar" });
  await modalClose.focus();
  await page.keyboard.press("Shift+Tab");
  expect(await modalSave.evaluate((node) => node === document.activeElement), "Shift+Tab escapou do focus trap do Modal");
  await page.keyboard.press("Tab");
  expect(await modalClose.evaluate((node) => node === document.activeElement), "Tab escapou do focus trap do Modal");
  await axe("consumer modal light");
  await page.keyboard.press("Escape");
  await modal.waitFor({ state: "detached" });
  await page.waitForFunction(() => document.querySelector('[data-testid="modal-close-reason"]')?.textContent?.includes("escape")).catch(() => {});
  expect(await modalTrigger.evaluate((node) => node === document.activeElement), "Modal não retornou foco após Escape");
  expect((await page.locator('[data-testid="modal-close-reason"]').textContent())?.includes("escape"), "Modal não emitiu razão Escape");

  await modalTrigger.click();
  await modal.waitFor();
  await page.locator(".tis-angular-modal-backdrop").click({ position: { x: 2, y: 2 } });
  await modal.waitFor({ state: "detached" });
  await page.waitForFunction(() => document.querySelector('[data-testid="modal-close-reason"]')?.textContent?.includes("backdrop")).catch(() => {});
  expect(await modalTrigger.evaluate((node) => node === document.activeElement), "Modal não retornou foco após backdrop");
  expect((await page.locator('[data-testid="modal-close-reason"]').textContent())?.includes("backdrop"), "Modal não emitiu razão backdrop");

  await axe("consumer light");
  await page.getByRole("button", { name: "Tema escuro" }).click();
  expect(await page.locator("html").getAttribute("data-theme") === "dark", "tema dark não foi aplicado");
  await modalTrigger.click();
  await modal.waitFor();
  const modalDarkSurface = await modal.evaluate((node) => {
    const probe = document.createElement("div");
    probe.style.background = "var(--ds-modal-bg-default)";
    document.body.append(probe);
    const result = {
      actual: getComputedStyle(node).backgroundColor,
      expected: getComputedStyle(probe).backgroundColor,
    };
    probe.remove();
    return result;
  });
  expect(modalDarkSurface.actual === modalDarkSurface.expected, `Modal não consumiu superfície dark (${JSON.stringify(modalDarkSurface)})`);
  await axe("consumer modal dark");
  await page.keyboard.press("Escape");
  await modal.waitFor({ state: "detached" });
  await axe("consumer dark");

  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
    await page.reload({ waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow <= 1, `${width}px: overflow horizontal de ${overflow}px`);
    const responsiveBadges = await page.locator("[data-tis-angular-badge]").evaluateAll((nodes) => nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        height: rect.height,
        left: rect.left,
        right: rect.right,
        viewport: document.documentElement.clientWidth,
        width: rect.width,
      };
    }));
    expect(
      responsiveBadges.length === 2 && responsiveBadges.every((geometry) =>
        geometry.width > geometry.height && geometry.height > 0 &&
        geometry.width < geometry.viewport * 0.75 &&
        geometry.left >= 0 && geometry.right <= geometry.viewport),
      `${width}px: Badge cortado ou deformado (${JSON.stringify(responsiveBadges)})`,
    );
    const responsiveCombobox = page.getByRole("combobox", { exact: true, name: "Buscar país" });
    await responsiveCombobox.fill("Bra");
    const responsiveComboboxGeometry = await page.locator("tis-combobox .ds-combobox-anchor").evaluate((node) => {
      const control = node.querySelector(".ds-combobox")?.getBoundingClientRect();
      const listbox = node.querySelector(".ds-combobox__listbox")?.getBoundingClientRect();
      return {
        controlHeight: control?.height ?? 0,
        controlLeft: control?.left ?? -1,
        controlRight: control?.right ?? -1,
        listboxLeft: listbox?.left ?? -1,
        listboxRight: listbox?.right ?? -1,
        viewport: document.documentElement.clientWidth,
      };
    });
    expect(
      responsiveComboboxGeometry.controlHeight === 40 &&
        responsiveComboboxGeometry.controlLeft >= 0 &&
        responsiveComboboxGeometry.controlRight <= responsiveComboboxGeometry.viewport &&
        responsiveComboboxGeometry.listboxLeft >= 0 &&
        responsiveComboboxGeometry.listboxRight <= responsiveComboboxGeometry.viewport,
      `${width}px: Combobox ou listbox cortado/desalinhado (${JSON.stringify(responsiveComboboxGeometry)})`,
    );
    await responsiveCombobox.press("Escape");
    const responsiveMenuTrigger = page.getByRole("button", { name: "Ações do documento" });
    await responsiveMenuTrigger.click();
    const responsiveMenu = page.getByRole("menu", { name: "Ações do documento" });
    await responsiveMenu.waitFor({ state: "visible" });
    await page.waitForFunction(() => {
      const menu = document.querySelector("[data-tis-angular-menu]");
      return Boolean(menu && getComputedStyle(menu).display !== "none" &&
        menu.getBoundingClientRect().right <= document.documentElement.clientWidth);
    });
    const responsiveMenuGeometry = await responsiveMenu.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        viewport: document.documentElement.clientWidth,
      };
    });
    expect(
      responsiveMenuGeometry.left >= 0 && responsiveMenuGeometry.right <= responsiveMenuGeometry.viewport,
      `${width}px: Menu excedeu o viewport (${JSON.stringify(responsiveMenuGeometry)})`,
    );
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Revisar alterações" }).click();
    const responsiveModal = page.locator(".tis-angular-modal-pane .ds-modal");
    await responsiveModal.waitFor();
    const responsiveGeometry = await responsiveModal.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        viewport: document.documentElement.clientWidth,
      };
    });
    expect(
      responsiveGeometry.left >= 0 && responsiveGeometry.right <= responsiveGeometry.viewport,
      `${width}px: Modal excedeu o viewport (${JSON.stringify(responsiveGeometry)})`,
    );
    const responsiveRadios = await page.locator('tis-radio-group input[type="radio"]').evaluateAll((nodes) => nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      const label = node.closest("label")?.getBoundingClientRect();
      return {
        height: rect.height,
        width: rect.width,
        inside: Boolean(label && rect.top >= label.top && rect.bottom <= label.bottom),
      };
    }));
    expect(
      responsiveRadios.length === 3 && responsiveRadios.every((geometry) => geometry.width === geometry.height && geometry.width > 0 && geometry.inside),
      `${width}px: Radio cortado, deformado ou desalinhado (${JSON.stringify(responsiveRadios)})`,
    );
    const responsiveToggle = await page.locator('tis-toggle input[role="switch"]').evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const label = node.closest("label")?.getBoundingClientRect();
      return {
        height: rect.height,
        width: rect.width,
        inside: Boolean(label && rect.top >= label.top && rect.bottom <= label.bottom),
      };
    });
    expect(
      responsiveToggle.width === 44 && responsiveToggle.height === 24 && responsiveToggle.inside,
      `${width}px: Toggle cortado, deformado ou desalinhado (${JSON.stringify(responsiveToggle)})`,
    );
    const responsiveFields = await page.locator("tis-input .ds-input, tis-textarea .ds-textarea").evaluateAll((nodes) => nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      const field = node.querySelector("input, textarea")?.getBoundingClientRect();
      return {
        bottom: rect.bottom,
        fieldHeight: field?.height ?? 0,
        fieldWidth: field?.width ?? 0,
        height: rect.height,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        viewport: document.documentElement.clientWidth,
        width: rect.width,
      };
    }));
    expect(
      responsiveFields.length === 2 && responsiveFields.every((geometry) =>
        geometry.width > 0 && geometry.height > 0 && geometry.height < 180 &&
        geometry.left >= 0 && geometry.right <= geometry.viewport &&
        geometry.fieldWidth <= geometry.width + 4 && geometry.fieldHeight <= geometry.height + 4 &&
        geometry.bottom > geometry.top),
      `${width}px: Input/Textarea cortado, desproporcional ou fora do viewport (${JSON.stringify(responsiveFields)})`,
    );
    const responsiveSelect = await page.locator("tis-select .ds-select").evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const field = node.querySelector("select")?.getBoundingClientRect();
      return {
        fieldHeight: field?.height ?? 0,
        fieldWidth: field?.width ?? 0,
        height: rect.height,
        viewport: document.documentElement.clientWidth,
        width: rect.width,
        left: rect.left,
        right: rect.right,
      };
    });
    expect(
      responsiveSelect.height === 40 && responsiveSelect.width > responsiveSelect.height &&
        responsiveSelect.left >= 0 && responsiveSelect.right <= responsiveSelect.viewport &&
        responsiveSelect.fieldHeight <= responsiveSelect.height + 4 &&
        responsiveSelect.fieldWidth <= responsiveSelect.width + 4,
      `${width}px: Select cortado, deformado ou com field desproporcional (${JSON.stringify(responsiveSelect)})`,
    );
    const responsiveTooltipTrigger = page.locator("[data-tis-angular-tooltip-trigger]");
    await responsiveTooltipTrigger.focus();
    const responsiveTooltip = page.locator(".tis-angular-tooltip-overlay [role=\"tooltip\"]");
    await responsiveTooltip.waitFor({ state: "visible" });
    const responsiveTooltipGeometry = await responsiveTooltip.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        bottom: rect.bottom,
        height: rect.height,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        viewportHeight: window.innerHeight,
        viewportWidth: document.documentElement.clientWidth,
        width: rect.width,
      };
    });
    expect(
      responsiveTooltipGeometry.width > 0 && responsiveTooltipGeometry.height > 0 &&
        responsiveTooltipGeometry.left >= 0 && responsiveTooltipGeometry.right <= responsiveTooltipGeometry.viewportWidth &&
        responsiveTooltipGeometry.top >= 0 && responsiveTooltipGeometry.bottom <= responsiveTooltipGeometry.viewportHeight,
      `${width}px: Tooltip cortado ou fora do viewport (${JSON.stringify(responsiveTooltipGeometry)})`,
    );
    await page.keyboard.press("Escape");
    await responsiveTooltip.waitFor({ state: "detached" });
    await responsiveModal.getByRole("button", { name: "Cancelar" }).click();
    await responsiveModal.waitFor({ state: "detached" });
    await page.getByRole("button", { exact: true, name: "Mostrar Toast" }).click();
    const responsiveToast = page.locator("[data-tis-angular-toast]").first();
    await responsiveToast.waitFor({ state: "visible" });
    const responsiveToastGeometry = await responsiveToast.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        bottom: rect.bottom,
        height: rect.height,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        viewportHeight: window.innerHeight,
        viewportWidth: document.documentElement.clientWidth,
        width: rect.width,
      };
    });
    expect(
      responsiveToastGeometry.width > 0 && responsiveToastGeometry.height >= 80 &&
        responsiveToastGeometry.left >= 0 && responsiveToastGeometry.right <= responsiveToastGeometry.viewportWidth &&
        responsiveToastGeometry.top >= 0 && responsiveToastGeometry.bottom <= responsiveToastGeometry.viewportHeight,
      `${width}px: Toast cortado ou fora do viewport (${JSON.stringify(responsiveToastGeometry)})`,
    );
    await page.screenshot({ path: path.join(EVIDENCE, `angular-consumer-${width}.png`), fullPage: true });
    await responsiveToast.getByRole("button", { name: "Dispensar" }).click();
    await responsiveToast.waitFor({ state: "detached" });
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Revisar alterações" }).click();
  await page.locator(".tis-angular-modal-pane .ds-modal").waitFor();
  const visualParity = await page.evaluate(() => {
    const pick = (node, properties) => {
      const styles = getComputedStyle(node);
      return Object.fromEntries(properties.map((property) => [property, styles.getPropertyValue(property)]));
    };
    const compare = (actualSelector, referenceClass, properties, tagName = "button", inputType = "checkbox", inputRootClass = "ds-checkbox-label", inputChecked = false) => {
      const actual = document.querySelector(actualSelector);
      const reference = document.createElement(tagName);
      reference.className = referenceClass;
      if (tagName === "input") {
        reference.type = inputType;
        reference.checked = inputChecked;
      }
      reference.textContent = "Referência";
      const referenceRoot = tagName === "input" ? document.createElement("label") : reference;
      if (tagName === "input") {
        referenceRoot.className = inputRootClass;
        referenceRoot.append(reference);
      }
      document.body.append(referenceRoot);
      const result = { actual: pick(actual, properties), reference: pick(reference, properties) };
      referenceRoot.remove();
      return result;
    };
    const compareSelect = () => {
      const actual = document.querySelector("tis-select .ds-select");
      const reference = document.createElement("div");
      reference.className = "ds-select ds-select--md";
      reference.innerHTML = '<select class="ds-select__field"><option value="">Selecione…</option></select><span class="ds-select__arrow" aria-hidden="true"></span>';
      document.body.append(reference);
      const properties = ["height", "padding-inline-start", "padding-inline-end", "border-radius", "background-color", "color", "font-size"];
      const result = { actual: pick(actual, properties), reference: pick(reference, properties) };
      reference.remove();
      return result;
    };
    const compareField = (actualSelector, rootClass, fieldMarkup, properties) => {
      const actual = document.querySelector(actualSelector);
      const reference = document.createElement("div");
      reference.className = rootClass;
      reference.innerHTML = fieldMarkup;
      document.body.append(reference);
      const result = { actual: pick(actual, properties), reference: pick(reference, properties) };
      reference.remove();
      return result;
    };
    return {
      badge: compare("[data-tis-angular-badge]", "ds-badge ds-badge--success ds-badge--subtle", ["align-items", "padding-inline-start", "padding-inline-end", "border-radius", "background-color", "color", "font-size", "line-height"]),
      button: compare(".consumer-section [data-tis-angular-button]", "ds-button ds-button--brand ds-button--md", ["padding-inline-start", "padding-inline-end", "border-radius", "background-color", "color", "font-size"]),
      accordion: compare("button[tisaccordiontrigger]", "ds-accordion__trigger", ["min-block-size", "padding-inline-start", "padding-inline-end", "border-radius", "background-color", "color", "font-size"]),
      checkbox: compare('tis-checkbox input[type="checkbox"]', "ds-checkbox", ["width", "height", "border-radius", "background-color", "border-color"], "input"),
      combobox: compareField("tis-combobox .ds-combobox", "ds-combobox ds-combobox--md", '<input class="ds-combobox__input">', ["height", "padding-inline-start", "padding-inline-end", "border-radius", "background-color", "color", "font-size"]),
      input: compareField("tis-input .ds-input", "ds-input ds-input--md ds-input--filled", '<input class="ds-input__field" value="ana@empresa.com">', ["height", "padding-inline-start", "padding-inline-end", "border-radius", "background-color", "color", "font-size"]),
      radio: compare('tis-radio-group input[type="radio"]', "ds-radio", ["width", "height", "border-radius", "background-color", "border-color"], "input", "radio", "ds-radio-label"),
      select: compareSelect(),
      tabs: compare("button[tistab]", "ds-tab ds-tab--active", ["padding-inline-start", "padding-inline-end", "border-bottom-width", "border-bottom-color", "color", "font-size"]),
      textarea: compareField("tis-textarea .ds-textarea", "ds-textarea ds-textarea--md ds-textarea--filled", '<textarea class="ds-textarea__field">Contexto para revisão.</textarea>', ["border-radius", "background-color", "color", "font-size"]),
      toggle: compare('tis-toggle input[role="switch"]', "ds-toggle", ["width", "height", "border-radius", "background-color", "border-color"], "input", "checkbox", "ds-toggle-label", true),
      modal: compare(".tis-angular-modal-pane .ds-modal", "ds-modal ds-modal--md", ["padding-inline-start", "padding-inline-end", "border-radius", "background-color", "color", "max-height"], "div"),
    };
  });
  for (const [component, comparison] of Object.entries(visualParity)) {
    expect(
      JSON.stringify(comparison.actual) === JSON.stringify(comparison.reference),
      `${component}: estilos computados divergem da referência HTML/CSS (${JSON.stringify(comparison)})`,
    );
  }

  const storyContracts = [
    ["angular-button--playground", "tis-button"],
    ["angular-badge--playground", "tis-badge"],
    ["angular-accordion--playground", "[tisAccordion]"],
    ["angular-checkbox--playground", "tis-checkbox"],
    ["angular-combobox--playground", "tis-combobox"],
    ["angular-input--playground", "tis-input"],
    ["angular-menu--playground", "[tisActionMenu]"],
    ["angular-radio--playground", "tis-radio-group"],
    ["angular-select--playground", "tis-select"],
    ["angular-tabs--playground", "[tisTabs]"],
    ["angular-textarea--playground", "tis-textarea"],
    ["angular-toast--playground", "tis-toast-region"],
    ["angular-toggle--playground", "tis-toggle"],
    ["angular-tooltip--playground", "tis-tooltip"],
    ["angular-modal--playground", "tis-modal"],
    ["angular-popover--playground", "tis-popover"],
  ];
  for (const [storyId, componentSelector] of storyContracts) {
    await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=${storyId}&globals=mode:light`, { waitUntil: "networkidle" });
    expect(await page.locator("#storybook-root").count() === 1, `${storyId}: root do Storybook ausente`);
    expect(await page.locator(componentSelector).count() >= 1, `${storyId}: componente Angular não renderizado`);
    const result = await new AxeBuilder({ page }).analyze();
    expect(result.violations.length === 0, `Storybook ${storyId}: Axe encontrou ${result.violations.map((item) => item.id).join(", ")}`);
  }

  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-badge--tons&globals=mode:dark`, { waitUntil: "networkidle" });
  const storyBadges = page.locator("[data-tis-angular-badge]");
  expect(await storyBadges.count() === 12, "Story de tons do Badge não renderizou a matriz completa");
  const badgeStoryGeometry = await storyBadges.evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      background: style.backgroundColor,
      bottom: rect.bottom,
      height: rect.height,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      width: rect.width,
    };
  }));
  expect(
    badgeStoryGeometry.every((geometry) =>
      geometry.width > geometry.height && geometry.height > 0 &&
      geometry.left >= 0 && geometry.right <= 320 &&
      geometry.top >= 0 && geometry.bottom <= 640 &&
      geometry.background !== "rgba(0, 0, 0, 0)"),
    `Story do Badge ficou cortado, deformado ou sem superfície em 320px (${JSON.stringify(badgeStoryGeometry)})`,
  );
  expect(await page.locator("html").getAttribute("data-mode") === "dark", "Story do Badge não recebeu tema dark");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), "Story do Badge criou overflow horizontal em 320px");
  await axe("Storybook Badge dark 320px");

  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-menu--escolhas&globals=mode:dark`, { waitUntil: "networkidle" });
  const storyMenuTrigger = page.getByRole("button", { name: "Preferências" });
  await storyMenuTrigger.click();
  await page.waitForFunction(() => document.querySelector("[data-tis-angular-menu-trigger]")?.getAttribute("aria-expanded") === "true");
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const storyMenu = page.getByRole("menu", { name: "Preferências de visualização" });
  const storyMenuGeometry = await storyMenu.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      mode: document.documentElement.dataset.mode,
      viewport: document.documentElement.clientWidth,
    };
  });
  expect(storyMenuGeometry.mode === "dark", "Story do Menu não recebeu tema dark");
  expect(
    storyMenuGeometry.left >= 0 && storyMenuGeometry.right <= storyMenuGeometry.viewport,
    `Story do Menu ficou cortado em 320px (${JSON.stringify(storyMenuGeometry)})`,
  );
  expect(await storyMenu.getByRole("menuitemradio").count() === 2, "Story do Menu não expôs itens radio");
  expect(await storyMenu.getByRole("menuitemcheckbox").count() === 1, "Story do Menu não expôs item checkbox");
  expect(await storyMenu.getByRole("menuitemradio").first().evaluate((node) => node === document.activeElement), "Story do Menu não moveu foco para o primeiro item");
  await axe("Storybook Menu dark 320px");
  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-tabs--playground&globals=mode:dark`, { waitUntil: "networkidle" });
  const storyTabs = page.locator("button[tistab]");
  const storyPanels = page.locator("[tistabpanel]");
  expect(await storyTabs.count() === 3, "Story do Tabs não renderizou a coleção completa");
  expect(await storyTabs.nth(0).getAttribute("aria-selected") === "true", "Story do Tabs perdeu a seleção inicial");
  expect(await storyPanels.evaluateAll((nodes) => nodes.filter((node) => !node.hidden).length) === 1, "Story do Tabs exibiu mais de um painel");
  await storyTabs.nth(0).focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() => document.querySelectorAll("button[tistab]")[1]?.getAttribute("aria-selected") === "true");
  expect(await storyTabs.nth(1).getAttribute("aria-selected") === "true", "Story do Tabs não selecionou com ArrowRight");
  expect(await storyTabs.nth(1).evaluate((node) => node.matches(":focus-visible")), "Story do Tabs perdeu focus ring por teclado");
  const tabsGeometry = await page.locator("[tistablist]").evaluate((node) => {
    const root = node.getBoundingClientRect();
    const items = [...node.querySelectorAll("button")].map((item) => {
      const rect = item.getBoundingClientRect();
      return { left: rect.left, right: rect.right, height: rect.height };
    });
    return {
      mode: document.documentElement.dataset.mode,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      root: { left: root.left, right: root.right },
      items,
    };
  });
  expect(tabsGeometry.mode === "dark", "Story do Tabs não recebeu tema dark");
  expect(tabsGeometry.overflow <= 1, `Story do Tabs gerou overflow em 320px (${JSON.stringify(tabsGeometry)})`);
  expect(
    tabsGeometry.items.every((item) => item.height > 0 && item.left >= tabsGeometry.root.left && item.right <= tabsGeometry.root.right + 1),
    `Story do Tabs cortou ou desalinhou itens em 320px (${JSON.stringify(tabsGeometry)})`,
  );
  await axe("Storybook Tabs dark 320px");

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-tooltip--playground&globals=mode:dark`, { waitUntil: "networkidle" });
  const storyTooltipTrigger = page.getByRole("button", { name: "Editar" });
  await storyTooltipTrigger.focus();
  const storyTooltip = page.getByRole("tooltip");
  await storyTooltip.waitFor({ state: "visible" });
  const storyTooltipContract = await storyTooltip.evaluate((node) => {
    const styles = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    const probe = document.createElement("span");
    probe.style.background = "var(--ds-tooltip-content-fill-default)";
    probe.style.color = "var(--ds-tooltip-label-color-default)";
    document.body.append(probe);
    const result = {
      actualBackground: styles.backgroundColor,
      actualColor: styles.color,
      bottom: rect.bottom,
      expectedBackground: getComputedStyle(probe).backgroundColor,
      expectedColor: getComputedStyle(probe).color,
      fontSize: styles.fontSize,
      height: rect.height,
      left: rect.left,
      lineHeight: styles.lineHeight,
      mode: document.documentElement.dataset.mode,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      right: rect.right,
      top: rect.top,
      viewportHeight: window.innerHeight,
      viewportWidth: document.documentElement.clientWidth,
      width: rect.width,
    };
    probe.remove();
    return result;
  });
  expect(storyTooltipContract.mode === "dark", "Story do Tooltip não recebeu tema dark");
  expect(
    storyTooltipContract.actualBackground === storyTooltipContract.expectedBackground &&
      storyTooltipContract.actualColor === storyTooltipContract.expectedColor,
    `Story do Tooltip não consumiu os tokens dark (${JSON.stringify(storyTooltipContract)})`,
  );
  expect(
    storyTooltipContract.width > 0 && storyTooltipContract.height > 0 &&
      storyTooltipContract.left >= 0 && storyTooltipContract.right <= storyTooltipContract.viewportWidth &&
      storyTooltipContract.top >= 0 && storyTooltipContract.bottom <= storyTooltipContract.viewportHeight &&
      storyTooltipContract.overflow <= 1 && storyTooltipContract.fontSize === "14px" && storyTooltipContract.lineHeight === "20px",
    `Story do Tooltip ficou cortado ou desproporcional em 320px (${JSON.stringify(storyTooltipContract)})`,
  );
  const tooltipAxe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    tooltipAxe.violations.length === 0,
    `Storybook Tooltip dark 320px: Axe WCAG encontrou ${tooltipAxe.violations.map((item) => item.id).join(", ")}`,
  );

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-tooltip--sem-seta&globals=mode:light`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Editar" }).focus();
  const arrowlessTooltip = page.locator(".tis-angular-tooltip-overlay");
  await arrowlessTooltip.waitFor({ state: "visible" });
  expect(
    await arrowlessTooltip.locator(".ds-tooltip__content").evaluate((node) => getComputedStyle(node, "::before").content === "none"),
    "Tooltip Angular sem seta ainda renderizou o pseudo-elemento",
  );

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-toast--playground&globals=mode:dark`, { waitUntil: "networkidle" });
  const storyToastTrigger = page.getByRole("button", { name: "Mostrar Toast" });
  await storyToastTrigger.click();
  const storyToast = page.locator("[data-tis-angular-toast]").first();
  await storyToast.waitFor({ state: "visible" });
  const toastGeometry = await storyToast.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      background: style.backgroundColor,
      bottom: rect.bottom,
      height: rect.height,
      left: rect.left,
      mode: document.documentElement.dataset.mode,
      padding: style.padding,
      radius: style.borderRadius,
      right: rect.right,
      top: rect.top,
      viewportHeight: innerHeight,
      viewportWidth: document.documentElement.clientWidth,
      width: rect.width,
    };
  });
  expect(toastGeometry.mode === "dark", "Story do Toast não recebeu tema dark");
  expect(
    toastGeometry.width > 0 && toastGeometry.width <= 480 && toastGeometry.height >= 80 &&
      toastGeometry.left >= 0 && toastGeometry.right <= toastGeometry.viewportWidth &&
      toastGeometry.top >= 0 && toastGeometry.bottom <= toastGeometry.viewportHeight &&
      toastGeometry.padding === "12px" && toastGeometry.radius === "12px",
    `Story do Toast ficou cortado ou desproporcional em 320px (${JSON.stringify(toastGeometry)})`,
  );
  await storyToast.getByRole("button", { name: "Desfazer" }).click();
  expect(await storyToast.isVisible(), "Story do Toast fechou ao executar action");
  await page.waitForFunction(() => [...document.querySelectorAll(".ds-angular-toast-status")].some((node) => node.textContent?.includes("1")));
  expect((await page.getByText(/Ações executadas:/).textContent())?.includes("1"), "Story do Toast não emitiu action");
  await storyToast.getByRole("button", { name: "Dispensar" }).click();
  await storyToast.waitFor({ state: "detached" });

  for (let index = 0; index < 6; index += 1) {
    await storyToastTrigger.evaluate((button) => button.click());
  }
  expect(await page.locator("[data-tis-angular-toast]").count() === 5, "Story do Toast excedeu o limite de cinco mensagens");
  await axe("Storybook Toast dark 320px");

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-toast--solid-error&globals=mode:light`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Mostrar Toast" }).click();
  const errorToast = page.locator("[data-tis-angular-toast]").first();
  await errorToast.waitFor({ state: "visible" });
  expect(
    await errorToast.evaluate((node) => node.classList.contains("ds-toast--error") && node.classList.contains("ds-toast--solid") && !node.querySelector(".ds-toast__actions")),
    "Story error/solid do Toast não preservou tipo, estilo ou ausência de action",
  );
  expect(await errorToast.evaluate((node) => node.parentElement?.getAttribute("role") === "alert"), "Toast de erro não foi anunciado na região assertive");
  await axe("Storybook Toast error/solid");
  await page.setViewportSize({ width: 1280, height: 720 });

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-checkbox--estados&globals=mode:light`, { waitUntil: "networkidle" });
  const checkboxStates = page.locator('tis-checkbox input[type="checkbox"]');
  expect(await checkboxStates.count() === 6, "Story de estados do Checkbox não renderizou a matriz completa");
  expect(await checkboxStates.nth(1).isChecked(), "Story do Checkbox perdeu o estado checked");
  expect(await checkboxStates.nth(2).evaluate((node) => node.indeterminate), "Story do Checkbox perdeu o estado indeterminate real");
  expect(await checkboxStates.nth(3).isDisabled(), "Story do Checkbox perdeu o estado disabled");
  const stateGeometry = await checkboxStates.evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    const label = node.closest("label")?.getBoundingClientRect();
    return {
      boxHeight: rect.height,
      boxWidth: rect.width,
      labelHeight: label?.height || 0,
      inside: Boolean(label && rect.top >= label.top && rect.bottom <= label.bottom),
    };
  }));
  expect(
    stateGeometry.every((geometry) => geometry.boxHeight > 0 && geometry.boxHeight === geometry.boxWidth && geometry.labelHeight >= 24 && geometry.inside),
    `Story do Checkbox tem caixa cortada ou label desalinhado (${JSON.stringify(stateGeometry)})`,
  );

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-checkbox--angular-forms&globals=mode:dark`, { waitUntil: "networkidle" });
  const formsCheckbox = page.locator('tis-checkbox input[type="checkbox"]');
  await formsCheckbox.focus();
  await page.keyboard.press("Space");
  await page.mouse.move(0, 0);
  await page.waitForTimeout(200);
  expect(await formsCheckbox.isChecked(), "Story Angular Forms não atualizou o Checkbox");
  expect((await page.getByRole("status").textContent())?.includes("true"), "Story Angular Forms não refletiu o valor do ControlValueAccessor");
  const checkboxDark = await formsCheckbox.evaluate((node) => {
    const probe = document.createElement("input");
    probe.type = "checkbox";
    probe.className = "ds-checkbox";
    probe.checked = true;
    const label = document.createElement("label");
    label.className = "ds-checkbox-label";
    label.append(probe);
    document.body.append(label);
    const result = {
      actual: getComputedStyle(node).backgroundColor,
      expected: getComputedStyle(probe).backgroundColor,
      mode: document.documentElement.dataset.mode,
    };
    label.remove();
    return result;
  });
  expect(checkboxDark.mode === "dark", "Story do Checkbox não recebeu tema dark");
  expect(checkboxDark.actual === checkboxDark.expected, `Checkbox Angular divergiu da referência dark (${JSON.stringify(checkboxDark)})`);

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-radio--playground&globals=mode:light`, { waitUntil: "networkidle" });
  const storyRadios = page.getByRole("radio");
  expect(await storyRadios.count() === 2, "Story do Radio não renderizou duas opções comparáveis");
  expect(await storyRadios.first().isChecked(), "Story do Radio deveria iniciar com a primeira opção selecionada");
  await storyRadios.first().focus();
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(150);
  expect(await storyRadios.nth(1).isChecked(), "Story do Radio não respondeu a ArrowDown");
  expect(
    await storyRadios.nth(1).evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.width === 20 && rect.height === 20 && style.outlineStyle === "solid" && Number.parseFloat(style.outlineWidth) >= 2;
    }),
    "Story do Radio perdeu geometria ou focus ring TIS",
  );

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-radio--angular-forms&globals=mode:dark`, { waitUntil: "networkidle" });
  const formsRadios = page.getByRole("radio");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForFunction(() => document.querySelector("tis-radio-group fieldset")?.classList.contains("ds-radio-group--error"));
  expect(await page.getByText("Escolha um canal para continuar.", { exact: true }).isVisible(), "Story Angular Forms não validou Radio required");
  await formsRadios.first().click();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(150);
  expect((await page.getByRole("status").textContent())?.includes("email"), "Story Angular Forms não refletiu o valor do Radio");
  const radioDark = await formsRadios.first().evaluate((node) => {
    const probe = document.createElement("input");
    probe.type = "radio";
    probe.className = "ds-radio";
    probe.checked = true;
    const label = document.createElement("label");
    label.className = "ds-radio-label";
    label.append(probe);
    document.body.append(label);
    const result = {
      actual: getComputedStyle(node).backgroundColor,
      expected: getComputedStyle(probe).backgroundColor,
      mode: document.documentElement.dataset.mode,
    };
    label.remove();
    return result;
  });
  expect(radioDark.mode === "dark", "Story do Radio não recebeu tema dark");
  expect(radioDark.actual === radioDark.expected, `Radio Angular divergiu da referência dark (${JSON.stringify(radioDark)})`);

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-toggle--estados&globals=mode:light`, { waitUntil: "networkidle" });
  const toggleStates = page.getByRole("switch");
  expect(await toggleStates.count() === 4, "Story de estados do Toggle não renderizou a matriz completa");
  expect(await toggleStates.nth(1).isChecked(), "Story do Toggle perdeu o estado ligado");
  expect(await toggleStates.nth(2).isDisabled(), "Story do Toggle perdeu o estado disabled");
  const toggleGeometry = await toggleStates.evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    const label = node.closest("label")?.getBoundingClientRect();
    return {
      height: rect.height,
      width: rect.width,
      inside: Boolean(label && rect.top >= label.top && rect.bottom <= label.bottom),
    };
  }));
  expect(
    toggleGeometry.every((geometry) => geometry.width === 44 && geometry.height === 24 && geometry.inside),
    `Story do Toggle tem track cortado ou label desalinhado (${JSON.stringify(toggleGeometry)})`,
  );

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-toggle--angular-forms&globals=mode:dark`, { waitUntil: "networkidle" });
  const formsToggle = page.getByRole("switch");
  expect(await formsToggle.isChecked(), "Story Angular Forms não recebeu o estado inicial do Toggle");
  await formsToggle.press("Space");
  await page.waitForTimeout(150);
  expect(!(await formsToggle.isChecked()), "Story Angular Forms não atualizou o Toggle");
  expect((await page.getByRole("status").textContent())?.includes("false"), "Story Angular Forms não refletiu o valor do Toggle");
  await formsToggle.press("Space");
  await page.mouse.move(0, 0);
  await page.waitForTimeout(150);
  const toggleDark = await formsToggle.evaluate((node) => {
    const probe = document.createElement("input");
    probe.type = "checkbox";
    probe.role = "switch";
    probe.className = "ds-toggle";
    probe.checked = true;
    const label = document.createElement("label");
    label.className = "ds-toggle-label";
    label.append(probe);
    document.body.append(label);
    const result = {
      actual: getComputedStyle(node).backgroundColor,
      expected: getComputedStyle(probe).backgroundColor,
      mode: document.documentElement.dataset.mode,
    };
    label.remove();
    return result;
  });
  expect(toggleDark.mode === "dark", "Story do Toggle não recebeu tema dark");
  expect(toggleDark.actual === toggleDark.expected, `Toggle Angular divergiu da referência dark (${JSON.stringify(toggleDark)})`);

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-select--estados&globals=mode:light`, { waitUntil: "networkidle" });
  const selectStates = page.locator("tis-select select.ds-select__field");
  expect(await selectStates.count() === 5, "Story de estados do Select não renderizou a matriz completa");
  expect(await selectStates.nth(0).inputValue() === "", "Story do Select perdeu o placeholder");
  expect(await selectStates.nth(1).inputValue() === "br", "Story do Select perdeu o estado preenchido");
  expect(await selectStates.nth(2).getAttribute("aria-invalid") === "true", "Story do Select perdeu o estado inválido");
  expect(await selectStates.nth(3).isDisabled() && await selectStates.nth(4).isDisabled(), "Story do Select perdeu disabled/readonly nativos");
  const selectGeometry = await page.locator("tis-select .ds-select").evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    const field = node.querySelector("select")?.getBoundingClientRect();
    return { height: rect.height, width: rect.width, fieldHeight: field?.height ?? 0 };
  }));
  expect(
    selectGeometry.every((geometry) => geometry.height === 40 && geometry.width > geometry.height && geometry.fieldHeight <= 44),
    `Story do Select tem controle cortado ou field desproporcional (${JSON.stringify(selectGeometry)})`,
  );

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-select--angular-forms&globals=mode:dark`, { waitUntil: "networkidle" });
  const formsSelect = page.getByRole("combobox", { exact: true, name: "País" });
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForFunction(() => document.querySelector("tis-select select")?.getAttribute("aria-invalid") === "true");
  expect(await page.getByText("Selecione um país para continuar.", { exact: true }).isVisible(), "Story Angular Forms não validou Select required");
  await formsSelect.selectOption("pt");
  await page.waitForTimeout(100);
  expect((await page.getByRole("status").textContent())?.includes("pt"), "Story Angular Forms não refletiu o valor do Select");
  const selectDark = await formsSelect.evaluate((node) => {
    const actual = node.closest(".ds-select");
    const reference = document.createElement("div");
    reference.className = "ds-select ds-select--filled";
    reference.innerHTML = '<select class="ds-select__field"><option selected>Portugal</option></select><span class="ds-select__arrow" aria-hidden="true"></span>';
    document.body.append(reference);
    const result = {
      actual: getComputedStyle(actual).backgroundColor,
      expected: getComputedStyle(reference).backgroundColor,
      mode: document.documentElement.dataset.mode,
    };
    reference.remove();
    return result;
  });
  expect(selectDark.mode === "dark", "Story do Select não recebeu tema dark");
  expect(selectDark.actual === selectDark.expected, `Select Angular divergiu da referência dark (${JSON.stringify(selectDark)})`);

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-combobox--estados&globals=mode:light`, { waitUntil: "networkidle" });
  const comboboxStates = page.locator("tis-combobox input.ds-combobox__input");
  expect(await comboboxStates.count() === 5, "Story de estados do Combobox não renderizou a matriz completa");
  expect(await comboboxStates.nth(0).inputValue() === "", "Story do Combobox perdeu o estado padrão");
  expect(await comboboxStates.nth(1).inputValue() === "Brasil", "Story do Combobox perdeu o estado preenchido");
  expect(await comboboxStates.nth(2).getAttribute("aria-invalid") === "true", "Story do Combobox perdeu o estado inválido");
  expect(await comboboxStates.nth(3).isDisabled(), "Story do Combobox perdeu o estado disabled");
  expect(await comboboxStates.nth(4).getAttribute("readonly") !== null, "Story do Combobox perdeu o estado readonly");
  const comboboxGeometry = await page.locator("tis-combobox .ds-combobox").evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    const field = node.querySelector("input")?.getBoundingClientRect();
    return { height: rect.height, width: rect.width, fieldHeight: field?.height ?? 0 };
  }));
  expect(
    comboboxGeometry.every((geometry) => geometry.height === 40 && geometry.width > geometry.height && geometry.fieldHeight <= 44),
    `Story do Combobox tem controle cortado ou field desproporcional (${JSON.stringify(comboboxGeometry)})`,
  );

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-combobox--angular-forms&globals=mode:dark`, { waitUntil: "networkidle" });
  const formsCombobox = page.getByRole("combobox", { exact: true, name: "País" });
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForFunction(() => document.querySelector("tis-combobox input")?.getAttribute("aria-invalid") === "true");
  expect(await page.getByText("Selecione um país para continuar.", { exact: true }).isVisible(), "Story Angular Forms não validou Combobox required");
  await formsCombobox.fill("Bra");
  await formsCombobox.press("ArrowDown");
  await formsCombobox.press("Enter");
  await page.waitForTimeout(100);
  expect((await page.getByRole("status").textContent())?.includes("br"), "Story Angular Forms não refletiu o valor do Combobox");
  const comboboxDark = await formsCombobox.evaluate((node) => {
    const actual = node.closest(".ds-combobox");
    const reference = document.createElement("div");
    reference.className = "ds-combobox ds-combobox--md ds-combobox--filled";
    reference.innerHTML = '<input class="ds-combobox__input" value="Brasil">';
    document.body.append(reference);
    const result = {
      actual: getComputedStyle(actual).backgroundColor,
      expected: getComputedStyle(reference).backgroundColor,
      mode: document.documentElement.dataset.mode,
    };
    reference.remove();
    return result;
  });
  expect(comboboxDark.mode === "dark", "Story do Combobox não recebeu tema dark");
  expect(comboboxDark.actual === comboboxDark.expected, `Combobox Angular divergiu da referência dark (${JSON.stringify(comboboxDark)})`);

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-input--estados&globals=mode:light`, { waitUntil: "networkidle" });
  const inputStates = page.locator("tis-input input.ds-input__field");
  expect(await inputStates.count() === 5, "Story de estados do Input não renderizou a matriz completa");
  expect(await inputStates.nth(0).inputValue() === "", "Story do Input perdeu o estado padrão");
  expect(await inputStates.nth(1).inputValue() === "usuario@empresa.com", "Story do Input perdeu o estado preenchido");
  expect(await inputStates.nth(2).getAttribute("aria-invalid") === "true", "Story do Input perdeu o estado inválido");
  expect(await inputStates.nth(3).isDisabled(), "Story do Input perdeu o estado disabled");
  expect(await inputStates.nth(4).getAttribute("readonly") !== null, "Story do Input perdeu o estado readonly");
  const inputGeometry = await page.locator("tis-input .ds-input").evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    const field = node.querySelector("input")?.getBoundingClientRect();
    return { height: rect.height, width: rect.width, fieldHeight: field?.height ?? 0 };
  }));
  expect(
    inputGeometry.every((geometry) => geometry.height === 40 && geometry.width > geometry.height && geometry.fieldHeight <= 44),
    `Story do Input tem controle cortado ou field desproporcional (${JSON.stringify(inputGeometry)})`,
  );

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-input--angular-forms&globals=mode:dark`, { waitUntil: "networkidle" });
  const formsInput = page.getByRole("textbox", { name: "E-mail" });
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForFunction(() => document.querySelector("tis-input input")?.getAttribute("aria-invalid") === "true");
  expect(await page.getByText("Digite um e-mail para continuar.", { exact: true }).isVisible(), "Story Angular Forms não validou Input required");
  await formsInput.fill("ana@empresa.com");
  await page.waitForTimeout(100);
  expect((await page.getByRole("status").textContent())?.includes("ana@empresa.com"), "Story Angular Forms não refletiu o valor do Input");
  const inputDark = await formsInput.evaluate((node) => {
    const actual = node.closest(".ds-input");
    const reference = document.createElement("div");
    reference.className = "ds-input ds-input--filled";
    reference.innerHTML = '<input class="ds-input__field" value="ana@empresa.com">';
    document.body.append(reference);
    const result = {
      actual: getComputedStyle(actual).backgroundColor,
      expected: getComputedStyle(reference).backgroundColor,
      mode: document.documentElement.dataset.mode,
    };
    reference.remove();
    return result;
  });
  expect(inputDark.mode === "dark", "Story do Input não recebeu tema dark");
  expect(inputDark.actual === inputDark.expected, `Input Angular divergiu da referência dark (${JSON.stringify(inputDark)})`);

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-textarea--estados&globals=mode:light`, { waitUntil: "networkidle" });
  const textareaStates = page.locator("tis-textarea textarea.ds-textarea__field");
  expect(await textareaStates.count() === 5, "Story de estados do Textarea não renderizou a matriz completa");
  expect(await textareaStates.nth(0).inputValue() === "", "Story do Textarea perdeu o estado padrão");
  expect(await textareaStates.nth(1).inputValue() !== "", "Story do Textarea perdeu o estado preenchido");
  expect(await textareaStates.nth(2).getAttribute("aria-invalid") === "true", "Story do Textarea perdeu o estado inválido");
  expect(await textareaStates.nth(3).isDisabled(), "Story do Textarea perdeu o estado disabled");
  expect(await textareaStates.nth(4).getAttribute("readonly") !== null, "Story do Textarea perdeu o estado readonly");
  const textareaGeometry = await page.locator("tis-textarea .ds-textarea").evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    const field = node.querySelector("textarea")?.getBoundingClientRect();
    return { height: rect.height, width: rect.width, fieldHeight: field?.height ?? 0 };
  }));
  expect(
    textareaGeometry.every((geometry) => geometry.height >= 80 && geometry.height < 180 && geometry.width > geometry.height && geometry.fieldHeight <= geometry.height + 4),
    `Story do Textarea tem controle cortado ou altura desproporcional (${JSON.stringify(textareaGeometry)})`,
  );

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-textarea--com-contador&globals=mode:dark`, { waitUntil: "networkidle" });
  const counters = page.locator("tis-textarea .ds-field__counter");
  const counterTextareas = page.locator("tis-textarea textarea");
  expect(await counters.count() === 2, "Story do Textarea não renderizou os contadores");
  expect(!((await counters.first().getAttribute("class")) ?? "").includes("ds-field__counter--over"), "Contador dentro do limite recebeu estado over");
  expect((await counters.nth(1).getAttribute("class"))?.includes("ds-field__counter--over"), "Contador acima do limite não recebeu estado over");
  expect(await counterTextareas.count() === 2, "Story do Textarea perdeu os controles associados aos contadores");
  const counterTextarea = counterTextareas.first();
  expect((await counterTextarea.getAttribute("aria-describedby"))?.includes("counter"), "Textarea não associou contador por aria-describedby");
  const textareaDark = await counterTextarea.evaluate((node) => {
    const actual = node.closest(".ds-textarea");
    const reference = document.createElement("div");
    reference.className = "ds-textarea ds-textarea--filled";
    reference.innerHTML = '<textarea class="ds-textarea__field">Conteúdo em revisão.</textarea>';
    document.body.append(reference);
    const result = {
      actual: getComputedStyle(actual).backgroundColor,
      expected: getComputedStyle(reference).backgroundColor,
      mode: document.documentElement.dataset.mode,
    };
    reference.remove();
    return result;
  });
  expect(textareaDark.mode === "dark", "Story do Textarea não recebeu tema dark");
  expect(textareaDark.actual === textareaDark.expected, `Textarea Angular divergiu da referência dark (${JSON.stringify(textareaDark)})`);

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-popover--sem-seta&globals=mode:light`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Abrir popover" }).click();
  const arrowlessOverlay = page.locator(".tis-angular-popover-overlay");
  await arrowlessOverlay.waitFor();
  const arrowlessContent = await arrowlessOverlay.evaluate((node) => ({
    after: getComputedStyle(node, "::after").content,
    before: getComputedStyle(node, "::before").content,
  }));
  expect(
    arrowlessContent.before === "none" && arrowlessContent.after === "none",
    `Popover sem seta ainda renderizou pseudo-elementos (${JSON.stringify(arrowlessContent)})`,
  );

  await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=angular-popover--playground&globals=mode:dark`, { waitUntil: "networkidle" });
  const darkSurface = await page.evaluate(() => {
    const expectedProbe = document.createElement("div");
    expectedProbe.style.background = "var(--ds-background-subtle)";
    const lightProbe = document.createElement("div");
    lightProbe.dataset.mode = "light";
    lightProbe.style.background = "var(--ds-background-subtle)";
    document.body.append(expectedProbe, lightProbe);
    const result = {
      body: getComputedStyle(document.body).backgroundColor,
      expected: getComputedStyle(expectedProbe).backgroundColor,
      light: getComputedStyle(lightProbe).backgroundColor,
      mode: document.documentElement.dataset.mode,
    };
    expectedProbe.remove();
    lightProbe.remove();
    return result;
  });
  expect(darkSurface.mode === "dark", "Storybook Angular não aplicou data-mode dark");
  expect(
    darkSurface.body === darkSurface.expected && darkSurface.body !== darkSurface.light,
    `Storybook Angular não aplicou a superfície dark (${JSON.stringify(darkSurface)})`,
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

if (failures.length) {
  for (const failure of failures) console.error(`❌ ${failure}`);
  process.exit(1);
}
console.log("✅ Angular browser: semântica, teclado, foco, responsividade, visual, Storybook e Axe válidos.");
