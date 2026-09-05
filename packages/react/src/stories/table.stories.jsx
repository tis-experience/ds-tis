import { useMemo, useState } from 'react';
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react';

import { Badge } from '../../../../registry/tis/badge.tsx';
import { Button } from '../../../../registry/tis/button.tsx';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableCellContent,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableSortButton,
} from '../../../../registry/tis/table.tsx';
import { StoryCanvas, StorySection, StoryStack, storyArg } from './_shared.jsx';

const accounts = [
  { id: 'AGT-104', name: 'Ana Silva', email: 'ana.silva@agt.ao', status: 'Ativo' },
  { id: 'AGT-238', name: 'Bruno Lima', email: 'bruno.lima@agt.ao', status: 'Pendente' },
  { id: 'AGT-317', name: 'Carla Mendes', email: 'carla.mendes@agt.ao', status: 'Ativo' },
];

function AccountTable({ fixed = false, nowrap = false, size = 'sm' }) {
  const [direction, setDirection] = useState('none');
  const rows = useMemo(() => {
    if (direction === 'none') return accounts;
    return [...accounts].sort((left, right) => {
      const result = left.name.localeCompare(right.name, 'pt');
      return direction === 'ascending' ? result : -result;
    });
  }, [direction]);

  function cycleSort() {
    setDirection((current) => (
      current === 'none' ? 'ascending' : current === 'ascending' ? 'descending' : 'none'
    ));
  }

  const SortIcon = direction === 'ascending'
    ? ArrowUpIcon
    : direction === 'descending'
      ? ArrowDownIcon
      : ArrowUpDownIcon;

  return (
    <Table
      fixed={fixed}
      nowrap={nowrap}
      regionLabel="Contas de clientes"
      size={size}
    >
      <TableCaption>Contas de clientes</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead aria-sort={direction} sortable>
            <TableSortButton
              aria-label={`Ordenar por cliente; ordem atual: ${direction}`}
              onClick={cycleSort}
            >
              Cliente
              <SortIcon className="ds-table__sort-icon" aria-hidden="true" />
            </TableSortButton>
          </TableHead>
          <TableHead>Status</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead align="end">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((account) => (
          <TableRow key={account.id} selected={account.id === 'AGT-238'}>
            <TableCell>
              <TableCellContent>
                <strong>{account.name}</strong>
              </TableCellContent>
            </TableCell>
            <TableCell>
              <Badge
                tone={account.status === 'Ativo' ? 'success' : 'warning'}
                variant="subtle"
              >
                {account.status}
              </Badge>
            </TableCell>
            <TableCell>{account.email}</TableCell>
            <TableCell align="end" control>
              <Button size="sm" type="button" variant="ghost">
                Abrir
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4}>3 contas</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

export default {
  id: 'react-table',
  title: 'Components/Content and structure/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Apresenta dados tabulares com HTML semântico, overflow local e ordenação controlada pelo consumidor.',
      },
    },
  },
  args: { fixed: false, nowrap: false, size: 'sm' },
  argTypes: {
    fixed: storyArg({ control: 'boolean', defaultValue: false, description: 'Usa table-layout fixed.', type: 'boolean' }),
    nowrap: storyArg({ control: 'boolean', defaultValue: false, description: 'Evita quebra de linha nas células.', type: 'boolean' }),
    size: storyArg({ control: 'select', defaultValue: 'sm', description: 'Densidade visual das linhas.', options: ['sm', 'md'] }),
  },
};

export const Playground = {
  render: (args) => <StoryCanvas fluid><AccountTable {...args} /></StoryCanvas>,
};

export const Sizes = {
  render: () => (
    <StoryCanvas fluid>
      <StoryStack>
        <StorySection title="Small"><AccountTable size="sm" /></StorySection>
        <StorySection title="Medium"><AccountTable size="md" /></StorySection>
      </StoryStack>
    </StoryCanvas>
  ),
};

export const ResponsiveOverflow = {
  name: 'Responsive overflow',
  render: () => (
    <StoryCanvas narrow>
      <AccountTable nowrap size="md" />
    </StoryCanvas>
  ),
};
