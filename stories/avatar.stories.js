import { componentDescription, escapeHtml, icon, labeledSample, storyDescription } from './helpers.js';

function renderAvatar({ content, size, imageUrl, alt, initials }) {
  const sizeClass = size === 'md' ? '' : ` ds-avatar--${size}`;
  if (content === 'image') return `<span class="ds-avatar${sizeClass}"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(alt)}"></span>`;
  if (content === 'icon') return `<span class="ds-avatar ds-avatar--icon${sizeClass}" role="img" aria-label="${escapeHtml(alt)}">${icon('user')}</span>`;
  return `<span class="ds-avatar${sizeClass}" role="img" aria-label="${escapeHtml(alt)}">${escapeHtml(initials)}</span>`;
}

export default {
  title: 'Components/Avatar',
  tags: ['autodocs'],
  args: { content: 'initials', size: 'md', imageUrl: 'https://i.pravatar.cc/160?img=12', alt: 'Marcell da Silva', initials: 'MD' },
  argTypes: {
    content: { control: 'radio', options: ['initials', 'image', 'icon'], description: 'Fonte visual: iniciais, imagem ou fallback.' },
    size: { control: 'radio', options: ['sm', 'md', 'lg'], description: 'Tamanho explícito do avatar.' },
    imageUrl: { control: 'text', description: 'URL da imagem quando content=image.' },
    alt: { control: 'text', description: 'Nome acessível da pessoa.' },
    initials: { control: 'text', description: 'Fallback textual curto, normalmente duas iniciais.' },
  },
  parameters: { docs: { description: { component: componentDescription('avatar', 'Representação compacta de pessoa por imagem, iniciais ou ícone.') } } },
  render: renderAvatar,
};

export const Playground = {};

export const Tamanhos = {
  render: () => `<div class="sb-story-row sb-story-avatar-row">${['sm', 'md', 'lg'].map((size) => labeledSample(size, renderAvatar({ content: 'initials', size, alt: `Avatar ${size}`, initials: size.toUpperCase() }))).join('')}</div>`,
};

export const Conteudos = {
  render: () => `<div class="sb-story-row">${labeledSample('Imagem', renderAvatar({ content: 'image', size: 'md', imageUrl: 'https://i.pravatar.cc/160?img=12', alt: 'Marcell da Silva' }))}${labeledSample('Iniciais', renderAvatar({ content: 'initials', size: 'md', alt: 'Ana Lima', initials: 'AL' }))}${labeledSample('Fallback', renderAvatar({ content: 'icon', size: 'md', alt: 'Usuário sem foto' }))}</div>`,
};

export const Grupo = {
  render: () => `<div class="sb-story-row" role="group" aria-label="Participantes">${['AL', 'BS', 'CR', '+8'].map((initials) => renderAvatar({ content: 'initials', size: 'sm', alt: initials === '+8' ? 'Mais 8 participantes' : `Participante ${initials}`, initials })).join('')}</div>`,
  parameters: storyDescription('Em grupos, cada avatar mantém nome acessível e o excedente é anunciado de forma textual.'),
};
