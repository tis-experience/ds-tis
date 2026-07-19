import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = path.join(ROOT, "_site");
const PUBLIC_PATHS = ["index.html", "css", "docs", "js"];

fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

for (const relativePath of PUBLIC_PATHS) {
  const source = path.join(ROOT, relativePath);
  const destination = path.join(OUTPUT_DIR, relativePath);

  if (!fs.existsSync(source)) {
    throw new Error(`Artefato público ausente: ${relativePath}`);
  }

  const stat = fs.lstatSync(source);
  if (stat.isSymbolicLink()) {
    throw new Error(`Symlink não permitido no artefato Pages: ${relativePath}`);
  }

  fs.cpSync(source, destination, {
    recursive: stat.isDirectory(),
    dereference: false,
  });
}

fs.writeFileSync(path.join(OUTPUT_DIR, ".nojekyll"), "", "utf8");

const fileCount = walkFiles(OUTPUT_DIR).length;
console.log(`✅ Artefato GitHub Pages criado em _site/ (${fileCount} arquivos).`);

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`Symlink não permitido no artefato Pages: ${path.relative(ROOT, absolutePath)}`);
    }
    return entry.isDirectory() ? walkFiles(absolutePath) : [absolutePath];
  });
}
