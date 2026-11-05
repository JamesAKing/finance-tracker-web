# Finance Tracker Web

React 19 + TypeScript client, built with Vite. The browser only ever talks to this origin
(`http://localhost:5173`); requests to `/api` are forwarded to the service, so the session
cookie stays first-party.

## Prerequisites

- Node 24+
- The identity and service repos running (see their READMEs)

## Run with Vite (day-to-day development)

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local env file:

   ```bash
   cp .env.example .env
   ```

   `SERVICE_PORT` is the port the service listens on (default `3000`).

3. Start the dev server:

   ```bash
   npm run dev
   ```

Vite serves the app on `http://localhost:5173` and proxies `/api` to
`http://localhost:${SERVICE_PORT}` (see `vite.config.ts`).

## Run in Docker

The image builds the app and serves the static files with nginx. nginx also does the job
Vite's proxy does in development: it forwards `/api` to the service.

1. Start identity, then the service in Docker (`docker compose --profile app up -d` in the
   service repo). Identity creates the shared `finance-tracker` network the containers use
   to reach each other.
2. Build and start the client:

   ```bash
   docker compose up -d --build
   ```

3. Open `http://localhost:5173`.

Stop `npm run dev` first: both use port 5173.

### How nginx is set up

`nginx/default.conf.template` is the whole config. The official nginx image fills in
`${API_UPSTREAM}` from the environment when the container starts.

- `location /api/` forwards to `API_UPSTREAM` (`http://finance-tracker-service:3000`, set
  in `docker-compose.yml`), passing on the original host and protocol.
- `location /` serves the built files, and falls back to `index.html` for any path that
  isn't a file, so client-side routes survive a page reload.

## API client

`src/api/generated/` is generated from the service's `openapi.yaml`, which is the source of
truth for the API. Don't edit it by hand, and don't map the UI to its models directly: shape
the UI around what users need, and map to and from the API models at the edge.

To regenerate after the spec changes, from the service repo (needs Docker):

```bash
npm run generate:client -- ../finance-tracker-web/src/api/generated
```

The folder is excluded from oxlint and oxfmt, and it is its own TypeScript project
(`tsconfig.api.json`) without the strict unused-code and erasable-syntax checks that the
rest of the client uses, because the generator's output doesn't follow them. Your own code
keeps every check.

### Calling the API

Don't create API classes from `src/api/generated/` directly. Use the ones in `src/api/`:

| File               | What it holds                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------- |
| `configuration.ts` | Shared settings: base path `/api`, and same-origin credentials so the session cookie is sent |
| `client.ts`        | `authApi` and `healthApi`, ready to use                                                      |
| `query-client.ts`  | The one TanStack Query `QueryClient`, shared by React and the API layer                      |
| `csrf.ts`          | `csrfQueryOptions`, `useCsrfToken()` and the CSRF middleware                                 |
| `session.ts`       | `meQueryOptions`: the signed-in `User`, or `null` when there is no session (401)             |

Server data lives in TanStack Query. Read it with `useQuery(meQueryOptions)` and similar,
rather than copying it into React state.

### CSRF

The service rejects a `POST`, `PUT`, `PATCH` or `DELETE` without a CSRF token. The middleware
in `csrf.ts` handles this for every call made through `client.ts`. It fetches the token from
`/api/auth/csrf` once, caches it, and adds the `X-CSRF-Token` header. Feature code never
handles the token.

The token is cached for the life of the page. That's safe because signing in and out are
full-page navigations, which start with an empty cache. `useCsrfToken()` is for the rare case
that needs the token itself, such as the logout form.

## Auth flow

The service and Keycloak handle all sign-in redirects. The browser never gets a token. It only
has the service's `__Host-session` cookie, which JavaScript can't read.

1. All pages except `/login-failed` are inside the `_authenticated` route. Before a page
   loads, it gets the current user from `/api/auth/me` (`src/session/authenticate.ts`).
2. If there is no session (401), the browser goes to `/api/auth/login`. This must be a page
   navigation, not `fetch`, because the service redirects to the Keycloak login page.
   Users register and reset passwords on that page.
3. After login, Keycloak sends the browser to `/api/auth/callback`. The service sets the
   session cookie and redirects to `/`.
4. When signed in, `SessionProvider` gives the user to the pages below it. `useSession()`
   returns `{ user }`, and `user` is never null.
5. To log out, `LogoutButton` submits an HTML form to `/api/auth/logout` with the CSRF token
   in the `_csrf` field. It is a form, not `fetch`, because the service redirects through
   Keycloak's logout and back to the app.

### Errors

| Case                                          | What the user sees                                                         |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| Login failed (service sends `/?login=failed`) | `/login-failed` with a "Try again" link. No automatic redirect, so no loop |
| `/api/auth/me` fails in another way           | "Something went wrong" with a "Try again" button                           |
| Unknown path                                  | "Page not found"                                                           |

## Routes

Each route is a file in `src/routes/` (TanStack Router, file-based routing). The Vite plugin
creates `src/routeTree.gen.ts` from these files when you run `npm run dev` or
`npm run build`. Commit this file, but don't edit it. oxlint and oxfmt skip it.

- `__root.tsx`: wraps all pages. Shows "Page not found" for unknown paths.
- `_authenticated.tsx`: checks that the user is signed in. The `_` prefix means it has no URL
  path, so it protects all routes in `_authenticated/`.
- `_authenticated/index.tsx`: the `/` page.
- `login-failed.tsx`: the `/login-failed` page. This is the only public page.

To add a protected page, add a file to `src/routes/_authenticated/`.

The `react/only-export-components` lint rule is off for `src/routes/`. Route files must
export a `Route` object as well as components. The router plugin moves the components into
separate modules, so fast refresh still works.

## Tests

Tests use [Vitest](https://vitest.dev), configured in the `test` block of `vite.config.ts`, so
they share the app's Vite setup. Put a test next to the code it covers, named `*.test.ts` or
`*.test.tsx`. Tests run in jsdom, so components can be rendered with React Testing Library.

CI (`.github/workflows/ci.yml`) runs lint, format check, type check and build, and the tests on
every pull request and on pushes to `master`.

## Scripts

| Script               | What it does                            |
| -------------------- | --------------------------------------- |
| `npm run dev`        | Start Vite with hot reload on port 5173 |
| `npm run build`      | Type check and build to `dist/`         |
| `npm run preview`    | Serve the built `dist/` locally         |
| `npm test`           | Run the tests once                      |
| `npm run test:watch` | Run the tests, re-running on change     |
| `npm run lint`       | Lint with oxlint                        |
| `npm run fmt`        | Format with oxfmt                       |
