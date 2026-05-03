/**
 * Consistent error response shape for `app/api/*` routes.
 *
 * Every API route should return either `{ … }` on success or `{ error, code? }`
 * on failure. Stack traces are never serialised — we leak only the error
 * message we already chose to surface.
 */

import { NextResponse } from "next/server";

/** Error response envelope. `code` is an optional machine-friendly tag. */
export interface ApiError {
  error: string;
  code?: string;
}

/** Build a JSON `Response` with the given status code. */
export function errorResponse(message: string, status = 500, code?: string): NextResponse<ApiError> {
  return NextResponse.json<ApiError>({ error: message, code }, { status });
}

/** Map an unknown thrown value to a safe display string. */
export function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
}

/** Convenience: catch-all 500 response for unexpected throws. */
export function unexpectedError(err: unknown): NextResponse<ApiError> {
  return errorResponse(toErrorMessage(err), 500, "UNEXPECTED");
}
