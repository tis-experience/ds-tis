import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { TisSkeleton, TisSkeletonGroup } from "@tis/angular/skeleton";

@Component({
  standalone: true,
  imports: [TisSkeleton, TisSkeletonGroup],
  template: `<div tisSkeletonGroup label="Carregando perfil"><tis-skeleton type="circle" /></div>`,
})
class SkeletonGroupFixture {}

describe("Skeleton Angular", () => {
  it("renderiza shape decorativo de texto por padrão", async () => {
    const fixture = TestBed.createComponent(TisSkeleton);
    await fixture.whenStable();
    const skeleton = fixture.nativeElement as HTMLElement;
    expect(skeleton.classList.contains("ds-skeleton--text")).toBe(true);
    expect(skeleton.getAttribute("aria-hidden")).toBe("true");
    expect(skeleton.getAttribute("data-type")).toBe("text");
    expect(skeleton.tabIndex).toBe(-1);
  });

  it("alterna tipos sem acumular modifiers", async () => {
    const fixture = TestBed.createComponent(TisSkeleton);
    fixture.componentRef.setInput("type", "circle");
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains("ds-skeleton--circle")).toBe(true);
    fixture.componentRef.setInput("type", "rectangle");
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains("ds-skeleton--rectangle")).toBe(true);
    expect(fixture.nativeElement.classList.contains("ds-skeleton--circle")).toBe(false);
  });

  it("aceita largura de composição sem mudar a altura do tipo", async () => {
    const fixture = TestBed.createComponent(TisSkeleton);
    fixture.componentRef.setInput("width", "60%");
    await fixture.whenStable();
    expect(fixture.nativeElement.style.inlineSize).toBe("60%");
  });

  it("anuncia o grupo uma vez e mantém o shape decorativo", async () => {
    const fixture = TestBed.createComponent(SkeletonGroupFixture);
    await fixture.whenStable();
    const group = fixture.nativeElement.querySelector("div");
    expect(group.getAttribute("role")).toBe("status");
    expect(group.getAttribute("aria-label")).toBe("Carregando perfil");
    expect(group.getAttribute("aria-busy")).toBe("true");
    expect(group.querySelector("tis-skeleton")?.getAttribute("aria-hidden")).toBe("true");
  });
});
