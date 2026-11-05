import { createFileRoute } from "@tanstack/react-router";
import { LOGIN_URL } from "../session/authenticate.ts";

export const Route = createFileRoute("/login-failed")({
  component: LoginFailed,
});

function LoginFailed() {
  return (
    <main>
      <h1>Sign-in didn't complete</h1>
      <p>
        This can happen if the sign-in page was open for a long time, or if you went back from it.
      </p>
      <a href={LOGIN_URL}>Try again</a>
      <p>If this keeps happening, check that cookies aren't blocked for this site.</p>
    </main>
  );
}
