import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { SessionProvider } from "./SessionProvider.tsx";
import { useSession } from "./use-session.ts";

describe("useSession", () => {
  it("returns the user from SessionProvider", () => {
    const user = { email: "user@example.com" };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <SessionProvider user={user}>{children}</SessionProvider>
    );

    const { result } = renderHook(() => useSession(), { wrapper });

    expect(result.current.user).toEqual(user);
  });

  it("throws when used outside SessionProvider", () => {
    expect(() => renderHook(() => useSession())).toThrow(
      "useSession must be used inside SessionProvider",
    );
  });
});
