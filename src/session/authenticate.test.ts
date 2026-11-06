import { QueryClient } from "@tanstack/react-query";
import { isRedirect } from "@tanstack/react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authApi } from "../api/client.ts";
import { ResponseError } from "../api/generated/index.ts";
import { authenticate, LOGIN_URL } from "./authenticate.ts";

function respondWithUser() {
  return vi.spyOn(authApi, "getCurrentUser").mockResolvedValue({ email: "user@example.com" });
}

function respondWithStatus(status: number) {
  return vi
    .spyOn(authApi, "getCurrentUser")
    .mockRejectedValue(new ResponseError(new Response(null, { status })));
}

async function rejectionOf(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error("Expected the promise to reject");
}

function run(searchStr = "") {
  return authenticate({ queryClient: new QueryClient(), searchStr });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("authenticate", () => {
  it("returns the signed-in user", async () => {
    respondWithUser();

    await expect(run()).resolves.toEqual({ email: "user@example.com" });
  });

  it("sends the browser to the service's login when there is no session", async () => {
    respondWithStatus(401);

    const error = await rejectionOf(run());

    expect(isRedirect(error)).toBe(true);
    expect(error).toMatchObject({ options: { href: LOGIN_URL, reloadDocument: true } });
  });

  it("shows the login-failed page instead of sending the browser back to login", async () => {
    const getCurrentUser = respondWithStatus(401);

    const error = await rejectionOf(run("?login=failed"));

    expect(isRedirect(error)).toBe(true);
    expect(error).toMatchObject({ options: { to: "/login-failed" } });
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it("throws other errors so the error page shows, without redirecting", async () => {
    respondWithStatus(500);

    const error = await rejectionOf(run());

    expect(isRedirect(error)).toBe(false);
    expect(error).toBeInstanceOf(ResponseError);
  });
});
