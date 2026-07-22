import { componentDescription, storyDescription } from './helpers.js';

const baseTabs = [
  ['profile', 'Perfil', 'Atualize nome, foto e preferências de idioma.'],
  ['security', 'Segurança', 'Gerencie senha, autenticação e sessões.'],
  ['billing', 'Faturamento', 'Consulte plano, faturas e forma de pagamento.'],
];

function tabsMarkup({ activeTab, disabledTab, tabs = baseTabs, suffix = 'default' }) {
  const active = tabs.some(([id]) => id === activeTab && !(disabledTab && id === 'security')) ? activeTab : tabs[0][0];
  return `<div class="sb-story-stack"><div class="sb-story-scroll"><div class="ds-tabs" role="tablist" aria-label="Configurações da conta">${tabs.map(([id, label]) => { const selected = id === active; const disabled = disabledTab && id === 'security'; return `<button class="ds-tab${selected ? ' ds-tab--active' : ''}" type="button" role="tab" id="story-${suffix}-tab-${id}" aria-selected="${selected}" aria-controls="story-${suffix}-panel-${id}" tabindex="${selected ? '0' : '-1'}"${disabled ? ' disabled aria-disabled="true"' : ''}>${label}</button>`; }).join('')}</div></div>${tabs.map(([id, , panel]) => `<div class="ds-tab-panel sb-story-panel" role="tabpanel" id="story-${suffix}-panel-${id}" aria-labelledby="story-${suffix}-tab-${id}"${id === active ? '' : ' hidden'}>${panel}</div>`).join('')}</div>`;
}

export default {
  title: 'Components/Tabs', tags: ['autodocs'],
  args: { activeTab: 'profile', disabledTab: false },
  argTypes: { activeTab: { control: 'radio', options: ['profile', 'security', 'billing'], description: 'Tab selecionada inicialmente.' }, disabledTab: { control: 'boolean', description: 'Desabilita Segurança e a remove da navegação por setas.' } },
  parameters: { docs: { description: { component: componentDescription('tabs', 'Alterna painéis irmãos com roving tabindex e navegação por setas.') } } },
  render: tabsMarkup,
};

export const Playground = {};
export const Disabled = { args: { disabledTab: true }, parameters: storyDescription('A tab disabled usa atributos nativos e é ignorada pelo runtime.') };
export const Multiplas = { render: () => tabsMarkup({ activeTab: 'overview', disabledTab: false, suffix: 'multiple', tabs: [['overview', 'Visão geral', 'Resumo do projeto.'], ['activity', 'Atividade', 'Histórico recente.'], ['files', 'Arquivos', 'Documentos compartilhados.'], ['team', 'Equipe', 'Participantes e permissões.'], ['settings', 'Configurações', 'Preferências do projeto.']] }), parameters: storyDescription('Coleções horizontais maiores permanecem responsabilidade de layout do consumidor; o runtime preserva teclado e painéis.') };
