import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/analyse-constituency/route";

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/analyse-constituency", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/analyse-constituency — input validation", () => {
  it("rejects a missing constituency with 400", async () => {
    const res = await POST(jsonRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/constituency/i);
  });

  it("rejects a constituency with no results", async () => {
    const res = await POST(
      jsonRequest({
        constituency: {
          id: "x",
          name: "Test",
          state: "Test",
          reserved: "GEN",
          results: [],
        },
      }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/results/i);
  });
});
