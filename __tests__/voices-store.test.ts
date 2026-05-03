import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addVoice, getMyUpvotes, listVoices, upvote } from "@/lib/voices-store";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("addVoice (localStorage fallback)", () => {
  it("creates a voice with a generated id and persists it", async () => {
    const v = await addVoice({
      text: "Hello world",
      uid: null,
      isAnonymous: true,
      authorName: null,
      authorPhotoURL: null,
    });
    expect(v).not.toBeNull();
    expect(v!.id.startsWith("v-")).toBe(true);
    expect(v!.text).toBe("Hello world");
    expect(v!.upvotes).toBe(0);
    expect(listVoices()).toHaveLength(1);
  });

  it("trims whitespace from the post text", async () => {
    const v = await addVoice({
      text: "   spaced post   ",
      uid: null,
      isAnonymous: true,
      authorName: null,
      authorPhotoURL: null,
    });
    expect(v!.text).toBe("spaced post");
  });

  it("listVoices returns posts in newest-first order", async () => {
    const a = await addVoice({
      text: "first",
      uid: null,
      isAnonymous: true,
      authorName: null,
      authorPhotoURL: null,
    });
    // Wait a tick so createdAt is monotonically distinct.
    await new Promise((r) => setTimeout(r, 5));
    const b = await addVoice({
      text: "second",
      uid: null,
      isAnonymous: true,
      authorName: null,
      authorPhotoURL: null,
    });
    const list = listVoices();
    expect(list[0].id).toBe(b!.id);
    expect(list[1].id).toBe(a!.id);
  });
});

describe("upvote (localStorage fallback)", () => {
  it("increments upvotes and dedupes per device", async () => {
    const v = await addVoice({
      text: "Up me",
      uid: null,
      isAnonymous: true,
      authorName: null,
      authorPhotoURL: null,
    });
    await upvote(v!.id, null);
    let list = listVoices();
    expect(list[0].upvotes).toBe(1);

    // Second upvote from the same device is a no-op.
    await upvote(v!.id, null);
    list = listVoices();
    expect(list[0].upvotes).toBe(1);
  });

  it("getMyUpvotes returns the set of voice ids the device has upvoted", async () => {
    const v1 = await addVoice({
      text: "a",
      uid: null,
      isAnonymous: true,
      authorName: null,
      authorPhotoURL: null,
    });
    const v2 = await addVoice({
      text: "b",
      uid: null,
      isAnonymous: true,
      authorName: null,
      authorPhotoURL: null,
    });
    await upvote(v1!.id, null);
    const set = await getMyUpvotes(null);
    expect(set.has(v1!.id)).toBe(true);
    expect(set.has(v2!.id)).toBe(false);
  });
});
