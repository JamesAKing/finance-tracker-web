import { type ReactNode, useEffect, useState } from "react";

import { authApi } from "../api/client.ts";
import { ResponseError } from "../api/generated/index.ts";
import { AuthContext, type AuthState } from "./auth-context.ts";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let ignore = false;

    authApi
      .getCurrentUser()
      .then((user) => {
        if (!ignore) setState({ status: "authenticated", user: { email: user.email } });
      })
      .catch((error: unknown) => {
        if (ignore) return;
        // A 401 is the normal answer when nobody is signed in.
        const signedOut = error instanceof ResponseError && error.response.status === 401;
        setState({ status: signedOut ? "unauthenticated" : "error" });
      });

    return () => {
      ignore = true;
    };
  }, []);

  return <AuthContext value={state}>{children}</AuthContext>;
}
