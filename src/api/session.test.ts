import { describe, expect, it } from "vitest";
import { AuthApi, Configuration } from "./generated/index.ts";
import { fetchCurrentUser } from "./session.ts";

function apiRespondingWith(response: Response) {
  return new AuthApi(new Configuration({ fetchApi: () => Promise.resolve(response) }));
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("fetchCurrentUser", () => {
  it("returns the signed-in user", async () => {
    const api = apiRespondingWith(jsonResponse(200, { email: "user@example.com" }));

    await expect(fetchCurrentUser(api)).resolves.toEqual({ email: "user@example.com" });
  });

  it("returns null when there is no session", async () => {
    const api = apiRespondingWith(jsonResponse(401, { title: "Unauthorized", status: 401 }));

    await expect(fetchCurrentUser(api)).resolves.toBeNull();
  });

  it("throws for other errors", async () => {
    const api = apiRespondingWith(
      jsonResponse(500, { title: "Internal Server Error", status: 500 }),
    );

    await expect(fetchCurrentUser(api)).rejects.toMatchObject({ response: { status: 500 } });
  });
});
