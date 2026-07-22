import { componentDescription, escapeHtml, fieldMarkup, storyDescription } from './helpers.js';

function renderField({ label, helper, error, required, showLabel, showHelper }) {
  return fieldMarkup({
    id: 'story-field', label, helper, error, required, showLabel, showHelper,
    control: (describedBy) => `<div class="ds-input${error ? ' ds-input--error' : ''}"><input class="ds-input__field" id="story-field" type="text" placeholder="Digite seu nome"${showLabel ? '' : ` aria-label="${escapeHtml(label)}"`}${describedBy ? ` aria-describedby="${describedBy}"` : ''}${required ? ' required aria-required="true"' : ''}${error ? ' aria-invalid="true"' : ''}></div>`,
  });
}

export default {
  title: 'Compositions/Form Field',
  tags: ['autodocs'],
  args: { label: 'Nome completo', helper: 'Como aparece em seu documento.', error: '', required: true, showLabel: true, showHelper: true },
  argTypes: {
    label: { control: 'text', description: 'Nome visível do controle.' }, helper: { control: 'text', description: 'Orientação associada por aria-describedby.' }, error: { control: 'text', description: 'Substitui helper e ativa aria-invalid no controle.' }, required: { control: 'boolean', description: 'Asterisco decorativo e required semântico.' },
    showLabel: { control: 'boolean', description: 'Quando false, o controle precisa de aria-label.' }, showHelper: { control: 'boolean', description: 'Controla helper sem remover a associação de erro.' },
  },
  parameters: { docs: { description: { component: componentDescription('form-field', 'Composição CSS-only para label, controle, helper e erro com IDs e ARIA.') } } },
  render: renderField,
};

export const Playground = {};
export const SemLabel = { args: { showLabel: false }, parameters: storyDescription('Sem label visual, o input recebe aria-label com o mesmo nome.') };
export const SemHelper = { args: { showHelper: false }, parameters: storyDescription('Use quando o label já fornece contexto suficiente.') };
export const ComErro = { args: { error: 'Informe o nome completo.', helper: '' }, parameters: storyDescription('Erro substitui helper, usa ds-field--error, aria-invalid e aria-describedby.') };
