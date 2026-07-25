const iconPaths = {
  'arrow-up-down': '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
  'chevron-left': '<polyline points="15 18 9 12 15 6"/>',
  'chevron-right': '<polyline points="9 18 15 12 9 6"/>',
  circle: '<circle cx="12" cy="12" r="9"/>',
  'circle-alert': '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/>',
  'triangle-alert': '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
};

export function icon(name, className = 'ds-icon') {
  const paths = iconPaths[name] || iconPaths.circle;
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function componentDescription(slug, summary) {
  const component = COMPONENTS.find((item) => item.slug === slug);
  const contract = STORYBOOK_CONTRACTS[slug];
  const runtime = RUNTIME_BY_SLUG[slug];
  const responsibility = component ? responsibilityFor(component, runtime) : null;
  const states = contract?.states?.map((state) => `\`${state}\``).join(', ');

  return [
    summary,
    contract ? `**Quando usar:** ${contract.usage}` : '',
    contract ? `**Evite:** ${contract.avoid}` : '',
    responsibility ? `**Implementação:** ${responsibility.ds}` : '',
    runtime ? `**Runtime:** \`${runtime.module}\` — \`${runtime.init}\` após render e \`${runtime.destroy}\` ao desmontar.` : '',
    states ? `**Estados representados:** ${states}.` : '',
    `[Documentação completa](https://tis-experience.github.io/ds-tis/docs/${slug}.html).`,
  ].filter(Boolean).join('\n\n');
}

export function storyDescription(description) {
  return { docs: { description: { story: description } } };
}

export function labeledSample(label, content) {
  return `<div class="sb-story-sample"><span class="sb-story-sample__label">${label}</span>${content}</div>`;
}

export function fieldMarkup({ id, label, required = false, control, helper, error, showLabel = true, showHelper = true, afterControl = '' }) {
  const stateClass = `${error ? ' ds-field--error' : ''}${showLabel ? '' : ' ds-field--no-label'}${showHelper ? '' : ' ds-field--no-helper'}`;
  const visibleHelper = showHelper ? helper : '';
  const describedBy = visibleHelper || error ? `${id}-message` : '';
  const labelMarkup = showLabel ? `<label class="ds-field__label" for="${id}">${escapeHtml(label)}${required ? '<span class="ds-field__required" aria-hidden="true">*</span>' : ''}</label>` : '';
  const message = error
    ? `<p class="ds-field__error" id="${id}-message">${escapeHtml(error)}</p>`
    : visibleHelper
      ? `<p class="ds-field__helper" id="${id}-message">${escapeHtml(visibleHelper)}</p>`
      : '';

  return `<div class="ds-field${stateClass} sb-story-field">${labelMarkup}${control(describedBy)}${afterControl}${message}</div>`;
}
import {
  COMPONENTS,
  RUNTIME_BY_SLUG,
  responsibilityFor,
} from '../scripts/lib/component-catalog.mjs';
import { STORYBOOK_CONTRACTS } from '../scripts/lib/storybook-contracts.mjs';
