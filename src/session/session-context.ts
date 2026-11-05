import { createContext } from "react";
import type { User } from "../api/session.ts";

export type Session = {
  user: User;
};

export const SessionContext = createContext<Session | null>(null);
