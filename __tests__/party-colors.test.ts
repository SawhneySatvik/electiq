import { describe, expect, it } from "vitest";
import { getCharacterBadgeColor, getPartyColor, listPartyColors } from "@/lib/party-colors";

describe("getPartyColor", () => {
  it("returns the orange brand for BJP", () => {
    expect(getPartyColor("BJP")).toBe("#f97316");
  });

  it("returns the blue brand for INC", () => {
    expect(getPartyColor("INC")).toBe("#2563eb");
  });

  it("covers regional parties added in the J&K / Northeast batch", () => {
    expect(getPartyColor("NC")).toBeDefined();
    expect(getPartyColor("PDP")).toBeDefined();
    expect(getPartyColor("MNF")).toBeDefined();
    expect(getPartyColor("ZPM")).toBeDefined();
    expect(getPartyColor("NDPP")).toBeDefined();
    expect(getPartyColor("VPP")).toBeDefined();
  });

  it("returns the neutral fallback for unknown parties", () => {
    expect(getPartyColor("DOES_NOT_EXIST")).toBe("#71717a");
  });

  it("never returns the empty string for any defined party", () => {
    for (const [, color] of Object.entries(listPartyColors())) {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe("getCharacterBadgeColor", () => {
  it.each([
    ["stronghold", "#10b981"],
    ["swing", "#f59e0b"],
    ["volatile", "#ef4444"],
  ])("returns the canonical colour for character=%s", (character, expected) => {
    expect(getCharacterBadgeColor(character)).toBe(expected);
  });

  it("falls back to neutral grey for unknown character labels", () => {
    expect(getCharacterBadgeColor("unknown")).toBe("#71717a");
  });
});

describe("listPartyColors", () => {
  it("includes all major national parties in the catalogue", () => {
    const colors = listPartyColors();
    for (const p of ["BJP", "INC", "AAP", "TMC", "DMK", "AIADMK", "NCP", "SS", "BSP"]) {
      expect(colors[p]).toBeDefined();
    }
  });

  it("returns a non-empty record", () => {
    expect(Object.keys(listPartyColors()).length).toBeGreaterThan(30);
  });
});
