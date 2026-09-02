import { Checkbox, CheckboxContent, CheckboxDescription, CheckboxLabel, CheckboxTitle } from '../../../../registry/tis/checkbox.tsx';
import { StoryCanvas, StoryStack, storyArg } from './_shared.jsx';

function CheckboxExample({ checked, description, disabled, indeterminate, label, size }) {
  return (
    <CheckboxLabel>
      <Checkbox defaultChecked={checked} disabled={disabled} indeterminate={indeterminate} size={size} />
      <CheckboxContent><CheckboxTitle>{label}</CheckboxTitle>{description ? <CheckboxDescription>{description}</CheckboxDescription> : null}</CheckboxContent>
    </CheckboxLabel>
  );
}

export default {
  id: 'react-checkbox',
  title: 'Components/Input and selection/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Permite selecionar opções independentes e preserva checked, indeterminate e input de formulário.' } } },
  args: { label: 'Receber novidades', description: 'Enviaremos apenas atualizações relevantes.', size: 'md', checked: true, indeterminate: false, disabled: false },
  argTypes: {
    label: storyArg({ control: 'text', defaultValue: 'Receber novidades', description: 'Texto clicável que identifica a opção.' }),
    description: storyArg({ control: 'text', defaultValue: 'Enviaremos apenas atualizações relevantes.', description: 'Ajuda opcional associada à opção.' }),
    size: storyArg({ control: 'radio', defaultValue: 'md', description: 'Tamanho do controle e de sua anatomia.', options: ['sm', 'md', 'lg'] }),
    checked: storyArg({ control: 'boolean', defaultValue: true, description: 'Estado selecionado inicial do exemplo.' }),
    indeterminate: storyArg({ control: 'boolean', defaultValue: false, description: 'Comunica uma seleção parcial.' }),
    disabled: storyArg({ control: 'boolean', defaultValue: false, description: 'Impede a alteração da opção.' }),
  },
};

export const Playground = { render: (args) => <StoryCanvas narrow><CheckboxExample {...args} /></StoryCanvas> };
export const States = { render: () => <StoryCanvas narrow><StoryStack><CheckboxExample label="Não selecionado" /><CheckboxExample checked label="Selecionado" /><CheckboxExample indeterminate label="Seleção parcial" /><CheckboxExample checked disabled label="Selecionado indisponível" /></StoryStack></StoryCanvas> };
export const Sizes = { render: () => <StoryCanvas narrow><StoryStack>{['sm', 'md', 'lg'].map((size) => <CheckboxExample key={size} size={size} label={size} />)}</StoryStack></StoryCanvas> };
