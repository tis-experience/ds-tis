import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT_PATH = path.join(ROOT, ".figma-snapshot.json");
const EVIDENCE_PATH = path.join(ROOT, "docs/api/release-figma-evidence.json");
const TOKEN_REPORT_PATH = path.join(ROOT, "docs/api/tokens-sync.json");
const PACKAGE_PATH = path.join(ROOT, "package.json");
const EXPECTED_FILE_KEY = "IE68amP9Hya5ieFw1rX8S8";
const SCHEMA = "ds-tis/figma-release-evidence@1";
const MAX_SNAPSHOT_AGE_HOURS = 24;
const CSS_ONLY_COMPONENTS = new Set(["form-field"]);
const writeMode = process.argv.includes("--write");

if (writeMode) writeEvidence();
else verifyEvidence(readJson(EVIDENCE_PATH));

function writeEvidence() {
  if (!fs.existsSync(SNAPSHOT_PATH)) {
    fail(".figma-snapshot.json ausente; gere um export vivo antes da atestação.");
  }

  const snapshot = readJson(SNAPSHOT_PATH);
  const snapshotGeneratedAt = Date.parse(snapshot.generatedAt || "");
  const verifiedAt = new Date();
  const snapshotAgeHours = (verifiedAt.getTime() - snapshotGeneratedAt) / 3_600_000;

  if (!Number.isFinite(snapshotGeneratedAt)) fail("Snapshot Figma sem generatedAt válido.");
  if (snapshotAgeHours < 0 || snapshotAgeHours > MAX_SNAPSHOT_AGE_HOURS) {
    fail(`Snapshot Figma tem ${snapshotAgeHours.toFixed(1)}h; máximo permitido é ${MAX_SNAPSHOT_AGE_HOURS}h.`);
  }
  if (snapshot.fileKey !== EXPECTED_FILE_KEY || snapshot.expectedFileKey !== EXPECTED_FILE_KEY) {
    fail(`Snapshot pertence ao arquivo incorreto: ${snapshot.fileKey || "?"}.`);
  }

  runGate("npm", ["run", "verify:tokens"]);
  runGate("npm", ["run", "verify:figma-structure"]);
  runGate("npm", ["run", "audit:component-tokens"]);

  const packageJson = readJson(PACKAGE_PATH);
  const tokenReport = readJson(TOKEN_REPORT_PATH);
  const jsonVsFigma = tokenReport.checks?.jsonVsFigma;
  const summary = jsonVsFigma?.summary || {};
  const usage = snapshot.structureAudit?.variableUsage || {};
  const unusedVariables = Array.isArray(usage.unusedComponentVariables) ? usage.unusedComponentVariables : [];
  const allowedUnusedVariables = unusedVariables.filter((variable) =>
    CSS_ONLY_COMPONENTS.has(String(variable.name || "").split("/")[0])
  );
  const actionableUnusedVariables = unusedVariables.filter((variable) =>
    !CSS_ONLY_COMPONENTS.has(String(variable.name || "").split("/")[0])
  );
  const tokenState = digestTokenState();

  if (tokenReport.totals?.errors !== 0 || tokenReport.totals?.warnings !== 0) {
    fail("verify:tokens não produziu relatório limpo.");
  }
  if (!jsonVsFigma || jsonVsFigma.skipped || jsonVsFigma.snapshotFreshness !== "fresh") {
    fail("verify:tokens não validou um snapshot Figma fresco.");
  }
  for (const key of ["VALUE_DRIFT", "NEEDS_SYNC", "DRIFT_FROM_SOURCE", "ALIAS_BROKEN"]) {
    if ((summary[key] || 0) !== 0) fail(`jsonVsFigma.${key} precisa ser zero.`);
  }
  if ((snapshot.structureAudit?.issueCount ?? -1) !== 0) {
    fail("Snapshot contém problemas estruturais do Figma.");
  }
  if (actionableUnusedVariables.length !== 0) {
    fail(`Snapshot contém ${actionableUnusedVariables.length} Component variables sem uso real fora das exceções CSS-only.`);
  }

  const evidence = {
    schema: SCHEMA,
    packageVersion: packageJson.version,
    verifiedAt: verifiedAt.toISOString(),
    policy: {
      snapshotMaxAgeHours: MAX_SNAPSHOT_AGE_HOURS,
      snapshotIsCommitted: false,
      verificationModel: "fresh-local-snapshot-with-committed-digests",
    },
    source: {
      fileKey: snapshot.fileKey,
      expectedFileKey: snapshot.expectedFileKey,
      fileName: snapshot.fileName,
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotAgeHoursAtVerification: Number(snapshotAgeHours.toFixed(3)),
      snapshotSha256: sha256File(SNAPSHOT_PATH),
      exporter: snapshot.generator || null,
      variableCount: Object.keys(snapshot.variables || {}).length,
      collectionCount: Object.keys(snapshot.variableCollections || {}).length,
    },
    repository: tokenState,
    checks: {
      verifyTokens: {
        errors: tokenReport.totals.errors,
        warnings: tokenReport.totals.warnings,
        jsonTokenCount: tokenReport.totals.jsonTokens,
      },
      jsonVsFigma: {
        skipped: false,
        snapshotFreshness: jsonVsFigma.snapshotFreshness,
        valueDrift: summary.VALUE_DRIFT || 0,
        needsSync: summary.NEEDS_SYNC || 0,
        driftFromSource: summary.DRIFT_FROM_SOURCE || 0,
        aliasBroken: summary.ALIAS_BROKEN || 0,
        cssOnly: summary.CSS_ONLY || 0,
        byDesign: summary.BY_DESIGN || 0,
      },
      figmaStructure: {
        issueCount: snapshot.structureAudit.issueCount,
        componentPageCount: snapshot.structureAudit.componentPageCount,
        componentVariableCount: usage.componentVariableCount,
        usedComponentVariableCount: usage.usedComponentVariableCount,
        unusedComponentVariableCount: usage.unusedComponentVariableCount,
        allowedCssOnlyUnusedCount: allowedUnusedVariables.length,
        actionableUnusedCount: actionableUnusedVariables.length,
      },
    },
  };

  fs.mkdirSync(path.dirname(EVIDENCE_PATH), { recursive: true });
  fs.writeFileSync(EVIDENCE_PATH, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  verifyEvidence(evidence);
  console.log(`✅ Evidência Figma da versão ${packageJson.version} gravada em docs/api/release-figma-evidence.json.`);
}

function verifyEvidence(evidence) {
  const errors = [];
  const packageJson = readJson(PACKAGE_PATH);
  const tokenState = digestTokenState();

  check(evidence.schema === SCHEMA, `schema inválido: ${evidence.schema || "ausente"}`, errors);
  check(evidence.packageVersion === packageJson.version, `evidência ${evidence.packageVersion || "?"} não corresponde ao pacote ${packageJson.version}`, errors);
  check(evidence.source?.fileKey === EXPECTED_FILE_KEY, "fileKey Figma incorreto", errors);
  check(evidence.source?.expectedFileKey === EXPECTED_FILE_KEY, "expectedFileKey Figma incorreto", errors);
  check(/^[a-f0-9]{64}$/.test(evidence.source?.snapshotSha256 || ""), "digest do snapshot inválido", errors);
  check(
    Number.isFinite(evidence.source?.snapshotAgeHoursAtVerification) &&
      evidence.source.snapshotAgeHoursAtVerification >= 0 &&
      evidence.source.snapshotAgeHoursAtVerification <= MAX_SNAPSHOT_AGE_HOURS,
    "snapshot não estava fresco no momento da atestação",
    errors
  );
  check(evidence.repository?.tokenSha256 === tokenState.tokenSha256, "tokens mudaram depois da validação Figma", errors);
  check(evidence.repository?.tokenFileCount === tokenState.tokenFileCount, "inventário de arquivos de token mudou", errors);
  check(evidence.checks?.verifyTokens?.errors === 0, "verify:tokens registrou erros", errors);
  check(evidence.checks?.verifyTokens?.warnings === 0, "verify:tokens registrou avisos", errors);
  check(evidence.checks?.jsonVsFigma?.skipped === false, "comparação JSON ↔ Figma foi pulada", errors);
  check(evidence.checks?.jsonVsFigma?.snapshotFreshness === "fresh", "comparação usou snapshot stale", errors);
  check(evidence.checks?.jsonVsFigma?.valueDrift === 0, "VALUE_DRIFT diferente de zero", errors);
  check(evidence.checks?.jsonVsFigma?.needsSync === 0, "NEEDS_SYNC diferente de zero", errors);
  check(evidence.checks?.jsonVsFigma?.driftFromSource === 0, "DRIFT_FROM_SOURCE diferente de zero", errors);
  check(evidence.checks?.jsonVsFigma?.aliasBroken === 0, "ALIAS_BROKEN diferente de zero", errors);
  check(evidence.checks?.figmaStructure?.issueCount === 0, "estrutura Figma contém problemas", errors);
  check(evidence.checks?.figmaStructure?.actionableUnusedCount === 0, "há Component variables sem uso fora das exceções CSS-only", errors);

  if (errors.length > 0) {
    console.error("\n❌ Evidência Figma de release inválida:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log(
    `✅ Evidência Figma válida para ${packageJson.version}: ${evidence.source.variableCount} variables, ` +
      `${evidence.checks.figmaStructure.componentPageCount} páginas, digest ${tokenState.tokenSha256.slice(0, 12)}…`
  );
}

function digestTokenState() {
  const tokenRoot = path.join(ROOT, "tokens");
  const files = walkJsonFiles(tokenRoot).sort();
  const hash = crypto.createHash("sha256");

  for (const file of files) {
    hash.update(path.relative(ROOT, file));
    hash.update("\0");
    hash.update(fs.readFileSync(file));
    hash.update("\0");
  }

  return {
    tokenSha256: hash.digest("hex"),
    tokenFileCount: files.length,
  };
}

function walkJsonFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkJsonFiles(absolutePath);
    return entry.isFile() && entry.name.endsWith(".json") ? [absolutePath] : [];
  });
}

function sha256File(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function runGate(command, args) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: "inherit" });
  if (result.error) fail(`${command} ${args.join(" ")} falhou: ${result.error.message}`);
  if (result.status !== 0) process.exit(result.status || 1);
}

function readJson(file) {
  if (!fs.existsSync(file)) fail(`${path.relative(ROOT, file)} ausente.`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function check(condition, message, errors) {
  if (!condition) errors.push(message);
}

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}
