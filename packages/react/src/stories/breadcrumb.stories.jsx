import { DotIcon } from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../../registry/tis/breadcrumb.tsx';
import { StoryCanvas, StorySection, StoryStack, storyArg } from './_shared.jsx';

function BasicBreadcrumb({ label = 'Localização atual' }) {
  return (
    <Breadcrumb aria-label={label}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">Início</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#components">Componentes</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default {
  id: 'react-breadcrumb',
  title: 'Components/Navigation/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Mostra a posição atual numa hierarquia com nav, lista ordenada, links e página atual semânticos.',
      },
    },
  },
  args: { 'aria-label': 'Localização atual' },
  argTypes: {
    'aria-label': storyArg({
      control: 'text',
      defaultValue: 'Localização atual',
      description: 'Nome acessível do landmark de navegação.',
      type: 'string',
    }),
  },
};

export const Playground = {
  render: (args) => <StoryCanvas><BasicBreadcrumb label={args['aria-label']} /></StoryCanvas>,
};

export const Collapsed = {
  render: () => (
    <StoryCanvas>
      <Breadcrumb aria-label="Localização atual">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#home">Início</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#products">Produtos</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Ténis</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </StoryCanvas>
  ),
};

export const CustomSeparator = {
  name: 'Custom separator',
  render: () => (
    <StoryCanvas>
      <StoryStack>
        <StorySection title="Chevron">
          <BasicBreadcrumb label="Localização com chevron" />
        </StorySection>
        <StorySection title="Ponto">
          <Breadcrumb aria-label="Localização com ponto">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#projects">Projetos</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <DotIcon className="ds-icon ds-icon--16" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>UI Foundation</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </StorySection>
      </StoryStack>
    </StoryCanvas>
  ),
};
