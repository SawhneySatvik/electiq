import { describe, expect, it } from "vitest";
import { dict, interpolate, LOCALES, lookupStatic } from "@/lib/i18n";

describe("interpolate", () => {
  it("returns the template untouched when no vars are passed", () => {
    expect(interpolate("Hello world")).toBe("Hello world");
  });

  it("replaces named placeholders with vars", () => {
    expect(interpolate("Hello {name}", { name: "World" })).toBe("Hello World");
  });

  it("coerces numeric vars to strings", () => {
    expect(interpolate("{n} votes", { n: 5 })).toBe("5 votes");
    expect(interpolate("{n} votes", { n: 0 })).toBe("0 votes");
  });

  it("preserves placeholders that are missing from vars", () => {
    expect(interpolate("Hello {name}, age {age}", { name: "Asha" })).toBe("Hello Asha, age {age}");
  });

  it("handles multiple occurrences of the same placeholder", () => {
    expect(interpolate("{x} = {x}", { x: 1 })).toBe("1 = 1");
  });
});

describe("lookupStatic", () => {
  it("resolves a key from the requested locale when present", () => {
    const r = lookupStatic("en", "nav.explore");
    expect(r.value).toBe("Explore");
    expect(r.isFallback).toBe(false);
  });

  it("resolves a hi key directly when present", () => {
    const r = lookupStatic("hi", "nav.explore");
    expect(r.value).toBe("खोजें");
    expect(r.isFallback).toBe(false);
  });

  it("falls back to en for empty target locales and flags it", () => {
    const r = lookupStatic("ta", "nav.explore");
    expect(r.value).toBe("Explore");
    expect(r.isFallback).toBe(true);
  });

  it("returns the key itself when both locale and en are missing", () => {
    const r = lookupStatic("en", "this.key.does.not.exist");
    expect(r.value).toBe("this.key.does.not.exist");
  });

  it("never marks en as a fallback even for missing keys", () => {
    const r = lookupStatic("en", "missing");
    expect(r.isFallback).toBe(false);
  });
});

describe("dict shape", () => {
  it("exposes all six declared locales", () => {
    expect(LOCALES).toEqual(["en", "hi", "ta", "bn", "mr", "te"]);
    for (const l of LOCALES) expect(dict[l]).toBeDefined();
  });

  it("populates en and hi but leaves ta/bn/mr/te empty by design", () => {
    expect(Object.keys(dict.en).length).toBeGreaterThan(50);
    expect(Object.keys(dict.hi).length).toBeGreaterThan(50);
    expect(Object.keys(dict.ta)).toHaveLength(0);
    expect(Object.keys(dict.bn)).toHaveLength(0);
    expect(Object.keys(dict.mr)).toHaveLength(0);
    expect(Object.keys(dict.te)).toHaveLength(0);
  });

  it("keeps hi keys aligned with en keys", () => {
    const enKeys = new Set(Object.keys(dict.en));
    const hiKeys = new Set(Object.keys(dict.hi));
    for (const k of hiKeys) {
      expect(enKeys.has(k)).toBe(true);
    }
  });
});
