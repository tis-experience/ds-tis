import { componentDescription, escapeHtml, icon, storyDescription } from './helpers.js';

const rows = [
  ['Ana Silva', 'Ativo', 'ana.silva@tis.com.br'],
  ['Bruno Lima', 'Pendente', 'bruno.lima@tis.com.br'],
  ['Carla Rocha', 'Ativo', 'carla.rocha@tis.com.br'],
];

function statusBadge(status) {
  const tone = status === 'Ativo' ? 'success' : 'warning';
  return `<span class="ds-badge ds-badge--${tone} ds-badge--subtle">${status}</span>`;
}

function tableMarkup({ size, selectedRow, sortable, nowrap }) {
  const classes = ['ds-table', `ds-table--${size}`];
  if (nowrap) classes.push('ds-table--nowrap');
  const headerContent = sortable
    ? `<button class="ds-table__sort" type="button" aria-label="Ordenar por Cliente"><span>Cliente</span>${icon('arrow-up-down', 'ds-table__sort-icon')}</button>`
    : 'Cliente';

  return `<div class="ds-table-region" role="region" aria-label="Tabela de clientes" tabindex="0"><table class="${classes.join(' ')}"><caption class="ds-table__caption">Clientes</caption><thead class="ds-table__header"><tr><th class="ds-table__header-cell${sortable ? ' ds-table__header-cell--sortable' : ''}" scope="col"${sortable ? ' aria-sort="none"' : ''}>${headerContent}</th><th class="ds-table__header-cell" scope="col">Status</th><th class="ds-table__header-cell" scope="col">E-mail</th><th class="ds-table__header-cell ds-table__header-cell--end" scope="col">Ações</th></tr></thead><tbody class="ds-table__body">${rows.map((row, index) => `<tr class="ds-table__row${selectedRow === index + 1 ? ' ds-table__row--selected' : ''}"${selectedRow === index + 1 ? ' data-selected="true"' : ''}><td class="ds-table__cell">${escapeHtml(row[0])}</td><td class="ds-table__cell">${statusBadge(row[1])}</td><td class="ds-table__cell">${escapeHtml(row[2])}</td><td class="ds-table__cell ds-table__cell--control ds-table__cell--end"><button class="ds-button ds-button--ghost ds-button--sm" type="button"><span class="ds-button__label">Abrir</span></button></td></tr>`).join('')}</tbody></table></div>`;
}

export default {
  title: 'Components/Table',
  tags: ['autodocs'],
  args: {
    size: 'md',
    selectedRow: 2,
    sortable: true,
    nowrap: false,
  },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md'], description: 'Altura de header, row e cells.' },
    selectedRow: { control: 'radio', options: [0, 1, 2, 3], description: 'Linha marcada como selected; 0 remove seleção.' },
    sortable: { control: 'boolean', description: 'Exibe sort button nativo no header cell.' },
    nowrap: { control: 'boolean', description: 'Impede quebra de conteúdo em tabelas escaneáveis.' },
  },
  parameters: { docs: { description: { component: componentDescription('table', 'Tabela nativa para dados tabulares, com header row, header cell, row, cell, sort e overflow horizontal.') } } },
  render: tableMarkup,
};

export const Playground = {};
export const Tamanhos = {
  render: () => `<div class="sb-story-stack">${['sm', 'md'].map((size) => `<div class="sb-story-sample sb-story-table-sample"><span class="sb-story-sample__label">${size === 'sm' ? 'Small' : 'Medium'}</span>${tableMarkup({ size, selectedRow: 0, sortable: true, nowrap: false })}</div>`).join('')}</div>`,
  parameters: storyDescription('Small mantém 40px reais; Medium mantém 48px reais para header e linhas.'),
};
export const Estados = {
  render: () => tableMarkup({ size: 'md', selectedRow: 2, sortable: true, nowrap: false }),
  parameters: storyDescription('Inclui linha default, selected e controles focusáveis sem transformar table em grid.'),
};
export const Overflow = {
  render: () => `<div class="sb-story-table-wide">${tableMarkup({ size: 'md', selectedRow: 0, sortable: true, nowrap: true })}</div>`,
  parameters: storyDescription('A região com tabindex permite navegação horizontal quando o consumidor limita a largura.'),
};
