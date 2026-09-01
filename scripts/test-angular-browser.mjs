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

  await axe("consumer light");
  await page.getByRole("button", { name: "Tema escuro" }).click();
  expect(await page.locator("html").getAttribute("data-theme") === "dark", "tema dark não foi aplicado");
  await axe("consumer dark");

  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
    await page.reload({ waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow <= 1, `${width}px: overflow horizontal de ${overflow}px`);
    await page.screenshot({ path: path.join(EVIDENCE, `angular-consumer-${width}.png`), fullPage: true });
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(origin, { waitUntil: "networkidle" });
  const visualParity = await page.evaluate(() => {
    const pick = (node, properties) => {
      const styles = getComputedStyle(node);
      return Object.fromEntries(properties.map((property) => [property, styles.getPropertyValue(property)]));
    };
    const compare = (actualSelector, referenceClass, properties) => {
      const actual = document.querySelector(actualSelector);
      const reference = document.createElement("button");
      reference.className = referenceClass;
      reference.textContent = "Referência";
      document.body.append(reference);
      const result = { actual: pick(actual, properties), reference: pick(reference, properties) };
      reference.remove();
      return result;
    };
    return {
      button: compare(".consumer-section [data-tis-angular-button]", "ds-button ds-button--brand ds-button--md", ["padding-inline-start", "padding-inline-end", "border-radius", "background-color", "color", "font-size"]),
      accordion: compare("button[tisaccordiontrigger]", "ds-accordion__trigger", ["min-block-size", "padding-inline-start", "padding-inline-end", "border-radius", "background-color", "color", "font-size"]),
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
    ["angular-accordion--playground", "[tisAccordion]"],
    ["angular-popover--playground", "tis-popover"],
  ];
  for (const [storyId, componentSelector] of storyContracts) {
    await page.goto(`${origin}/storybook/iframe.html?viewMode=story&id=${storyId}&globals=mode:light`, { waitUntil: "networkidle" });
    expect(await page.locator("#storybook-root").count() === 1, `${storyId}: root do Storybook ausente`);
    expect(await page.locator(componentSelector).count() >= 1, `${storyId}: componente Angular não renderizado`);
    const result = await new AxeBuilder({ page }).analyze();
    expect(result.violations.length === 0, `Storybook ${storyId}: Axe encontrou ${result.violations.map((item) => item.id).join(", ")}`);
  }

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
