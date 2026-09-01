import { Switch, SwitchContent, SwitchDescription, SwitchLabel, SwitchTitle } from '../../../../registry/tis/switch.tsx';
import { StoryCanvas, StoryStack, storyArg } from './_shared.jsx';

function ToggleExample({ checked, description, disabled, label, size }) {
  return <SwitchLabel><Switch defaultChecked={checked} disabled={disabled} size={size} /><SwitchContent><SwitchTitle>{label}</SwitchTitle>{description ? <SwitchDescription>{description}</SwitchDescription> : null}</SwitchContent></SwitchLabel>;
}

export default {
  id: 'react-toggle',
  title: 'Components/Input and selection/Toggle',
  component: Switch,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Alterna imediatamente uma configuração entre ligada e desligada.' } } },
  args: { label: 'Alertas de segurança', description: 'Notifica sobre acessos suspeitos.', size: 'md', checked: true, disabled: false },
  argTypes: {
    label: storyArg({ control: 'text', defaultValue: 'Alertas de segurança', description: 'Texto clicável que identifica a configuração.' }),
    description: storyArg({ control: 'text', defaultValue: 'Notifica sobre acessos suspeitos.', description: 'Efeito esperado ao ligar a configuração.' }),
    size: storyArg({ control: 'radio', defaultValue: 'md', description: 'Tamanho do track e do thumb.', options: ['sm', 'md', 'lg'] }),
    checked: storyArg({ control: 'boolean', defaultValue: true, description: 'Estado ligado inicial do exemplo.' }),
    disabled: storyArg({ control: 'boolean', defaultValue: false, description: 'Impede a alteração da configuração.' }),
  },
};

export const Playground = { render: (args) => <StoryCanvas narrow><ToggleExample {...args} /></StoryCanvas> };
export const Sizes = { render: () => <StoryCanvas narrow><StoryStack>{['sm', 'md', 'lg'].map((size) => <ToggleExample key={size} size={size} label={size} />)}</StoryStack></StoryCanvas> };
export const States = { render: () => <StoryCanvas narrow><StoryStack><ToggleExample label="Desligado" /><ToggleExample checked label="Ligado" /><ToggleExample disabled label="Indisponível" /><ToggleExample checked disabled label="Ligado indisponível" /></StoryStack></StoryCanvas> };
