import { MailIcon, SearchIcon } from 'lucide-react';

import { Input } from '../../../../registry/tis/input.tsx';
import { StoryCanvas, StoryStack, storyArg } from './_shared.jsx';

export default {
  id: 'react-input',
  title: 'Components/Input and selection/Input Text',
  component: Input,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Coleta texto curto ou dados estruturados em uma única linha, com tamanhos e estados previsíveis.' } } },
  args: { 'aria-label': 'E-mail', placeholder: 'nome@empresa.com', size: 'md', disabled: false, readOnly: false, filled: false, invalid: false, leadingIcon: true },
  argTypes: {
    'aria-label': storyArg({ control: 'text', defaultValue: 'E-mail', description: 'Nome acessível usado quando o exemplo não possui label visível.' }),
    placeholder: storyArg({ control: 'text', defaultValue: 'nome@empresa.com', description: 'Exemplo de formato; não substitui o label.' }),
    size: storyArg({ control: 'radio', defaultValue: 'md', description: 'Altura e densidade do campo.', options: ['sm', 'md', 'lg'] }),
    disabled: storyArg({ control: 'boolean', defaultValue: false, description: 'Impede foco e edição.' }),
    readOnly: storyArg({ control: 'boolean', defaultValue: false, description: 'Permite foco e seleção, mas não edição.' }),
    filled: storyArg({ control: 'boolean', defaultValue: false, description: 'Aplica o estado visual de conteúdo preenchido.' }),
    invalid: storyArg({ control: 'boolean', defaultValue: false, description: 'Aplica aria-invalid e o estado visual de erro.' }),
    leadingIcon: storyArg({ control: 'boolean', defaultValue: true, description: 'Exibe um ícone decorativo antes do texto.' }),
  },
};

export const Playground = { render: ({ invalid, leadingIcon, ...args }) => <StoryCanvas narrow><Input {...args} aria-invalid={invalid || undefined} leadingIcon={leadingIcon ? <MailIcon /> : undefined} /></StoryCanvas> };
export const Sizes = { render: () => <StoryCanvas narrow><StoryStack>{['sm', 'md', 'lg'].map((size) => <Input key={size} aria-label={`Input ${size}`} size={size} placeholder={size} />)}</StoryStack></StoryCanvas> };
export const States = { render: () => <StoryCanvas narrow><StoryStack><Input aria-label="Preenchido" defaultValue="Preenchido" filled /><Input aria-label="Somente leitura" defaultValue="Somente leitura" readOnly /><Input aria-label="Inválido" defaultValue="Inválido" aria-invalid="true" /><Input aria-label="Desabilitado" defaultValue="Desabilitado" disabled /></StoryStack></StoryCanvas> };
export const WithIcons = { name: 'With icons', render: () => <StoryCanvas narrow><StoryStack><Input aria-label="E-mail" leadingIcon={<MailIcon />} placeholder="E-mail" /><Input aria-label="Pesquisar" trailingIcon={<SearchIcon />} placeholder="Pesquisar" /></StoryStack></StoryCanvas> };
