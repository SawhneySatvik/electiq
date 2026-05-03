import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/translate/route";

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/translate — input validation", () => {
  it("rejects an empty texts array with 400", async () => {
    const res = await POST(jsonRequest({ texts: [], locale: "hi" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/texts/i);
  });

  it("rejects a non-array texts field", async () => {
    const res = await POST(jsonRequest({ texts: "hello", locale: "hi" }));
    expect(res.status).toBe(400);
  });

  it("rejects an unknown locale", async () => {
    const res = await POST(jsonRequest({ texts: ["hi"], locale: "xx" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/locale/i);
  });

  it("short-circuits when locale is en and returns the inputs verbatim (no Gemini call needed)", async () => {
    const inputs = ["Hello", "World"];
    const res = await POST(jsonRequest({ texts: inputs, locale: "en" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.translations).toEqual(inputs);
  });
});
