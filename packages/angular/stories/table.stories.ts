import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";
import { TisBadge } from "../badge/src/public-api";
import { TisButton } from "../button/src/public-api";
import {
  TisTable,
  TisTableBody,
  TisTableCaption,
  TisTableCell,
  TisTableHeader,
  TisTableHeaderCell,
  TisTableRegion,
  TisTableRow,
  TisTableSort,
  TisTableSortIcon,
} from "../table/src/public-api";

const imports = [TisBadge, TisButton, TisTable, TisTableBody, TisTableCaption, TisTableCell, TisTableHeader, TisTableHeaderCell, TisTableRegion, TisTableRow, TisTableSort, TisTableSortIcon];
const rows = [
  { id: 1, name: "Ana Silva", status: "Ativo", email: "ana.silva@tis.com.br" },
  { id: 2, name: "Bruno Lima", status: "Pendente", email: "bruno.lima@tis.com.br" },
  { id: 3, name: "Carla Rocha", status: "Ativo", email: "carla.rocha@tis.com.br" },
];
const sortRows = (items: typeof rows, direction: string) => [...items].sort((a, b) =>
  a.name.localeCompare(b.name, "pt-BR") * (direction === "descending" ? -1 : 1));

const tableTemplate = (size = "md", selected = 2, nowrap = false, label = "Tabela de clientes") => `<div tisTableRegion label="${label}">
  <table tisTable size="${size}" ${nowrap ? "nowrap" : ""}>
    <caption tisTableCaption>Clientes</caption>
    <thead tisTableHeader><tr tisTableRow>
      <th tisTableHeaderCell sortable [sort]="sortDirection"><button tisTableSort aria-label="Ordenar por Cliente" (click)="sortDirection = sortDirection === 'ascending' ? 'descending' : 'ascending'; rows = sortRows(rows, sortDirection)"><span>Cliente</span><svg tisTableSortIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg></button></th>
      <th tisTableHeaderCell>Status</th><th tisTableHeaderCell>E-mail</th><th tisTableHeaderCell align="end">Ações</th>
    </tr></thead>
    <tbody tisTableBody>
      @for (row of rows; track row.email) {
        <tr tisTableRow [selected]="row.id === selectedRow">
          <td tisTableCell>{{ row.name }}</td>
          <td tisTableCell><tis-badge [tone]="row.status === 'Ativo' ? 'success' : 'warning'" variant="subtle">{{ row.status }}</tis-badge></td>
          <td tisTableCell>{{ row.email }}</td>
          <td tisTableCell control align="end"><tis-button variant="ghost" size="sm">Abrir</tis-button></td>
        </tr>
      }
    </tbody>
  </table>
</div>`;

const meta: Meta = {
  id: "angular-table",
  title: "Componentes/Table",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports })],
  args: { size: "md", selectedRow: 2, nowrap: false, sortDirection: "none", rows: [...rows] },
  argTypes: {
    size: { control: "radio", options: ["sm", "md"] },
    selectedRow: { control: "radio", options: [0, 1, 2, 3] },
    nowrap: { control: "boolean" },
    sortDirection: { control: false },
    rows: { control: false },
  },
  render: (args) => ({ props: { ...args, rows: [...rows], sortRows }, template: tableTemplate(args.size, args.selectedRow, args.nowrap) }),
};

export default meta;
type Story = StoryObj;
export const Playground: Story = {};
export const Tamanhos: Story = {
  render: () => ({ props: { rows: [rows[0]], selectedRow: 0, sortDirection: "none", sortRows }, template: `<div class="ds-angular-table-stack"><section><h2>Small</h2>${tableTemplate("sm", 0, false, "Tabela de clientes small")}</section><section><h2>Medium</h2>${tableTemplate("md", 0, false, "Tabela de clientes medium")}</section></div>` }),
};
export const Estados: Story = { render: () => ({ props: { rows: [...rows], selectedRow: 1, sortDirection: "none", sortRows }, template: tableTemplate("md", 1) }) };
export const Overflow: Story = { render: () => ({ props: { rows: [...rows], selectedRow: 0, sortDirection: "none", sortRows }, template: `<div class="ds-angular-table-constrained">${tableTemplate("md", 0, true)}</div>` }) };
