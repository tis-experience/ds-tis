import { TestBed } from "@angular/core/testing";
import { TisAvatar } from "@tis/angular/avatar";

describe("Avatar Angular", () => {
  async function create(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(TisAvatar);
    for (const [name, value] of Object.entries({ label: "Ana Lima", initials: "AL", ...inputs })) {
      fixture.componentRef.setInput(name, value);
    }
    await fixture.whenStable();
    return fixture;
  }

  it("expõe um único nome acessível, iniciais e tamanho padrão", async () => {
    const fixture = await create();
    const avatar = fixture.nativeElement as HTMLElement;
    expect(avatar.getAttribute("role")).toBe("img");
    expect(avatar.getAttribute("aria-label")).toBe("Ana Lima");
    expect(avatar.getAttribute("data-size")).toBe("md");
    expect(avatar.textContent?.trim()).toBe("AL");
    expect(avatar.querySelector("span")?.getAttribute("aria-hidden")).toBe("true");
    expect(avatar.tabIndex).toBe(-1);
  });

  it("usa ícone quando não há iniciais e preserva sm/lg", async () => {
    const fixture = await create({ initials: "", size: "sm" });
    expect(fixture.nativeElement.classList.contains("ds-avatar--icon")).toBe(true);
    expect(fixture.nativeElement.classList.contains("ds-avatar--sm")).toBe(true);
    expect(fixture.nativeElement.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    fixture.componentRef.setInput("size", "lg");
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains("ds-avatar--lg")).toBe(true);
    expect(fixture.nativeElement.classList.contains("ds-avatar--sm")).toBe(false);
  });

  it("troca imagem inválida por iniciais e recupera ao mudar src", async () => {
    const fixture = await create({ content: "image", src: "/photo-a.png" });
    const image = fixture.nativeElement.querySelector("img") as HTMLImageElement;
    expect(image.alt).toBe("");
    image.dispatchEvent(new Event("error"));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector("img")).toBeNull();
    expect(fixture.nativeElement.textContent.trim()).toBe("AL");
    fixture.componentRef.setInput("src", "/photo-b.png");
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector("img")?.getAttribute("src")).toBe("/photo-b.png");
    image.dispatchEvent(new Event("error"));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector("img")).not.toBeNull();
  });

  it("usa ícone para imagem ausente ou inválida sem iniciais", async () => {
    const fixture = await create({ content: "image", initials: "", src: null });
    expect(fixture.nativeElement.querySelector("svg")).not.toBeNull();
    fixture.componentRef.setInput("src", "/missing.png");
    await fixture.whenStable();
    fixture.nativeElement.querySelector("img").dispatchEvent(new Event("error"));
    await fixture.whenStable();
    expect(fixture.nativeElement.getAttribute("data-content")).toBe("icon");
  });

  it("remove nome e role quando decorativo e permite restaurá-los", async () => {
    const fixture = await create({ decorative: true });
    expect(fixture.nativeElement.getAttribute("aria-hidden")).toBe("true");
    expect(fixture.nativeElement.getAttribute("aria-label")).toBeNull();
    expect(fixture.nativeElement.getAttribute("role")).toBeNull();
    fixture.componentRef.setInput("decorative", "false");
    await fixture.whenStable();
    expect(fixture.nativeElement.getAttribute("aria-hidden")).toBeNull();
    expect(fixture.nativeElement.getAttribute("aria-label")).toBe("Ana Lima");
  });
});
