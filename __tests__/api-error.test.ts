import { describe, expect, it } from "vitest";
import { errorResponse, toErrorMessage, unexpectedError } from "@/lib/api-error";

describe("toErrorMessage", () => {
  it("extracts message from an Error instance", () => {
    expect(toErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("returns the string as-is when given a string", () => {
    expect(toErrorMessage("plain string")).toBe("plain string");
  });

  it("returns the safe sentinel for opaque values", () => {
    expect(toErrorMessage(undefined)).toBe("Unknown error");
    expect(toErrorMessage({ random: "object" })).toBe("Unknown error");
    expect(toErrorMessage(42)).toBe("Unknown error");
  });
});

describe("errorResponse", () => {
  it("returns a NextResponse with the given status code", async () => {
    const res = errorResponse("nope", 400);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "nope" });
  });

  it("includes an optional code field when provided", async () => {
    const res = errorResponse("nope", 422, "INVALID_INPUT");
    const body = await res.json();
    expect(body).toEqual({ error: "nope", code: "INVALID_INPUT" });
  });

  it("defaults to status 500 when omitted", () => {
    expect(errorResponse("server-side").status).toBe(500);
  });
});

describe("unexpectedError", () => {
  it("wraps any throw into a 500 response with the UNEXPECTED code", async () => {
    const res = unexpectedError(new Error("kaboom"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("kaboom");
    expect(body.code).toBe("UNEXPECTED");
  });
});
