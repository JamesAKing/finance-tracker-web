import { queryOptions } from "@tanstack/react-query";

import { authApi } from "../api/client.ts";
import { ResponseError } from "../api/generated/index.ts";

export type User = {
  email: string;
};

// Resolves to null when nobody is signed in. A 401 is the normal answer then, not an error.
export const currentUserQueryOptions = queryOptions({
  queryKey: ["auth", "me"],
  queryFn: async (): Promise<User | null> => {
    try {
      const { email } = await authApi.getCurrentUser();
      return { email };
    } catch (error) {
      if (error instanceof ResponseError && error.response.status === 401) return null;
      throw error;
    }
  },
  retry: false,
});
