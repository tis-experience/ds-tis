import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SHADCN_REGISTRY } from "./lib/technology-implementations.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_DIR = path.join(ROOT, "_site");
const EXPECTED_TOP_LEVEL = [".nojekyll", "css", "docs", "index.html", "js", "next", "registry", "storybook"];
const STORYBOOK_DIR = path.join(SITE_DIR, "storybook");
const VNEXT_DIR = path.join(SITE_DIR, "next");
const VNEXT_STORYBOOK_DIR = path.join(VNEXT_DIR, "storybook");
const ANGULAR_STORYBOOK_DIR = path.join(VNEXT_DIR, "storybook-angular");
const REGISTRY_DIR = path.join(SITE_DIR, "registry");
const packageJson = readJson(path.join(ROOT, "package.json"));
const errors = [];

expect(fs.existsSync(SITE_DIR), "_site/ não existe; rode npm run build:pages.");

if (fs.existsSync(SITE_DIR)) {
  const topLevel = fs.readdirSync(SITE_DIR).sort();
  expect(
    JSON.stringify(topLevel) === JSON.stringify(EXPECTED_TOP_LEVEL),
    `top-level público inesperado: ${topLevel.join(", ")}`
  );

  const files = walkFiles(SITE_DIR);
  const htmlFiles = files.filter(
    (file) =>
      file.endsWith(".html")
      && !file.startsWith(`${STORYBOOK_DIR}${path.sep}`)
      && !file.startsWith(`${VNEXT_STORYBOOK_DIR}${path.sep}`)
      && !file.startsWith(`${ANGULAR_STORYBOOK_DIR}${path.sep}`)
  );
  const home = fs.readFileSync(path.join(SITE_DIR, "index.html"), "utf8");
  const navigation = fs.readFileSync(path.join(SITE_DIR, "js", "main.js"), "utf8");

  for (const requiredFile of ["index.html", "iframe.html", "index.json"]) {
    expect(fs.existsSync(path.join(STORYBOOK_DIR, requiredFile)), `storybook/${requiredFile}: artefato ausente`);
    expect(
      fs.existsSync(path.join(VNEXT_STORYBOOK_DIR, requiredFile)),
      `next/storybook/${requiredFile}: artefato ausente`
    );
    expect(
      fs.existsSync(path.join(ANGULAR_STORYBOOK_DIR, requiredFile)),
      `next/storybook-angular/${requiredFile}: artefato ausente`
    );
  }
  expect(fs.existsSync(path.join(VNEXT_DIR, "index.html")), "next/index.html: portal Astro ausente");

  const registryManifestPath = path.join(REGISTRY_DIR, "manifest.json");
  expect(fs.existsSync(registryManifestPath), "registry/manifest.json: manifesto público ausente");
  if (fs.existsSync(registryManifestPath)) {
    const registryManifest = readJson(registryManifestPath);
    const expectedRegistryItems = [
      "accordion",
      "alert",
      "avatar",
      "badge",
      "breadcrumb",
      "button",
      "card",
      "checkbox",
      "combobox",
      "dialog",
      "field",
      "input",
      "menu",
      "popover",
      "radio-group",
      "select",
      "separator",
      "skeleton",
      "spinner",
      "switch",
      "table",
      "tabs",
      "textarea",
      "tis-base",
      "toast",
      "tooltip",
    ];
    expect(registryManifest.schema === "ds-tis/shadcn-registry", "registry manifest: schema inválido");
    expect(registryManifest.status === "beta", "registry manifest: status deve ser beta");
    expect(registryManifest.channel === "v1", "registry manifest: channel deve ser v1");
    expect(
      registryManifest.core?.ref === SHADCN_REGISTRY.coreRef,
      "registry manifest: ref imutável do core inválido",
    );
    expect(
      registryManifest.namespace?.componentsJson?.registries?.["@tis"]
        === "https://tis-experience.github.io/ds-tis/registry/v1/{name}.json",
      "registry manifest: namespace @tis inválido",
    );
    expect(
      JSON.stringify(registryManifest.items?.map((item) => item.name)) === JSON.stringify(expectedRegistryItems),
      "registry manifest: catálogo de itens incompleto ou fora de ordem",
    );
    for (const item of expectedRegistryItems) {
      const itemPath = path.join(REGISTRY_DIR, "v1", `${item}.json`);
      expect(fs.existsSync(itemPath), `registry/v1/${item}.json: item público ausente`);
      if (fs.existsSync(itemPath)) {
        expect(readJson(itemPath).name === item, `registry/v1/${item}.json: name inválido`);
      }
    }
    expect(fs.existsSync(path.join(REGISTRY_DIR, "v1", "registry.json")), "registry/v1/registry.json: índice shadcn ausente");
  }

  expect(
    home.includes(`VERSION:${packageJson.version}`) && home.includes(`v${packageJson.version}`),
    `index.html não anuncia v${packageJson.version}`
  );
  expect(home.includes('href="storybook/"'), "index.html não oferece acesso ao Storybook");
  expect(home.includes('href="next/"'), "index.html não oferece acesso ao portal vNext");
  expect(navigation.includes("path: 'storybook/index.html'"), "navegação global não oferece acesso ao Storybook");
  expect(navigation.includes("path: 'next/pt-br/'"), "navegação global não oferece acesso ao portal vNext");

  for (const file of files) {
    const relativePath = path.relative(SITE_DIR, file);
    expect(!/\.figma-snapshot|\.env(?:\.|$)|package-lock\.json/i.test(relativePath), `${relativePath}: arquivo privado no Pages`);
  }

  for (const htmlFile of htmlFiles) validateLocalReferences(htmlFile);

  if (errors.length === 0) {
    console.log(`✅ Artefato Pages: ${files.length} arquivos, ${htmlFiles.length} páginas HTML, links locais íntegros.`);
  }
}

if (errors.length > 0) {
  console.error("\n❌ test-pages-artifact falhou:");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

function validateLocalReferences(htmlFile) {
  const html = fs.readFileSync(htmlFile, "utf8");
  const executableMarkup = html
    .replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, "")
    .replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, "");
  const referencePattern = /(?:href|src)=["']([^"']+)["']/g;

  for (const match of executableMarkup.matchAll(referencePattern)) {
    const rawReference = match[1].trim();
    if (
      !rawReference ||
      rawReference.startsWith("#") ||
      rawReference.startsWith("/") ||
      /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(rawReference)
    ) {
      continue;
    }

    const pathname = decodeURIComponent(rawReference.split(/[?#]/, 1)[0]);
    if (!pathname) continue;

    const resolved = path.resolve(path.dirname(htmlFile), pathname);
    expect(resolved.startsWith(`${SITE_DIR}${path.sep}`), `${relative(htmlFile)}: referência escapa do site (${rawReference})`);

    const candidate = pathname.endsWith("/") ? path.join(resolved, "index.html") : resolved;
    expect(fs.existsSync(candidate), `${relative(htmlFile)}: referência ausente (${rawReference})`);
  }
}

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      errors.push(`${relative(absolutePath)}: symlink não permitido`);
      return [];
    }
    return entry.isDirectory() ? walkFiles(absolutePath) : [absolutePath];
  });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function relative(file) {
  return path.relative(SITE_DIR, file);
}

function expect(condition, message) {
  if (!condition) errors.push(message);
}
