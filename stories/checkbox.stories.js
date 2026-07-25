import { componentDescription, escapeHtml, labeledSample, storyDescription } from './helpers.js';

function checkboxMarkup({ label, size, checked, indeterminate, disabled }) {
  const sizeClass = size === 'md' ? '' : ` ds-checkbox--${size}`;
  return `<label class="ds-checkbox-label"><input type="checkbox" class="ds-checkbox${sizeClass}"${checked ? ' checked' : ''}${indeterminate ? ' data-indeterminate="true"' : ''}${disabled ? ' disabled' : ''}><span class="ds-checkbox__content"><span class="ds-checkbox__label">${escapeHtml(label)}</span></span></label>`;
}

export default {
  title: 'Components/Form/Checkbox',
  tags: ['autodocs'],
  args: { label: 'Receber novidades', size: 'md', checked: false, indeterminate: false, disabled: false, error: false },
  argTypes: {
    label: { control: 'text', description: 'Nome acessível e área de clique do input.' },
    size: { control: 'radio', options: ['sm', 'md', 'lg'], description: 'Tamanho explícito do controle e target.' },
    checked: { control: 'boolean', description: 'Estado selecionado nativo.' },
    indeterminate: { control: 'boolean', description: 'Estado mixed aplicado pela propriedade DOM indeterminate.' },
    disabled: { control: 'boolean', description: 'Estado nativo disabled.' },
    error: { control: 'boolean', description: 'Aplica erro ao grupo e mensagem associada.' },
  },
  parameters: { docs: { description: { component: componentDescription('checkbox', 'Seleção independente com input nativo, label clicável e estado mixed real.') } } },
  render: (args) => args.error ? `<fieldset class="ds-checkbox-group--error" aria-describedby="story-checkbox-error"><legend>Preferências</legend>${checkboxMarkup(args)}<span class="ds-checkbox-group__error" id="story-checkbox-error">Selecione ao menos uma opção.</span></fieldset>` : checkboxMarkup(args),
};

export const Playground = {};
export const Tamanhos = { render: () => `<div class="sb-story-row">${['sm', 'md', 'lg'].map((size) => labeledSample(size, checkboxMarkup({ label: size, size, checked: true }))).join('')}</div>` };
export const Estados = {
  render: () => `<div class="sb-story-grid">${labeledSample('Unchecked', checkboxMarkup({ label: 'Não selecionado', size: 'md' }))}${labeledSample('Checked', checkboxMarkup({ label: 'Selecionado', size: 'md', checked: true }))}${labeledSample('Indeterminate', checkboxMarkup({ label: 'Seleção parcial', size: 'md', indeterminate: true }))}${labeledSample('Disabled', checkboxMarkup({ label: 'Indisponível', size: 'md', disabled: true }))}${labeledSample('Checked disabled', checkboxMarkup({ label: 'Selecionado indisponível', size: 'md', checked: true, disabled: true }))}</div>`,
  parameters: storyDescription('Hover e focus-visible podem ser exercitados nos estados habilitados.'),
};
export const GrupoComErro = { args: { error: true }, parameters: storyDescription('O erro pertence ao fieldset e é associado por aria-describedby.') };
