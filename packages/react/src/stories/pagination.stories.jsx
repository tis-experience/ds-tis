import { useState } from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../../registry/tis/pagination.tsx';
import { StoryCanvas, StorySection, StoryStack, storyArg } from './_shared.jsx';

function pageWindow(current, total) {
  return [...new Set([1, current, total]
    .filter((page) => page >= 1 && page <= total))]
    .sort((left, right) => left - right);
}

function PaginationExample({ initialPage = 5, size = 'md', totalPages = 10 }) {
  const total = Math.max(1, Number(totalPages));
  const [current, setCurrent] = useState(Math.min(Math.max(1, Number(initialPage)), total));
  const pages = pageWindow(current, total);
  let previousPage = 0;

  return (
    <Pagination aria-label="Paginação de resultados" size={size}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={`#page-${Math.max(1, current - 1)}`}
            disabled={current === 1}
            size={size}
            text="Página anterior"
            onClick={(event) => {
              event.preventDefault();
              setCurrent((page) => Math.max(1, page - 1));
            }}
          />
        </PaginationItem>
        {pages.flatMap((page) => {
          const gap = page - previousPage > 1;
          previousPage = page;
          return [
            ...(gap ? [
              <PaginationItem key={`ellipsis-${page}`}>
                <PaginationEllipsis />
              </PaginationItem>,
            ] : []),
            <PaginationItem key={page}>
              <PaginationLink
                as={page === current ? 'span' : 'a'}
                href={page === current ? undefined : `#page-${page}`}
                isActive={page === current}
                aria-label={`Página ${page}`}
                onClick={(event) => {
                  event.preventDefault();
                  setCurrent(page);
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>,
          ];
        })}
        <PaginationItem>
          <PaginationNext
            href={`#page-${Math.min(total, current + 1)}`}
            disabled={current === total}
            size={size}
            text="Próxima página"
            onClick={(event) => {
              event.preventDefault();
              setCurrent((page) => Math.min(total, page + 1));
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default {
  id: 'react-pagination',
  title: 'Components/Navigation/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Navega por subconjuntos discretos de dados; URL, carregamento e página atual permanecem controlados pela aplicação.',
      },
    },
  },
  args: { initialPage: 5, size: 'md', totalPages: 10 },
  argTypes: {
    initialPage: storyArg({ control: { type: 'number', min: 1 }, defaultValue: 5, description: 'Página inicialmente selecionada.', type: 'number' }),
    size: storyArg({ control: 'select', defaultValue: 'md', description: 'Tamanho dos itens e controles.', options: ['sm', 'md', 'lg'] }),
    totalPages: storyArg({ control: { type: 'number', min: 1 }, defaultValue: 10, description: 'Total de páginas conhecido pelo consumidor.', type: 'number' }),
  },
};

export const Playground = {
  render: (args) => <StoryCanvas fluid><PaginationExample {...args} /></StoryCanvas>,
};

export const Sizes = {
  render: () => (
    <StoryCanvas fluid>
      <StoryStack>
        {['sm', 'md', 'lg'].map((size) => (
          <StorySection key={size} title={size.toUpperCase()}>
            <PaginationExample initialPage={3} size={size} totalPages={6} />
          </StorySection>
        ))}
      </StoryStack>
    </StoryCanvas>
  ),
};

export const Boundaries = {
  render: () => (
    <StoryCanvas fluid>
      <StoryStack>
        <StorySection title="Primeira página"><PaginationExample initialPage={1} /></StorySection>
        <StorySection title="Última página"><PaginationExample initialPage={10} /></StorySection>
      </StoryStack>
    </StoryCanvas>
  ),
};
