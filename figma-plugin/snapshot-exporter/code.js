const EXPECTED_FILE_KEY = "IE68amP9Hya5ieFw1rX8S8";
const EXPORTER_VERSION = "0.2.0";
const STROKE_WEIGHT_FIELDS = [
  "strokeWeight",
  "strokeTopWeight",
  "strokeRightWeight",
  "strokeBottomWeight",
  "strokeLeftWeight",
];

figma.showUI(__html__, {
  width: 560,
  height: 620,
  themeColors: true,
});

figma.ui.onmessage = async (message) => {
  if (!message || typeof message.type !== "string") return;

  if (message.type === "export-snapshot") {
    await exportSnapshot();
    return;
  }

  if (message.type === "close") {
    figma.closePlugin();
  }
};

exportSnapshot().catch((error) => {
  figma.ui.postMessage({
    type: "snapshot-error",
    message: error && error.message ? error.message : String(error),
  });
});

async function exportSnapshot() {
  figma.ui.postMessage({ type: "snapshot-status", message: "Lendo Variables locais..." });

  const [collections, variables] = await Promise.all([
    figma.variables.getLocalVariableCollectionsAsync(),
    figma.variables.getLocalVariablesAsync(),
  ]);

  const variableCollections = {};
  for (const collection of collections) {
    variableCollections[collection.id] = serializeCollection(collection);
  }

  const serializedVariables = {};
  for (const variable of variables) {
    serializedVariables[variable.id] = serializeVariable(variable);
  }

  figma.ui.postMessage({ type: "snapshot-status", message: "Auditando estrutura dos componentes..." });

  const structureAudit = await buildStructureAudit(variables, variableCollections);
  const collectionCounts = countByCollection(variables, variableCollections);
  const snapshot = {
    generatedAt: new Date().toISOString(),
    generator: {
      name: "Design System Snapshot Exporter",
      version: EXPORTER_VERSION,
      source: "figma-plugin/snapshot-exporter",
    },
    fileKey: figma.fileKey || null,
    expectedFileKey: EXPECTED_FILE_KEY,
    fileName: figma.root.name,
    variableCollections,
    variables: serializedVariables,
    structureAudit,
  };

  figma.ui.postMessage({
    type: "snapshot-ready",
    snapshot,
    summary: {
      fileKey: snapshot.fileKey,
      expectedFileKey: EXPECTED_FILE_KEY,
      collectionCount: collections.length,
      variableCount: variables.length,
      collectionCounts,
      structureIssueCount: structureAudit.issueCount,
      generatedAt: snapshot.generatedAt,
    },
  });
}

function serializeCollection(collection) {
  return {
    id: collection.id,
    key: collection.key || null,
    name: collection.name,
    modes: collection.modes.map((mode) => ({
      modeId: mode.modeId,
      name: mode.name,
    })),
    defaultModeId: collection.defaultModeId,
    hiddenFromPublishing: Boolean(collection.hiddenFromPublishing),
    remote: Boolean(collection.remote),
  };
}

function serializeVariable(variable) {
  const valuesByMode = {};
  for (const [modeId, value] of Object.entries(variable.valuesByMode)) {
    valuesByMode[modeId] = serializeValue(value);
  }

  return {
    id: variable.id,
    key: variable.key || null,
    name: variable.name,
    resolvedType: variable.resolvedType,
    variableCollectionId: variable.variableCollectionId,
    valuesByMode,
    description: variable.description || "",
    scopes: Array.isArray(variable.scopes) ? variable.scopes.slice() : [],
    codeSyntax: variable.codeSyntax ? Object.assign({}, variable.codeSyntax) : {},
    hiddenFromPublishing: Boolean(variable.hiddenFromPublishing),
    remote: Boolean(variable.remote),
  };
}

function serializeValue(value) {
  if (value == null) return value;

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (typeof value !== "object") {
    return value;
  }

  if (value.type === "VARIABLE_ALIAS") {
    return {
      type: "VARIABLE_ALIAS",
      id: value.id,
    };
  }

  if (typeof value.r === "number" && typeof value.g === "number" && typeof value.b === "number") {
    return {
      r: value.r,
      g: value.g,
      b: value.b,
      a: typeof value.a === "number" ? value.a : 1,
    };
  }

  const output = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    output[key] = serializeValue(nestedValue);
  }
  return output;
}

function countByCollection(variables, collectionsById) {
  const counts = {};
  for (const variable of variables) {
    const collection = collectionsById[variable.variableCollectionId];
    const name = collection ? collection.name : variable.variableCollectionId;
    counts[name] = (counts[name] || 0) + 1;
  }
  return counts;
}

async function buildStructureAudit(variables, collectionsById) {
  const variablesById = new Map(variables.map((variable) => [variable.id, variable]));
  const collectionNameById = new Map(
    Object.entries(collectionsById).map(([id, collection]) => [id, collection.name])
  );
  const issues = [];
  const usageByVariable = new Map();

  auditVariables(variables, variablesById, collectionNameById, issues);

  const componentPages = figma.root.children.filter((page) => /❖/.test(page.name));
  const pageSummary = [];

  for (const page of componentPages) {
    if (typeof figma.setCurrentPageAsync === "function") {
      await figma.setCurrentPageAsync(page);
    } else {
      figma.currentPage = page;
    }
    const before = issues.length;
    await auditPageNodes(page, variablesById, collectionNameById, issues, usageByVariable);
    pageSummary.push({
      pageId: page.id,
      pageName: page.name,
      issueCount: issues.length - before,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    componentPageCount: componentPages.length,
    collectionCounts: countByCollection(variables, collectionsById),
    aliasSummary: summarizeAliases(variables, variablesById, collectionNameById),
    variableUsage: summarizeVariableUsage(variables, usageByVariable, collectionNameById),
    pageSummary,
    issueCount: issues.length,
    grouped: groupIssues(issues),
    issues: issues.slice(0, 500),
    truncated: issues.length > 500,
  };
}

function auditVariables(variables, variablesById, collectionNameById, issues) {
  for (const variable of variables) {
    const collectionName = collectionNameById.get(variable.variableCollectionId) || "";
    const syntax = variable.codeSyntax || {};

    if (!syntax.WEB) {
      addIssue(issues, "variable", "missing-web-syntax", variable.name, {
        collection: collectionName,
      });
    }

    if (Array.isArray(variable.scopes) && variable.scopes.includes("ALL_SCOPES")) {
      addIssue(issues, "variable", "all-scopes", variable.name, {
        collection: collectionName,
      });
    }

    if (/\bglyph\b/i.test(variable.name)) {
      addIssue(issues, "variable", "legacy-glyph-name", variable.name, {
        collection: collectionName,
      });
    }

    if (variable.name.includes("error-hover")) {
      addIssue(issues, "variable", "legacy-error-hover-name", variable.name, {
        collection: collectionName,
      });
    }

    if (variable.name.includes("danger") && !variable.name.startsWith("button/")) {
      addIssue(issues, "variable", "danger-outside-button", variable.name, {
        collection: collectionName,
      });
    }

    for (const [modeId, value] of Object.entries(variable.valuesByMode || {})) {
      if (!value || value.type !== "VARIABLE_ALIAS") {
        if (collectionName === "Component") {
          addIssue(issues, "variable", "component-raw-value", variable.name, {
            collection: collectionName,
            modeId,
          });
        }
        if (collectionName === "Semantic") {
          addIssue(issues, "variable", "semantic-raw-value", variable.name, {
            collection: collectionName,
            modeId,
          });
        }
        continue;
      }

      const target = variablesById.get(value.id);
      const targetCollection = target
        ? collectionNameById.get(target.variableCollectionId) || ""
        : "missing";

      if (!target) {
        addIssue(issues, "variable", "missing-alias-target", variable.name, {
          collection: collectionName,
          modeId,
          targetId: value.id,
        });
        continue;
      }

      if (collectionName === "Component" && targetCollection !== "Semantic") {
        addIssue(issues, "variable", "component-alias-not-semantic", variable.name, {
          collection: collectionName,
          modeId,
          target: target.name,
          targetCollection,
        });
      }

      if (collectionName === "Semantic" && targetCollection === "Component") {
        addIssue(issues, "variable", "semantic-alias-component", variable.name, {
          collection: collectionName,
          modeId,
          target: target.name,
          targetCollection,
        });
      }

      auditComponentAliasSemantics(variable.name, target.name, issues, modeId);
    }
  }
}

function auditComponentAliasSemantics(sourceName, targetName, issues, modeId) {
  if (!sourceName.includes("/")) return;

  if (sourceName.includes("/icon/color/") && !targetName.startsWith("icon/color/")) {
    addIssue(issues, "variable", "component-icon-color-alias", sourceName, { modeId, target: targetName });
  }

  if (sourceName.includes("/border-color/") && !/^(border|brand\/border|outline\/border|feedback\/[a-z]+\/border)\//.test(targetName)) {
    addIssue(issues, "variable", "component-border-color-alias", sourceName, { modeId, target: targetName });
  }

  if (sourceName.includes("/focus-ring/color/") && !targetName.startsWith("focus-ring/color/")) {
    addIssue(issues, "variable", "component-focus-ring-color-alias", sourceName, { modeId, target: targetName });
  }

  if (sourceName.includes("/bg/") && !/^(background|surface|overlay|brand\/background|feedback|toned\/background|outline\/background|ghost\/background)\//.test(targetName)) {
    addIssue(issues, "variable", "component-background-alias", sourceName, { modeId, target: targetName });
  }
}

async function auditPageNodes(page, variablesById, collectionNameById, issues, usageByVariable) {
  const nodes = page.findAll(() => true);

  for (const node of nodes) {
    const path = nodePath(node);
    const isFinalComponentNode = isInsideFinalComponent(node);

    if (isFinalComponentNode) {
      collectVariableUsage(node.boundVariables, path, usageByVariable);
      if (Array.isArray(node.fills)) {
        for (const paint of node.fills) collectVariableUsage(paint && paint.boundVariables, path, usageByVariable);
      }
      if (Array.isArray(node.strokes)) {
        for (const paint of node.strokes) collectVariableUsage(paint && paint.boundVariables, path, usageByVariable);
      }
    }

    if (isFinalComponentNode && /\bglyph\b/i.test(node.name)) {
      addIssue(issues, "node", "legacy-glyph-node", path, { nodeId: node.id, pageName: page.name });
    }

    if (isFinalComponentNode && node.type === "INSTANCE") {
      let mainComponent = null;
      try {
        mainComponent = await node.getMainComponentAsync();
      } catch (error) {
        mainComponent = null;
      }

      const mainName = mainComponent ? mainComponent.name : "";
      if (/Icon Placeholder/i.test(mainName)) {
        addIssue(issues, "node", "icon-placeholder-instance", path, {
          nodeId: node.id,
          pageName: page.name,
          mainComponent: mainName,
        });
      }

      if (mainName.startsWith("lucide/")) {
        auditLucideInstance(node, path, variablesById, collectionNameById, issues, page.name, mainName);
      }
    }

    if (isFinalComponentNode && /focus ring/i.test(node.name)) {
      auditFocusRingNode(node, path, variablesById, collectionNameById, issues, page.name);
    }
  }
}

function isInsideFinalComponent(node) {
  let current = node;
  while (current && current.type !== "PAGE" && current.type !== "DOCUMENT") {
    if (current.type === "COMPONENT" || current.type === "COMPONENT_SET") {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function auditLucideInstance(node, path, variablesById, collectionNameById, issues, pageName, mainComponent) {
  const width = variableRefInfo(node.boundVariables && node.boundVariables.width, variablesById, collectionNameById);
  const height = variableRefInfo(node.boundVariables && node.boundVariables.height, variablesById, collectionNameById);
  const color = findPaintBinding(node, variablesById, collectionNameById);
  const stroke = getStrokeWeightBindingInfo(node, variablesById, collectionNameById);
  const hasStroke = hasVisibleStroke(node);

  if (!isComponentBinding(width)) {
    addIssue(issues, "node", "lucide-width-not-component-bound", path, { nodeId: node.id, pageName, mainComponent, binding: width });
  }

  if (!isComponentBinding(height)) {
    addIssue(issues, "node", "lucide-height-not-component-bound", path, { nodeId: node.id, pageName, mainComponent, binding: height });
  }

  if (!isComponentBinding(color)) {
    addIssue(issues, "node", "lucide-color-not-component-bound", path, { nodeId: node.id, pageName, mainComponent, binding: color });
  }

  if (hasStroke && !isComponentBinding(stroke)) {
    addIssue(issues, "node", "lucide-stroke-width-not-component-bound", path, {
      nodeId: node.id,
      pageName,
      mainComponent,
      binding: stroke,
    });
  }
}

function auditFocusRingNode(node, path, variablesById, collectionNameById, issues, pageName) {
  const color = findPaintBinding(node, variablesById, collectionNameById);
  const stroke = getStrokeWeightBindingInfo(node, variablesById, collectionNameById);

  if (!color || color.collection !== "Component" || !/(^|\/)focus-ring\/color\//.test(color.name)) {
    addIssue(issues, "node", "focus-ring-color-not-component-focus-ring", path, {
      nodeId: node.id,
      pageName,
      binding: color,
    });
  }

  if (!stroke || stroke.collection !== "Component" || !/(^|\/)focus-ring\/width$/.test(stroke.name)) {
    addIssue(issues, "node", "focus-ring-width-not-component-focus-ring", path, {
      nodeId: node.id,
      pageName,
      binding: stroke,
    });
  }
}

function summarizeAliases(variables, variablesById, collectionNameById) {
  const summary = {
    componentTotal: 0,
    componentAliasSemantic: 0,
    componentRaw: 0,
    componentAliasOther: 0,
    semanticTotal: 0,
    semanticRaw: 0,
  };

  for (const variable of variables) {
    const collectionName = collectionNameById.get(variable.variableCollectionId) || "";
    for (const value of Object.values(variable.valuesByMode || {})) {
      if (collectionName === "Component") {
        summary.componentTotal += 1;
        if (!value || value.type !== "VARIABLE_ALIAS") {
          summary.componentRaw += 1;
          continue;
        }
        const target = variablesById.get(value.id);
        const targetCollection = target ? collectionNameById.get(target.variableCollectionId) || "" : "";
        if (targetCollection === "Semantic") summary.componentAliasSemantic += 1;
        else summary.componentAliasOther += 1;
      }
      if (collectionName === "Semantic") {
        summary.semanticTotal += 1;
        if (!value || value.type !== "VARIABLE_ALIAS") summary.semanticRaw += 1;
      }
    }
  }

  return summary;
}

function summarizeVariableUsage(variables, usageByVariable, collectionNameById) {
  const componentRows = variables
    .filter((variable) => collectionNameById.get(variable.variableCollectionId) === "Component")
    .map((variable) => {
      const entry = usageByVariable.get(variable.id) || { count: 0, samples: [] };
      return {
        id: variable.id,
        name: variable.name,
        type: variable.resolvedType,
        usageCount: entry.count,
        samples: entry.samples,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const unused = componentRows.filter((row) => row.usageCount === 0);
  const unusedByComponent = {};
  for (const row of unused) {
    const component = row.name.split("/")[0] || "unknown";
    unusedByComponent[component] = (unusedByComponent[component] || 0) + 1;
  }

  return {
    componentVariableCount: componentRows.length,
    usedComponentVariableCount: componentRows.length - unused.length,
    unusedComponentVariableCount: unused.length,
    unusedByComponent,
    unusedComponentVariables: unused,
  };
}

function collectVariableUsage(value, path, usageByVariable) {
  if (!value) return;
  if (Array.isArray(value)) {
    for (const item of value) collectVariableUsage(item, path, usageByVariable);
    return;
  }
  if (typeof value !== "object") return;

  if (typeof value.id === "string") addVariableUsage(value.id, path, usageByVariable);
  if (value.type === "VARIABLE_ALIAS" && typeof value.id === "string") {
    addVariableUsage(value.id, path, usageByVariable);
  }

  for (const nested of Object.values(value)) {
    collectVariableUsage(nested, path, usageByVariable);
  }
}

function addVariableUsage(id, path, usageByVariable) {
  if (!usageByVariable.has(id)) {
    usageByVariable.set(id, { count: 0, samples: [] });
  }
  const entry = usageByVariable.get(id);
  entry.count += 1;
  if (entry.samples.length < 3) entry.samples.push(path);
}

function findPaintBinding(node, variablesById, collectionNameById) {
  for (const current of [node].concat(findDescendants(node))) {
    const bound = current.boundVariables || {};
    for (const field of ["fills", "strokes"]) {
      const refs = toArray(bound[field]);
      for (const ref of refs) {
        const info = variableRefInfo(ref, variablesById, collectionNameById);
        if (info) return info;
      }
    }
  }
  return null;
}

function getStrokeWeightBindingInfo(node, variablesById, collectionNameById) {
  for (const current of [node].concat(findDescendants(node))) {
    const bound = current.boundVariables || {};
    for (const field of STROKE_WEIGHT_FIELDS) {
      const info = variableRefInfo(bound[field], variablesById, collectionNameById);
      if (info) return info;
    }
  }
  return null;
}

function hasVisibleStroke(node) {
  for (const current of [node].concat(findDescendants(node))) {
    if (!Array.isArray(current.strokes)) continue;
    if (current.strokes.some((paint) => paint && paint.visible !== false)) return true;
  }
  return false;
}

function findDescendants(node) {
  if (!("children" in node) || !Array.isArray(node.children)) return [];
  let out = [];
  for (const child of node.children) {
    out.push(child);
    out = out.concat(findDescendants(child));
  }
  return out;
}

function variableRefInfo(ref, variablesById, collectionNameById) {
  if (!ref) return null;
  const id = typeof ref === "string" ? ref : ref.id;
  if (!id) return null;
  const variable = variablesById.get(id);
  if (!variable) return { id, name: null, collection: "missing" };
  return {
    id,
    name: variable.name,
    collection: collectionNameById.get(variable.variableCollectionId) || variable.variableCollectionId,
  };
}

function isComponentBinding(info) {
  return Boolean(info && info.collection === "Component");
}

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function nodePath(node) {
  const parts = [];
  let current = node;
  while (current) {
    parts.unshift(current.name);
    current = current.parent;
    if (current && current.type === "DOCUMENT") break;
  }
  return parts.join(" / ");
}

function groupIssues(issues) {
  const grouped = {};
  for (const issue of issues) {
    grouped[issue.code] = (grouped[issue.code] || 0) + 1;
  }
  return grouped;
}

function addIssue(issues, scope, code, target, details) {
  issues.push({ scope, code, target, details: details || {} });
}
