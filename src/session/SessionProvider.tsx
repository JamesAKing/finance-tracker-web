import type { ReactNode } from "react";
import type { User } from "../api/session.ts";
import { SessionContext } from "./session-context.ts";

type SessionProviderProps = {
  user: User;
  children: ReactNode;
};

export function SessionProvider({ user, children }: SessionProviderProps) {
  return <SessionContext value={{ user }}>{children}</SessionContext>;
}
