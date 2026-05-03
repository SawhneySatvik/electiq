import { describe, expect, it } from "vitest";
import {
  EXIT_POLL_EID_KEY,
  EXIT_POLL_TALLIES_KEY,
  EXIT_POLL_VOTES_KEY,
  LOCALE_KEY,
  THEME_KEY,
  TRANSLATION_CACHE_PREFIX,
  UPVOTED_PREFIX,
  VOICES_KEY,
  VOICES_LS_UID_KEY,
  translationCacheKey,
  upvotedKey,
} from "@/lib/storage-keys";

describe("storage keys", () => {
  it("share the electoiq- namespace", () => {
    const all = [
      LOCALE_KEY,
      THEME_KEY,
      TRANSLATION_CACHE_PREFIX,
      VOICES_LS_UID_KEY,
      VOICES_KEY,
      UPVOTED_PREFIX,
      EXIT_POLL_EID_KEY,
      EXIT_POLL_VOTES_KEY,
      EXIT_POLL_TALLIES_KEY,
    ];
    for (const k of all) expect(k.startsWith("electoiq-")).toBe(true);
  });

  it("produce stable suffix-based keys", () => {
    expect(translationCacheKey("hi")).toBe("electoiq-tx-hi");
    expect(translationCacheKey("ta")).toBe("electoiq-tx-ta");
    expect(upvotedKey("u-abc")).toBe("electoiq-upvoted-u-abc");
  });

  it("are mutually distinct", () => {
    const keys = [
      LOCALE_KEY,
      THEME_KEY,
      VOICES_LS_UID_KEY,
      VOICES_KEY,
      EXIT_POLL_EID_KEY,
      EXIT_POLL_VOTES_KEY,
      EXIT_POLL_TALLIES_KEY,
    ];
    expect(new Set(keys).size).toBe(keys.length);
  });
});
