import { TestBed } from "@angular/core/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { TisPagination } from "@tis/angular/pagination";
import { TisPaginationHarness } from "@tis/angular/testing";

describe("Pagination Angular", () => {
  async function create(currentPage = 5, totalPages = 10) {
    const fixture = TestBed.createComponent(TisPagination);
    fixture.componentRef.setInput("currentPage", currentPage);
    fixture.componentRef.setInput("totalPages", totalPages);
    await fixture.whenStable();
    return fixture;
  }

  it("renderiza landmark, página atual, links e ellipsis sem foco", async () => {
    const fixture = await create();
    const nav = fixture.nativeElement.querySelector("nav") as HTMLElement;
    expect(nav.getAttribute("aria-label")).toBe("Paginação");
    expect(nav.querySelector('[aria-current="page"]')?.textContent).toBe("5");
    expect(Array.from(nav.querySelectorAll("a")).map((node) => node.textContent)).toEqual(["1", "4", "6", "10"]);
    expect(nav.querySelectorAll('.ds-pagination__ellipsis[aria-hidden="true"]').length).toBe(2);
    expect(nav.querySelectorAll('[aria-current="page"] a').length).toBe(0);
  });

  it("emite páginas por link, anterior e próxima sem mutar o estado controlado", async () => {
    const fixture = await create();
    const changes: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => changes.push(page));
    (fixture.nativeElement.querySelector('a[aria-label="Página 6"]') as HTMLElement).click();
    (fixture.nativeElement.querySelector('button[aria-label="Página anterior"]') as HTMLElement).click();
    (fixture.nativeElement.querySelector('button[aria-label="Próxima página"]') as HTMLElement).click();
    expect(changes).toEqual([6, 4, 6]);
    expect(fixture.nativeElement.querySelector('[aria-current="page"]')?.textContent).toBe("5");
  });

  it("preserva links modificados e cliques não primários sem mudar a página atual", async () => {
    const fixture = await create();
    const changes: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => changes.push(page));
    const link = fixture.nativeElement.querySelector('a[aria-label="Página 6"]') as HTMLAnchorElement;

    for (const modifiers of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { button: 2 }]) {
      const event = new MouseEvent("click", { bubbles: true, cancelable: true, ...modifiers });
      link.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }

    expect(changes).toEqual([]);
    expect(link.getAttribute("href")).toBe("?page=6");
    expect(fixture.nativeElement.querySelector('[aria-current="page"]')?.textContent).toBe("5");

    const click = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    link.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(changes).toEqual([6]);
  });

  it("desabilita apenas o controle correspondente nos limites", async () => {
    const fixture = await create(1, 10);
    const previous = fixture.nativeElement.querySelector('button[aria-label="Página anterior"]') as HTMLButtonElement;
    const next = fixture.nativeElement.querySelector('button[aria-label="Próxima página"]') as HTMLButtonElement;
    expect(previous.disabled).toBe(true);
    expect(previous.getAttribute("aria-disabled")).toBe("true");
    expect(next.disabled).toBe(false);
    fixture.componentRef.setInput("currentPage", 10);
    await fixture.whenStable();
    expect(previous.disabled).toBe(false);
    expect(next.disabled).toBe(true);
  });

  it("normaliza valores fora do intervalo e aplica tamanho e labels", async () => {
    const fixture = await create(99, 3);
    fixture.componentRef.setInput("size", "lg");
    fixture.componentRef.setInput("label", "Resultados encontrados");
    fixture.componentRef.setInput("pageLabel", (page: number) => `Ir à página ${page}`);
    await fixture.whenStable();
    const nav = fixture.nativeElement.querySelector("nav") as HTMLElement;
    expect(nav.classList.contains("ds-pagination--lg")).toBe(true);
    expect(nav.getAttribute("aria-label")).toBe("Resultados encontrados");
    expect(nav.querySelector('[aria-current="page"]')?.textContent).toBe("3");
    expect(nav.querySelector("a")?.getAttribute("aria-label")).toBe("Ir à página 1");
  });

  it("permite navegar pelo harness com labels e endereços personalizados", async () => {
    const fixture = await create();
    fixture.componentRef.setInput("label", "Search result pages");
    fixture.componentRef.setInput("pageLabel", (page: number) => `Go to result page ${page}`);
    fixture.componentRef.setInput("previousLabel", "Previous results");
    fixture.componentRef.setInput("nextLabel", "Next results");
    fixture.componentRef.setInput("hrefFor", (page: number) => `/results?page=${page}`);
    const changes: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => changes.push(page));
    await fixture.whenStable();

    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TisPaginationHarness);
    expect(await harness.getLabel()).toBe("Search result pages");
    expect(await harness.getCurrentPage()).toBe(5);
    await harness.goTo(6);
    await harness.next();
    await harness.previous();
    expect(changes).toEqual([6, 6, 4]);
    expect(fixture.nativeElement.querySelector('a[aria-label="Go to result page 6"]').getAttribute("href")).toBe("/results?page=6");
  });
});
