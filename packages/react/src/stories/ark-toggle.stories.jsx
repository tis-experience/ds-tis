import { useState } from 'react';

import {
  Switch,
  SwitchContent,
  SwitchControl,
  SwitchDescription,
  SwitchHiddenInput,
  SwitchThumb,
  SwitchTitle,
} from '../ark/toggle.jsx';
import { StoryCanvas, StoryStack, storyArg } from './_shared.jsx';

function ToggleExample({ checked = false, description, disabled = false, label, name, size = 'md' }) {
  return (
    <Switch defaultChecked={checked} disabled={disabled} name={name} value="enabled">
      <SwitchControl size={size}><SwitchThumb /></SwitchControl>
      <SwitchContent>
        <SwitchTitle>{label}</SwitchTitle>
        {description ? <SwitchDescription>{description}</SwitchDescription> : null}
      </SwitchContent>
      <SwitchHiddenInput />
    </Switch>
  );
}

export default {
  id: 'ark-toggle',
  title: 'Outputs/Ark + Zag/Toggle',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Adapter Toggle independente. Ark UI fornece as parts, Zag mantém on/off, foco, teclado e input de formulário, e o DS TIS preserva visual e tokens.',
      },
    },
  },
  args: {
    label: 'Alertas de segurança',
    description: 'Notifica sobre acessos suspeitos.',
    size: 'md',
    checked: true,
    disabled: false,
  },
  argTypes: {
    label: storyArg({ control: 'text', defaultValue: 'Alertas de segurança', description: 'Nome acessível e área de clique.' }),
    description: storyArg({ control: 'text', defaultValue: 'Notifica sobre acessos suspeitos.', description: 'Efeito esperado da configuração.' }),
    size: storyArg({ control: 'radio', defaultValue: 'md', description: 'Tamanho do track e do thumb.', options: ['sm', 'md', 'lg'] }),
    checked: storyArg({ control: 'boolean', defaultValue: true, description: 'Estado ligado inicial.' }),
    disabled: storyArg({ control: 'boolean', defaultValue: false, description: 'Impede interação.' }),
  },
};

export const Playground = {
  render: (args) => <StoryCanvas narrow><ToggleExample {...args} name="security-alerts" /></StoryCanvas>,
};

export const States = {
  render: () => (
    <StoryCanvas narrow>
      <StoryStack>
        <ToggleExample label="Desligado" />
        <ToggleExample checked label="Ligado" />
        <ToggleExample disabled label="Indisponível" />
        <ToggleExample checked disabled label="Ligado indisponível" />
      </StoryStack>
    </StoryCanvas>
  ),
};

export const Sizes = {
  render: () => (
    <StoryCanvas narrow>
      <StoryStack>
        {['sm', 'md', 'lg'].map((size) => <ToggleExample checked key={size} label={size} size={size} />)}
      </StoryStack>
    </StoryCanvas>
  ),
};

function ToggleFormExample() {
  const [result, setResult] = useState('Nenhum envio');

  return (
    <StoryCanvas narrow>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setResult(new FormData(event.currentTarget).get('notifications') || 'off');
        }}
      >
        <StoryStack>
          <ToggleExample checked label="Receber notificações" name="notifications" />
          <button className="ds-button ds-button--primary ds-button--md" type="submit">
            <span className="ds-button__label">Enviar</span>
          </button>
          <output aria-live="polite">Valor enviado: {result}</output>
        </StoryStack>
      </form>
    </StoryCanvas>
  );
}

export const FormSubmission = {
  name: 'Form submission',
  render: () => <ToggleFormExample />,
};
