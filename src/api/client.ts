import { QueryClient } from "@tanstack/react-query";

import { AuthApi } from "./generated/index.ts";

export const authApi = new AuthApi();

export const queryClient = new QueryClient();
