#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  REACT_REGISTRY_BY_SLUG,
  SHADCN_REGISTRY,
  registryInstallCommand,
  registryItemUrl,
} from "./lib/technology-implementations.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const outputFlagIndex = args.indexOf("--output");
if (
  outputFlagIndex >= 0
  && (!args[outputFlagIndex + 1] || args[outputFlagIndex + 1].startsWith("--"))
) {
  throw new Error("--output exige um diretório explícito");
}
const outputArgument = outputFlagIndex >= 0 ? args[outputFlagIndex + 1] : null;
const outputDir = outputArgument
  ? path.resolve(ROOT, outputArgument)
  : path.join(ROOT, "_site", "registry", SHADCN_REGISTRY.channel);
const registryRoot = path.dirname(outputDir);
const sourcePath = path.join(ROOT, SHADCN_REGISTRY.source);
const packageJson = readJson(path.join(ROOT, "package.json"));
const sourceRegistry = readJson(sourcePath);
const shadcnExecutable = path.join(
  ROOT,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "shadcn.cmd" : "shadcn",
);

const publicRegistryRoot = path.join(ROOT, "_site", "registry");
const temporaryRoot = path.resolve(os.tmpdir());
if (
  !isStrictDescendant(publicRegistryRoot, outputDir)
  && !isStrictDescendant(temporaryRoot, outputDir)
) {
  throw new Error(`Output deve ficar dentro de ${publicRegistryRoot} ou ${temporaryRoot}: ${outputDir}`);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

const result = spawnSync(
  shadcnExecutable,
  ["build", sourcePath, "--output", outputDir, "--cwd", ROOT],
  { cwd: ROOT, encoding: "utf8", stdio: "inherit" },
);

if (result.status !== 0) {
  throw new Error(`shadcn build falhou com exit ${result.status ?? "null"}`);
}

const itemByName = new Map(sourceRegistry.items.map((item) => [item.name, item]));
const componentByItem = new Map(
  Object.entries(REACT_REGISTRY_BY_SLUG).map(([slug, implementation]) => [implementation.item, slug]),
);
const manifestItems = sourceRegistry.items
  .map((item) => ({
    name: item.name,
    component: componentByItem.get(item.name) ?? null,
    title: item.title ?? item.name,
    type: item.type,
    status: item.meta?.status ?? null,
    provider: item.meta?.provider ?? null,
    url: registryItemUrl(item.name),
    install: registryInstallCommand(item.name),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

for (const item of manifestItems) {
  const builtItem = path.join(outputDir, `${item.name}.json`);
  if (!fs.existsSync(builtItem)) {
    throw new Error(`Item compilado ausente: ${item.name}`);
  }
  if (item.status !== SHADCN_REGISTRY.status) {
    throw new Error(`${item.name}: status deve ser ${SHADCN_REGISTRY.status}`);
  }
  if (!itemByName.has(item.name)) {
    throw new Error(`${item.name}: item ausente no source registry`);
  }
}

fs.mkdirSync(registryRoot, { recursive: true });
fs.writeFileSync(
  path.join(registryRoot, "manifest.json"),
  `${JSON.stringify(
    {
      schema: SHADCN_REGISTRY.schema,
      schemaVersion: SHADCN_REGISTRY.schemaVersion,
      status: SHADCN_REGISTRY.status,
      dsVersion: packageJson.version,
      channel: SHADCN_REGISTRY.channel,
      baseUrl: SHADCN_REGISTRY.baseUrl,
      registry: `${SHADCN_REGISTRY.baseUrl}/registry.json`,
      source: SHADCN_REGISTRY.source,
      namespace: {
        name: SHADCN_REGISTRY.namespace,
        componentsJson: {
          registries: {
            [SHADCN_REGISTRY.namespace]: `${SHADCN_REGISTRY.baseUrl}/{name}.json`,
          },
        },
      },
      package: null,
      note: "Source distribution beta. @tis/react is not a public package.",
      items: manifestItems,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(`✅ Registry shadcn público: ${manifestItems.length} itens em ${path.relative(ROOT, outputDir)}`);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function isStrictDescendant(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative !== "" && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}
