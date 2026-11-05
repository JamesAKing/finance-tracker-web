import { Configuration, type Middleware } from "./generated/index.ts";

export function createConfiguration(middleware: Middleware[] = []) {
  return new Configuration({
    basePath: "/api",
    credentials: "same-origin",
    middleware,
  });
}
