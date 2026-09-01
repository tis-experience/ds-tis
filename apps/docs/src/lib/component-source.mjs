import fs from 'node:fs';
import path from 'node:path';

import { parse, serializeOuter } from 'parse5';

// Adaptador temporário de migração. O HTML v1 continua sendo lido somente por
// landmarks explícitos; quando a API editorial estruturada existir, este módulo
// poderá ser removido sem alterar os MDX consumidores.
const ROOT = findRepoRoot(process.env.INIT_CWD || process.cwd());
const COMPONENTS_API_PATH = path.join(ROOT, 'docs', 'api', 'components.json');
const ALLOWED_TOPICS = new Set(['design', 'usage', 'code', 'accessibility']);
const ALLOWED_LOCALES = new Set(['pt', 'en']);
const ALLOWED_SECTION_TAGS = new Set(['div', 'section']);
const BLOCKED_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed']);
const BLOCKED_CLASSES = new Set([
  'ds-preview__tabs',
  'ds-preview__code',
  'ds-preview__copy',
]);
const INERT_DEMO_CLASSES = new Set(['ds-preview__canvas', 'ds-dodont__preview']);
const REFERENCE_TABLE_CLASSES = new Set(['ds-token-table']);
const TABLE_SCROLL_CLASS = 'ds-table-scroll';
const URL_ATTRIBUTES = new Set(['action', 'formaction', 'href', 'poster', 'src', 'xlink:href']);

let catalogCache;
const sourceCache = new Map();

export function getComponentGuidance(slug, topic, locale = 'pt', options = {}) {
  if (!ALLOWED_TOPICS.has(topic)) {
    throw new Error(`Tópico de documentação inválido: ${topic}`);
  }
  if (!ALLOWED_LOCALES.has(locale)) {
    throw new Error(`Locale de documentação inválido: ${locale}`);
  }

  const component = getComponent(slug);
  const sourcePath = resolveComponentHtml(component);
  const sourceLabel = path.relative(ROOT, sourcePath);
  const html = extractGuidanceHtml(getSource(sourcePath), {
    slug,
    topic,
    locale,
    sourceLabel,
    linkBase: options.linkBase,
    excludeOrders: options.excludeOrders,
    includeOrders: options.includeOrders,
  });

  return {
    component,
    html,
    sourcePath: sourceLabel,
    topic,
    locale,
  };
}

// Export puro para que o contrato de ingestão possa ser validado com fixtures
// hostis sem alterar o HTML canônico do componente.
export function extractGuidanceHtml(
  sourceHtml,
  {
    slug = 'component',
    topic,
    locale = 'pt',
    sourceLabel = 'HTML informado',
    linkBase = '',
    excludeOrders = [],
    includeOrders = [],
  },
) {
  if (!ALLOWED_TOPICS.has(topic)) {
    throw new Error(`Tópico de documentação inválido: ${topic}`);
  }
  if (!ALLOWED_LOCALES.has(locale)) {
    throw new Error(`Locale de documentação inválido: ${locale}`);
  }

  const document = parse(sourceHtml);
  const sourceSections = findAll(
    document,
    (node) => getAttribute(node, 'data-doc-topic') === topic,
  );

  if (sourceSections.length === 0) {
    throw new Error(
      `${slug}: nenhuma seção data-doc-topic="${topic}" encontrada em ${sourceLabel}`,
    );
  }

  return sourceSections
    .filter((section) => includeOrders.length === 0 || includeOrders.includes(getDocumentOrder(section)))
    .filter((section) => !excludeOrders.includes(getDocumentOrder(section)))
    .sort((left, right) => getDocumentOrder(left) - getDocumentOrder(right))
    .map((section) => {
      const localized = structuredClone(section);
      normalizeSection(localized, locale, slug, linkBase);
      return serializeOuter(localized);
    })
    .join('\n');
}

function getDocumentOrder(node) {
  const value = Number.parseInt(getAttribute(node, 'data-doc-order') || '', 10);
  return Number.isInteger(value) ? value : 1000;
}

export function getComponent(slug) {
  const catalog = getCatalog();
  const component = catalog.components.find((entry) => entry.slug === slug);
  if (!component) {
    throw new Error(`Componente ausente em docs/api/components.json: ${slug}`);
  }
  return component;
}

export function getComponents() {
  return [...getCatalog().components];
}

function getCatalog() {
  if (!catalogCache) {
    catalogCache = JSON.parse(fs.readFileSync(COMPONENTS_API_PATH, 'utf8'));
  }
  return catalogCache;
}

function resolveComponentHtml(component) {
  const sourceUrl = new URL(component.url, 'https://ds-tis.local/');
  const sourceName = path.basename(sourceUrl.pathname);
  const sourcePath = path.join(ROOT, 'docs', sourceName);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`${component.slug}: HTML canônico ausente em ${sourcePath}`);
  }
  return sourcePath;
}

function getSource(sourcePath) {
  if (!sourceCache.has(sourcePath)) {
    sourceCache.set(sourcePath, fs.readFileSync(sourcePath, 'utf8'));
  }
  return sourceCache.get(sourcePath);
}

function findAll(node, predicate, matches = []) {
  if (predicate(node)) matches.push(node);
  for (const child of node.childNodes || []) findAll(child, predicate, matches);
  return matches;
}

function getAttribute(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name)?.value;
}

function normalizeSection(section, locale, slug, linkBase) {
  if (!ALLOWED_SECTION_TAGS.has(section.tagName) || hasBlockedClass(section)) {
    throw new Error(
      `${slug}: landmark data-doc-topic deve usar uma raiz div/section permitida`,
    );
  }

  sanitizeAttributes(section);
  transformChildren(section, locale, linkBase);
  delete section.parentNode;
}

function transformChildren(parent, locale, linkBase) {
  const localizedChildren = [];

  for (const child of parent.childNodes || []) {
    if (BLOCKED_TAGS.has(child.tagName)) continue;
    if (hasBlockedClass(child)) continue;

    const language = getAttribute(child, 'data-lang');
    if (language && language !== locale) continue;

    sanitizeAttributes(child);
    rewriteRelativeDocumentLink(child, linkBase);
    if (hasAnyClass(child, INERT_DEMO_CLASSES)) {
      setBooleanAttribute(child, 'inert');
    }
    transformChildren(child, locale, linkBase);

    if (child.tagName === 'h2') {
      child.tagName = 'h3';
      child.nodeName = 'h3';
    }

    if (language === locale && child.tagName === 'span') {
      for (const grandchild of child.childNodes || []) {
        grandchild.parentNode = parent;
        localizedChildren.push(grandchild);
      }
      continue;
    }

    if (
      child.tagName === 'table' &&
      hasAnyClass(child, REFERENCE_TABLE_CLASSES) &&
      !hasClass(parent, TABLE_SCROLL_CLASS)
    ) {
      localizedChildren.push(createTableScroller(child, parent));
      continue;
    }

    child.parentNode = parent;
    localizedChildren.push(child);
  }

  parent.childNodes = localizedChildren;
}

function rewriteRelativeDocumentLink(node, linkBase) {
  if (!linkBase || !node.attrs) return;
  const href = node.attrs.find((attribute) => attribute.name === 'href');
  if (!href || !/^[^/?#][^:]*\.html(?:[?#].*)?$/i.test(href.value)) return;

  const baseUrl = new URL(`${linkBase.replace(/\/+$/, '')}/`, 'https://docs.local');
  const targetUrl = new URL(href.value.replaceAll('\\', '/'), baseUrl);
  if (
    targetUrl.origin !== baseUrl.origin ||
    !targetUrl.pathname.startsWith(baseUrl.pathname)
  ) {
    node.attrs = node.attrs.filter((attribute) => attribute !== href);
    return;
  }

  href.value = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
}

function hasBlockedClass(node) {
  const classes = (getAttribute(node, 'class') || '').split(/\s+/);
  return classes.some((className) => BLOCKED_CLASSES.has(className));
}

function hasAnyClass(node, classNames) {
  return (getAttribute(node, 'class') || '')
    .split(/\s+/)
    .some((className) => classNames.has(className));
}

function hasClass(node, className) {
  return (getAttribute(node, 'class') || '').split(/\s+/).includes(className);
}

function createTableScroller(table, parent) {
  const wrapper = {
    nodeName: 'div',
    tagName: 'div',
    attrs: [{ name: 'class', value: TABLE_SCROLL_CLASS }],
    namespaceURI: table.namespaceURI,
    childNodes: [table],
    parentNode: parent,
  };
  table.parentNode = wrapper;
  return wrapper;
}

function setBooleanAttribute(node, name) {
  if (!node.attrs) node.attrs = [];
  if (!getAttribute(node, name)) node.attrs.push({ name, value: '' });
}

function sanitizeAttributes(node) {
  if (!node.attrs) return;
  node.attrs = node.attrs.filter((attribute) => {
    const name = attribute.name.toLowerCase();
    if (name.startsWith('on') || name === 'srcdoc' || name === 'srcset') return false;
    if (name === 'style' && hasUnsafeStyle(attribute.value)) return false;
    if (URL_ATTRIBUTES.has(name) && hasUnsafeUrl(attribute.value)) return false;
    return true;
  });
}

function hasUnsafeStyle(value) {
  return /(?:expression\s*\(|@import|-moz-binding|behavior\s*:|url\s*\(\s*['"]?\s*(?:javascript|data\s*:\s*text\/html))/i.test(
    value,
  );
}

function hasUnsafeUrl(value) {
  const normalized = value.replace(/[\u0000-\u0020\u007f]+/g, '').toLowerCase();
  return /^(?:javascript|vbscript):/.test(normalized) || /^data:text\/html/.test(normalized);
}

function findRepoRoot(startDirectory) {
  let directory = path.resolve(startDirectory);

  while (true) {
    const packagePath = path.join(directory, 'package.json');
    const componentsPath = path.join(directory, 'docs', 'api', 'components.json');
    if (fs.existsSync(packagePath) && fs.existsSync(componentsPath)) return directory;

    const parent = path.dirname(directory);
    if (parent === directory) {
      throw new Error(`Raiz do DS TIS não encontrada a partir de ${startDirectory}`);
    }
    directory = parent;
  }
}
