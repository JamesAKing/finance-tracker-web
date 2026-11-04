import { Navigate, Outlet } from "react-router";

import { useAuth } from "./auth-context.ts";

export function RequireAuth() {
  const auth = useAuth();

  switch (auth.status) {
    case "loading":
      return <p>Loading…</p>;
    case "error":
      return <p role="alert">We could not check your session. Refresh the page to try again.</p>;
    case "unauthenticated":
      return <Navigate to="/login" replace />;
    case "authenticated":
      return <Outlet />;
  }
}
