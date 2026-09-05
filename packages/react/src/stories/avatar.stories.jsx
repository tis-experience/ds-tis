import { CheckIcon, UserRoundIcon } from 'lucide-react';

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '../../../../registry/tis/avatar.tsx';
import { StoryCanvas, StoryRow, StorySection, StoryStack, storyArg } from './_shared.jsx';

const portrait = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"%3E%3Crect width="160" height="160" fill="%23d7e6ff"/%3E%3Ccircle cx="80" cy="61" r="30" fill="%233f67a8"/%3E%3Cpath d="M27 150c7-33 25-49 53-49s46 16 53 49" fill="%233f67a8"/%3E%3C/svg%3E';

function UserAvatar({ size = 'md', withBadge = false }) {
  return (
    <Avatar size={size}>
      <AvatarFallback>AS</AvatarFallback>
      <AvatarImage src={portrait} alt="Ana Silva" />
      {withBadge ? <AvatarBadge role="img" aria-label="Online"><CheckIcon aria-hidden="true" /></AvatarBadge> : null}
    </Avatar>
  );
}

export default {
  id: 'react-avatar',
  title: 'Components/Content and structure/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Representa uma pessoa com imagem otimizada e fallback acessível, usando os tamanhos e tokens do DS TIS.',
      },
    },
  },
  args: { size: 'md' },
  argTypes: {
    size: storyArg({ control: 'select', defaultValue: 'md', description: 'Tamanho do avatar.', options: ['sm', 'md', 'lg'] }),
  },
};

export const Playground = {
  render: (args) => <StoryCanvas><UserAvatar {...args} /></StoryCanvas>,
};

export const Fallbacks = {
  render: () => (
    <StoryCanvas>
      <StoryRow>
        <Avatar size="sm"><AvatarFallback>AS</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>BM</AvatarFallback></Avatar>
        <Avatar size="lg">
          <AvatarFallback icon aria-label="Utilizador">
            <UserRoundIcon className="ds-icon" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
      </StoryRow>
    </StoryCanvas>
  ),
};

export const Sizes = {
  render: () => (
    <StoryCanvas>
      <StoryRow>
        <UserAvatar size="sm" />
        <UserAvatar size="md" />
        <UserAvatar size="lg" />
      </StoryRow>
    </StoryCanvas>
  ),
};

export const Group = {
  render: () => (
    <StoryCanvas>
      <StoryStack>
        <StorySection title="Equipa atribuída">
          <AvatarGroup aria-label="Equipa atribuída">
            <Avatar><AvatarFallback>AS</AvatarFallback></Avatar>
            <Avatar><AvatarFallback>BM</AvatarFallback></Avatar>
            <Avatar><AvatarFallback>CM</AvatarFallback></Avatar>
            <AvatarGroupCount aria-label="Mais três pessoas">+3</AvatarGroupCount>
          </AvatarGroup>
        </StorySection>
        <StorySection title="Com status">
          <UserAvatar withBadge />
        </StorySection>
      </StoryStack>
    </StoryCanvas>
  ),
};
