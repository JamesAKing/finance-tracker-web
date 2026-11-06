import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { meQueryOptions, type User } from "../api/session.ts";

export const LOGIN_URL = "/api/auth/login";

type AuthenticateOptions = {
  queryClient: QueryClient;
  searchStr: string;
};

export function loginFailed(searchStr: string) {
  return new URLSearchParams(searchStr).get("login") === "failed";
}

export async function authenticate({ queryClient, searchStr }: AuthenticateOptions): Promise<User> {
  if (loginFailed(searchStr)) throw redirect({ to: "/login-failed" });

  const user = await queryClient.ensureQueryData(meQueryOptions);
  if (!user) throw redirect({ href: LOGIN_URL, reloadDocument: true });

  return user;
}
