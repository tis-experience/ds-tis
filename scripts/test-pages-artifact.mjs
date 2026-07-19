import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_DIR = path.join(ROOT, "_site");
const EXPECTED_TOP_LEVEL = [".nojekyll", "css", "docs", "index.html", "js"];
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
  const htmlFiles = files.filter((file) => file.endsWith(".html"));
  const home = fs.readFileSync(path.join(SITE_DIR, "index.html"), "utf8");

  expect(
    home.includes(`VERSION:${packageJson.version}`) && home.includes(`v${packageJson.version}`),
    `index.html não anuncia v${packageJson.version}`
  );

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
