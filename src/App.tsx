import { useQuery } from "@tanstack/react-query";

import "./App.css";
import { meQueryOptions } from "./api/session.ts";

function App() {
  const { data: user, status } = useQuery(meQueryOptions);

  if (status === "pending") return "Loading…";
  if (status === "error") return "Couldn't reach the service.";
  if (!user) return <a href="/api/auth/login">Log in</a>;

  return `Signed in as ${user.email}`;
}

export default App;
