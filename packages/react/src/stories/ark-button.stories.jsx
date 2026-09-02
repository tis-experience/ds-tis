import { useState } from 'react';
import { DownloadIcon, PlusIcon } from 'lucide-react';

import { Button } from '../ark/button.jsx';
import { StoryCanvas, StoryRow, StorySection, StoryStack, storyArg } from './_shared.jsx';

function InteractiveButton({ label, ...props }) {
  const [count, setCount] = useState(0);

  return (
    <StoryStack>
      <StoryRow>
        <Button {...props} onClick={() => setCount((value) => value + 1)}>{label}</Button>
      </StoryRow>
      <output aria-live="polite">Ativações: {count}</output>
    </StoryStack>
  );
}

export default {
  id: 'ark-button',
  title: 'Outputs/Ark + Zag/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Adapter Button independente sobre Ark Factory. O elemento button nativo mantém semântica e teclado; nenhuma máquina Zag é necessária.',
      },
    },
  },
  args: {
    label: 'Continuar',
    variant: 'brand',
    size: 'md',
    disabled: false,
    loading: false,
    fullWidth: false,
  },
  argTypes: {
    label: storyArg({ control: 'text', defaultValue: 'Continuar', description: 'Nome acessível da ação.' }),
    variant: storyArg({ control: 'select', defaultValue: 'brand', description: 'Hierarquia ou intenção visual.', options: ['brand', 'toned', 'outline', 'ghost', 'success', 'danger'] }),
    size: storyArg({ control: 'radio', defaultValue: 'md', description: 'Tamanho explícito.', options: ['sm', 'md', 'lg'] }),
    disabled: storyArg({ control: 'boolean', defaultValue: false, description: 'Impede interação pelo atributo nativo.' }),
    loading: storyArg({ control: 'boolean', defaultValue: false, description: 'Mantém o nome da ação e anuncia busy.' }),
    fullWidth: storyArg({ control: 'boolean', defaultValue: false, description: 'Ocupa a largura oferecida pelo container.' }),
  },
};

export const Playground = {
  render: ({ label, ...args }) => <StoryCanvas><InteractiveButton {...args} label={label} /></StoryCanvas>,
};

export const Variants = {
  render: () => (
    <StoryCanvas>
      <StoryRow>
        {['brand', 'toned', 'outline', 'ghost', 'success', 'danger'].map((variant) => (
          <Button key={variant} variant={variant}>{variant}</Button>
        ))}
      </StoryRow>
    </StoryCanvas>
  ),
};

export const SizesAndIcons = {
  name: 'Sizes and icons',
  render: () => (
    <StoryCanvas>
      <StoryStack>
        <StorySection title="Sizes">
          <StoryRow><Button size="sm">Small</Button><Button>Medium</Button><Button size="lg">Large</Button></StoryRow>
        </StorySection>
        <StorySection title="Icons">
          <StoryRow>
            <Button><PlusIcon aria-hidden="true" className="ds-button__icon" />Adicionar</Button>
            <Button aria-label="Baixar" iconOnly><DownloadIcon aria-hidden="true" className="ds-button__icon" /></Button>
          </StoryRow>
        </StorySection>
      </StoryStack>
    </StoryCanvas>
  ),
};

export const States = {
  render: () => (
    <StoryCanvas>
      <StoryRow>
        <Button disabled>Disabled</Button>
        <Button loading loadingLabel="Salvando">Salvando</Button>
      </StoryRow>
    </StoryCanvas>
  ),
};

function ButtonFormExample() {
  const [result, setResult] = useState('Nenhum envio');

  return (
    <StoryCanvas narrow>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setResult(event.nativeEvent.submitter?.value || 'sem valor');
        }}
      >
        <StoryStack>
          <Button name="action" type="submit" value="ark">Enviar</Button>
          <output aria-live="polite">Valor enviado: {result}</output>
        </StoryStack>
      </form>
    </StoryCanvas>
  );
}

export const FormSubmission = {
  name: 'Form submission',
  render: () => <ButtonFormExample />,
};
