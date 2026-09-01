#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

import { build } from "vite";

const ROOT = path.resolve(import.meta.dirname, "..");
const FESM = path.join(ROOT, "dist", "angular", "fesm2022");
const EVIDENCE = path.join(
  ROOT,
  "docs",
  "agents",
  "runs",
  "2026-08-28-angular-output",
  "evidence",
  "angular-bundle.json",
);
const definitions = {
  button: { file: "tis-angular-button.mjs", budget: 4 * 1024 },
  accordion: { file: "tis-angular-accordion.mjs", budget: 8 * 1024 },
  popover: { file: "tis-angular-popover.mjs", budget: 12 * 1024 },
};
const forbiddenByEntry = {
  button: ["AccordionGroup", "FlexibleConnectedPositionStrategy"],
  accordion: ["FlexibleConnectedPositionStrategy", "data-tis-angular-button"],
  popover: ["AccordionGroup", "data-tis-angular-button"],
};
const failures = [];
const results = [];

fs.mkdirSync(path.dirname(EVIDENCE), { recursive: true });

const external = (id) =>
  id === "rxjs" ||
  id.startsWith("rxjs/") ||
  id === "tslib" ||
  id.startsWith("@angular/");

for (const [name, definition] of Object.entries(definitions)) {
  const source = path.join(FESM, definition.file);
  if (!fs.existsSync(source)) throw new Error(`${name}: build Angular ausente em ${source}`);
  const output = await build({
    configFile: false,
    logLevel: "silent",
    build: {
      minify: true,
      target: "es2022",
      write: false,
      rollupOptions: {
        input: source,
        external,
        preserveEntrySignatures: "strict",
        output: { format: "es" },
      },
    },
  });
  const builds = Array.isArray(output) ? output : [output];
  const code = builds.flatMap((item) => item.output)
    .filter((item) => item.type === "chunk")
    .map((item) => item.code)
    .join("\n");
  const rawBytes = Buffer.byteLength(code);
  const gzipBytes = gzipSync(Buffer.from(code), { level: 9 }).byteLength;
  results.push({ name, rawBytes, gzipBytes, budgetGzipBytes: definition.budget });
  if (gzipBytes > definition.budget) failures.push(`${name}: ${(gzipBytes / 1024).toFixed(2)} KiB gzip excede ${(definition.budget / 1024).toFixed(2)} KiB`);
  for (const forbidden of forbiddenByEntry[name]) {
    if (code.includes(forbidden)) failures.push(`${name}: contém símbolo alheio ao entrypoint (${forbidden})`);
  }
}

fs.writeFileSync(EVIDENCE, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  scope: "adapter Angular minificado; Angular/RxJS/tslib externos por serem peers",
  results,
}, null, 2)}\n`);

for (const result of results) {
  console.log(`  ${result.name.padEnd(10)} ${(result.gzipBytes / 1024).toFixed(2)} KiB gzip · ${(result.rawBytes / 1024).toFixed(2)} KiB minificado`);
}
if (failures.length) {
  for (const failure of failures) console.error(`❌ ${failure}`);
  process.exit(1);
}
console.log("✅ Entrypoints Angular independentes, tree-shakeable e dentro dos orçamentos.");
