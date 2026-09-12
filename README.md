# Optimus Admin — Angular 22 + Go

A working sample admin workspace built with **Angular 22.1.6**, **Optimus UI 2.0.2**, and **Go 1.27**. The layout and visual style follow the supplied [shadcn-admin](https://github.com/itsnyein/shadcn-admin) reference; the Angular/Go directory structure and API foundation follow the local `spartan-admin` project.

## Run locally

Requirements: Node 24.15+ (or a supported Angular 22 Node version), pnpm 12, and Go 1.27.1+. [Angular compatibility](https://angular.dev/reference/versions) · [Optimus installation](https://optimus.openng.org/installation)

From the project root, with [Task](https://taskfile.dev/) installed, use the same commands on Windows, macOS, and Linux:

```sh
task setup
task dev
```

Open **http://localhost:4200** and choose **Try the demo**.

You can also sign in with `admin@example.com` / `Optimus300`. New account registration creates a Viewer account; user administration requires the demo Owner account.

Without Task, use two terminals:

```sh
cd backend
go run ./cmd/server
```

```sh
cd frontend
pnpm install --frozen-lockfile
pnpm start
```

The Angular dev server proxies `/api/**` to the Go server on port 8080. `task dev` runs both servers in the current terminal; press Ctrl+C to stop development.

## Included screens

- Overview, business, and payment dashboards with an interactive revenue chart and report export
- Transactions with search, status filters, sorting, pagination, details, and status updates
- Task CRUD, filters, bulk completion, selection, and CSV export
- User directory with role/status editing and removal confirmation
- Kanban board with drag-and-drop and a keyboard-accessible status editor
- Calendar with month navigation and event CRUD
- Sample inbox, compose/reply, archive/trash, and team chat
- Profile, account preferences, appearance, and notification settings
- Optimus component gallery, searchable help, sign-in/sign-up, and error page
- Collapsible sidebar, mobile navigation, Ctrl/Cmd+K page search, local fonts, and persistent light/dark/system themes

The UI uses actual Optimus components: Button, Table, Select, Dialog, ConfirmDialog, Chart, DatePicker, InputText, Password, Textarea, Avatar, Tag, Toast, Skeleton, ToggleSwitch, Checkbox, Slider, ProgressBar, Tabs, and Accordion. Styling is a custom Aura preset with a neutral shadcn-inspired palette.

## Project layout

```text
frontend/
  src/app/core/         API client, auth, typed models, signal stores, theme
  src/app/layout/       Sidebar, header, command search
  src/app/features/     Lazy-loaded feature pages
  src/app/shared/       Page header and status tag
  e2e/                 Chromium workflow and accessibility tests
backend/
  cmd/server/          HTTP server, graceful shutdown, static SPA hosting
  internal/api/        JSON handlers, validation, session cookies, authorization
  internal/store/      Thread-safe sample data and Argon2id password hashing
Taskfile.yml           Development, build, test, preview, and Docker tasks
Dockerfile             Combined frontend/backend image
docker-compose.yml     Container runtime configuration
```

Angular uses standalone components, lazy routes, signals, `httpResource`, strict TypeScript and template checking, and reactive forms. Go uses the standard HTTP library, typed JSON, HTTP-only session cookies, origin checks, and role-based user administration.

## Production preview

```sh
task preview
```

This builds the frontend and serves the complete application at **http://localhost:8080**. `task dogfood` uses port 18080 instead.

Without Task, build the frontend first:

```sh
cd frontend
pnpm run build
cd ../backend
```

Then start the server in macOS/Linux shells:

```sh
OPTIMUS_ADMIN_WEB_ROOT=../frontend/dist/optimus-admin/browser go run ./cmd/server
```

Or in Windows PowerShell:

```powershell
$env:OPTIMUS_ADMIN_WEB_ROOT = '../frontend/dist/optimus-admin/browser'
go run ./cmd/server
```

The Go server serves assets and falls back to `index.html` for Angular deep links. `OPTIMUS_ADMIN_ADDRESS` overrides the listening address, which defaults to `:8080`.

Alternatively:

```sh
docker compose up --build
```

The final container runs as a non-root user and includes the Go binary and static frontend. It does not require Node at runtime.

## Verification

Install the test browser once, then run all checks:

```sh
task client:browsers
task verify
```

Individual checks:

```sh
cd frontend
pnpm run lint
pnpm test
pnpm run build
pnpm run test:e2e

cd ../backend
go test ./...
go vet ./...
go mod verify
```

Browser tests start their own Go server on port 18080 against the production build. Stop any existing preview on that port before testing. Tests cover registration, sign-in, role protection, themes, mobile navigation, all feature routes, axe checks in light and dark themes, CRUD, messages, settings, exports, and recovery from an API failure. Screenshots and traces are written under `frontend/test-results/`; the HTML report is under `frontend/playwright-report/`.

Responsive layout tests cover all 16 workspace routes at widths of 320, 393, 768, 900, 901, 1024, and 1440 pixels. They check page overflow, metric text and control containment, mobile dialogs, table scrolling, and sidebar state across breakpoints. After building, run them separately from `frontend` with `pnpm exec playwright test e2e/layout.spec.ts`.

## Sample behavior

Data is held in memory for the lifetime of the Go process and resets on restart. Mutations survive browser reloads. Dashboard metrics and chart history are illustrative sample data; transaction totals are computed from the sample ledger. User registration and sessions are functional, but this is a development starter, not a hardened production identity service.

Mail and chat stay in the demo store. Payment updates change the sample ledger only. No messages are delivered externally and no real payments are processed. Notification and language preferences are stored; notification delivery and translations are not connected.

For a real deployment, replace the demo store with durable storage and connect your identity, email, and payment providers. Do not expose the documented demo credentials on a production service.
