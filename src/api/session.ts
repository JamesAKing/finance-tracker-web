import { queryOptions } from "@tanstack/react-query";

import { authApi } from "./client.ts";
import { type AuthApi, type CurrentUser, ResponseError } from "./generated/index.ts";

export type User = {
  email: string;
};

function toUser({ email }: CurrentUser): User {
  return { email };
}

export async function fetchCurrentUser(api: AuthApi = authApi): Promise<User | null> {
  try {
    return toUser(await api.getCurrentUser());
  } catch (error) {
    if (error instanceof ResponseError && error.response.status === 401) return null;
    throw error;
  }
}

export const meQueryOptions = queryOptions({
  queryKey: ["auth", "me"],
  queryFn: () => fetchCurrentUser(),
});
