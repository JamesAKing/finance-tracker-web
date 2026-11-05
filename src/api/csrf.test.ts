import { describe, expect, it, vi } from "vitest";
import { createCsrfMiddleware } from "./csrf.ts";

function runPre(method: string, getToken: () => Promise<string>) {
  const middleware = createCsrfMiddleware(getToken);
  return middleware.pre!({ fetch, url: "/api/example", init: { method } });
}

describe("createCsrfMiddleware", () => {
  it.each(["POST", "PUT", "PATCH", "DELETE"])(
    "adds the token header to %s requests",
    async (method) => {
      const result = await runPre(method, () => Promise.resolve("token-123"));

      expect(result?.url).toBe("/api/example");
      expect(new Headers(result?.init.headers).get("X-CSRF-Token")).toBe("token-123");
    },
  );

  it.each(["GET", "HEAD", "OPTIONS"])("leaves %s requests unchanged", async (method) => {
    const getToken = vi.fn(() => Promise.resolve("token-123"));

    const result = await runPre(method, getToken);

    expect(result).toBeUndefined();
    expect(getToken).not.toHaveBeenCalled();
  });

  it("keeps the request's existing headers", async () => {
    const middleware = createCsrfMiddleware(() => Promise.resolve("token-123"));

    const result = await middleware.pre!({
      fetch,
      url: "/api/example",
      init: { method: "POST", headers: { "Content-Type": "application/json" } },
    });

    expect(new Headers(result?.init.headers).get("Content-Type")).toBe("application/json");
  });
});
