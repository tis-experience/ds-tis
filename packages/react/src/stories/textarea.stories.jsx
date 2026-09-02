import { Field, FieldCounter, FieldDescription, FieldLabel, FieldLabelRow } from '../../../../registry/tis/field.tsx';
import { Textarea } from '../../../../registry/tis/textarea.tsx';
import { StoryCanvas, StoryStack, storyArg } from './_shared.jsx';

export default {
  id: 'react-textarea',
  title: 'Components/Input and selection/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Coleta texto livre em múltiplas linhas, preservando tamanhos, estados e semântica nativa.' } } },
  args: { 'aria-label': 'Mensagem', placeholder: 'Descreva sua solicitação…', size: 'md', disabled: false, readOnly: false, filled: false, invalid: false },
  argTypes: {
    'aria-label': storyArg({ control: 'text', defaultValue: 'Mensagem', description: 'Nome acessível usado quando o exemplo não possui label visível.' }),
    placeholder: storyArg({ control: 'text', defaultValue: 'Descreva sua solicitação…', description: 'Exemplo de conteúdo; não substitui o label.' }),
    size: storyArg({ control: 'radio', defaultValue: 'md', description: 'Altura mínima e densidade do campo.', options: ['sm', 'md', 'lg'] }),
    disabled: storyArg({ control: 'boolean', defaultValue: false, description: 'Impede foco e edição.' }),
    readOnly: storyArg({ control: 'boolean', defaultValue: false, description: 'Permite foco e seleção, mas não edição.' }),
    filled: storyArg({ control: 'boolean', defaultValue: false, description: 'Aplica o estado visual de conteúdo preenchido.' }),
    invalid: storyArg({ control: 'boolean', defaultValue: false, description: 'Aplica aria-invalid e o estado visual de erro.' }),
  },
};

export const Playground = { render: ({ invalid, ...args }) => <StoryCanvas narrow><Textarea {...args} aria-invalid={invalid || undefined} /></StoryCanvas> };
export const Sizes = { render: () => <StoryCanvas narrow><StoryStack>{['sm', 'md', 'lg'].map((size) => <Textarea key={size} aria-label={`Textarea ${size}`} size={size} placeholder={size} />)}</StoryStack></StoryCanvas> };
export const States = { render: () => <StoryCanvas narrow><StoryStack><Textarea aria-label="Preenchido" defaultValue="Conteúdo preenchido" filled /><Textarea aria-label="Somente leitura" defaultValue="Conteúdo somente leitura" readOnly /><Textarea aria-label="Inválido" defaultValue="Conteúdo inválido" aria-invalid="true" /><Textarea aria-label="Desabilitado" defaultValue="Desabilitado" disabled /></StoryStack></StoryCanvas> };
export const WithCounter = { name: 'With counter', render: () => <StoryCanvas narrow><Field><FieldLabelRow><FieldLabel htmlFor="story-message">Mensagem</FieldLabel></FieldLabelRow><Textarea id="story-message" aria-describedby="story-message-helper story-message-counter" /><FieldDescription id="story-message-helper">Máximo de 500 caracteres.</FieldDescription><FieldCounter id="story-message-counter">0/500</FieldCounter></Field></StoryCanvas> };
