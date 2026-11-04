import { createContext, use } from "react";

export type User = {
  email: string;
};

export type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: User }
  | { status: "unauthenticated" }
  | { status: "error" };

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const auth = use(AuthContext);
  if (auth === null) throw new Error("useAuth must be used inside an AuthProvider");
  return auth;
}
