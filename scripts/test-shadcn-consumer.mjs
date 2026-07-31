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
  expect(await page.locator('[data-slot="input"]').inputValue() === "Marcell", "Input instalado perdeu o valor inicial");
  expect(await page.locator('[data-slot="textarea"]').inputValue() === "Experience Engineering", "Textarea instalado perdeu o valor inicial");

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

  await page.getByRole("button", { name: "Quando a alteração entra em vigor?" }).click();
  expect(await page.getByText("A atualização é aplicada imediatamente após salvar.").isVisible(), "Accordion instalado não abriu o painel");

  await page.getByRole("button", { name: "Revisar alterações" }).click();
  expect(await page.getByRole("dialog").isVisible(), "Dialog instalado não abriu");
  await page.keyboard.press("Escape");
  const dialogClosed = await page
    .getByRole("dialog")
    .waitFor({ state: "hidden", timeout: 3000 })
    .then(() => true, () => false);
  expect(dialogClosed, "Dialog instalado não fechou com Escape");

  await page.getByRole("button", { name: "Salvar preferências" }).click();
  expect(await page.getByText("Preferências salvas.").isVisible(), "Button instalado não submeteu o formulário");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow <= 1, `consumer criou overflow horizontal em 390px (${overflow}px)`);

  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.length === 0, `consumer React tem ${axe.violations.length} violações Axe: ${axe.violations.map((violation) => violation.id).join(", ")}`);

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
