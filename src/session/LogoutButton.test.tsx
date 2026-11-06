import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { csrfQueryOptions } from "../api/csrf.ts";
import { LogoutButton } from "./LogoutButton.tsx";

function renderWithCsrfToken(csrfToken?: string) {
  const queryClient = new QueryClient();
  if (csrfToken) queryClient.setQueryData(csrfQueryOptions.queryKey, csrfToken);

  return render(
    <QueryClientProvider client={queryClient}>
      <LogoutButton />
    </QueryClientProvider>,
  );
}

afterEach(cleanup);

describe("LogoutButton", () => {
  it("posts the CSRF token to the service's logout", () => {
    renderWithCsrfToken("token-123");

    const button = screen.getByRole<HTMLButtonElement>("button", { name: "Log out" });
    const form = button.form!;

    expect(button.disabled).toBe(false);
    expect(form.method).toBe("post");
    expect(form.getAttribute("action")).toBe("/api/auth/logout");
    expect(new FormData(form).get("_csrf")).toBe("token-123");
  });

  it("is disabled until the CSRF token has loaded", () => {
    renderWithCsrfToken();

    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Log out" }).disabled).toBe(true);
  });
});
