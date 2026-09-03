#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const FIXTURE = path.join(ROOT, "tests", "consumer", "angular-app");
const DIST = path.join(ROOT, "dist", "angular");
const TARBALL = path.join(ROOT, "dist", "tis-angular-0.0.0-beta.0.tgz");
const CACHE = path.join(os.tmpdir(), "ds-tis-angular-consumer-cache");

function run(label, command, args, cwd = ROOT) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    shell: false,
    env: {
      ...process.env,
      NG_BUILD_MAX_WORKERS: "1",
      NODE_OPTIONS: "--max-old-space-size=4096",
      npm_config_cache: CACHE,
    },
  });
  if (result.status !== 0) {
    throw new Error(`${label} falhou (exit ${result.status ?? "null"})\n${result.stdout ?? ""}${result.stderr ?? ""}`);
  }
  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");
  return result;
}

if (!fs.existsSync(path.join(DIST, "package.json"))) {
  throw new Error("dist/angular ausente; rode npm run build:angular antes do consumer.");
}

run("npm pack Angular", "npm", ["pack", "./dist/angular", "--pack-destination", "dist", "--json"]);
if (!fs.existsSync(TARBALL)) throw new Error(`tarball Angular não gerado em ${TARBALL}`);

run(
  "instalação do tarball no consumer",
  "npm",
  ["install", "../../../dist/tis-angular-0.0.0-beta.0.tgz", "--force", "--ignore-scripts", "--no-audit", "--no-fund"],
  FIXTURE,
);

const installedPackage = path.join(FIXTURE, "node_modules", "@tis", "angular");
const installedStat = fs.lstatSync(installedPackage);
if (installedStat.isSymbolicLink()) {
  throw new Error("consumer Angular recebeu symlink; a evidência exige instalação real do tarball.");
}

const installedManifest = JSON.parse(fs.readFileSync(path.join(installedPackage, "package.json"), "utf8"));
if (installedManifest.name !== "@tis/angular" || installedManifest.version !== "0.0.0-beta.0") {
  throw new Error("consumer Angular instalou identidade ou versão inesperada.");
}
if (Object.keys({ ...installedManifest.dependencies, ...installedManifest.peerDependencies }).some((name) =>
  /react|ark|zag|base-ui|shadcn/i.test(name))) {
  throw new Error("@tis/angular não pode depender de React, Ark/Zag, Base UI ou shadcn.");
}

for (const entrypoint of ["accordion", "button", "checkbox", "combobox", "input", "menu", "modal", "popover", "radio", "select", "tabs", "testing", "textarea", "toggle", "tooltip"]) {
  const entry = installedManifest.exports?.[`./${entrypoint}`];
  if (!entry?.types || !entry?.default ||
      !fs.existsSync(path.join(installedPackage, entry.types)) ||
      !fs.existsSync(path.join(installedPackage, entry.default))) {
    throw new Error(`entrypoint instalado ausente: @tis/angular/${entrypoint}`);
  }
}

run("build de produção do consumer", "npm", ["run", "build"], FIXTURE);

const browserDist = path.join(FIXTURE, "dist", "angular-consumer", "browser");
const jsBytes = fs.readdirSync(browserDist)
  .filter((name) => name.endsWith(".js"))
  .reduce((total, name) => total + fs.statSync(path.join(browserDist, name)).size, 0);
const cssBytes = fs.readdirSync(browserDist)
  .filter((name) => name.endsWith(".css"))
  .reduce((total, name) => total + fs.statSync(path.join(browserDist, name)).size, 0);

console.log(`✅ Consumer Angular instalou tarball real e gerou produção: ${(jsBytes / 1024).toFixed(2)} KiB JS + ${(cssBytes / 1024).toFixed(2)} KiB CSS.`);
