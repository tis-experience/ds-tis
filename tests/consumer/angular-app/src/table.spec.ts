import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { TisTable, TisTableBody, TisTableCaption, TisTableCell, TisTableHeader, TisTableHeaderCell, TisTableRegion, TisTableRow, TisTableSort } from "@tis/angular/table";

@Component({
  standalone: true,
  imports: [TisTable, TisTableBody, TisTableCaption, TisTableCell, TisTableHeader, TisTableHeaderCell, TisTableRegion, TisTableRow, TisTableSort],
  template: `<div tisTableRegion label="Resultados"><table tisTable size="md" nowrap>
    <caption tisTableCaption>Clientes</caption><thead tisTableHeader><tr tisTableRow><th tisTableHeaderCell sortable sort="ascending"><button tisTableSort>Cliente</button></th></tr></thead>
    <tbody tisTableBody><tr tisTableRow selected><td tisTableCell>Ana</td></tr></tbody>
  </table></div>`,
})
class HostComponent {}

describe("Table directives", () => {
  it("preserva a semântica HTML e o nome da região rolável", () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    const region = fixture.nativeElement.querySelector('[role="region"]') as HTMLElement;
    expect(region.getAttribute("aria-label")).toBe("Resultados");
    expect(region.getAttribute("tabindex")).toBe("0");
    expect(region.querySelector("table caption")?.textContent).toBe("Clientes");
  });

  it("aplica tamanho, overflow e estados sem transformar table em grid", () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    const table = fixture.nativeElement.querySelector("table") as HTMLTableElement;
    expect(table.classList.contains("ds-table--md")).toBe(true);
    expect(table.classList.contains("ds-table--nowrap")).toBe(true);
    expect(table.hasAttribute("role")).toBe(false);
    expect(table.querySelector("tr[data-selected=true]")).not.toBeNull();
  });

  it("mantém aria-sort no header e o Button como controle nativo", () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    const header = fixture.nativeElement.querySelector("th") as HTMLTableCellElement;
    expect(header.getAttribute("scope")).toBe("col");
    expect(header.getAttribute("aria-sort")).toBe("ascending");
    expect(header.querySelector("button")?.type).toBe("button");
  });
});
