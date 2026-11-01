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

To regenerate after the spec changes, from the service repo:

```bash
npm run generate:client -- ../client/src/api/generated
```

The folder is excluded from oxlint and oxfmt, and it is its own TypeScript project
(`tsconfig.api.json`) without the strict unused-code and erasable-syntax checks that the
rest of the client uses, because the generator's output doesn't follow them. Your own code
keeps every check.

## Scripts

| Script            | What it does                            |
| ----------------- | --------------------------------------- |
| `npm run dev`     | Start Vite with hot reload on port 5173 |
| `npm run build`   | Type check and build to `dist/`         |
| `npm run preview` | Serve the built `dist/` locally         |
| `npm run lint`    | Lint with oxlint                        |
| `npm run fmt`     | Format with oxfmt                       |
