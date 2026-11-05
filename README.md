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

## Tests

Tests use [Vitest](https://vitest.dev), configured in the `test` block of `vite.config.ts`, so
they share the app's Vite setup. Put a test next to the code it covers, named `*.test.ts` or
`*.test.tsx`. Tests run in plain Node for now. Switch `environment` to `jsdom` when the first
component test needs a DOM.

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
