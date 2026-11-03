# AGENTS.md

Equipment Rental System (Project 2). Yarn workspaces monorepo; the two apps talk only over HTTP.

- `apps/api` — vendored backend (PJ02-EquipmentRent): Express 5 + Mongoose, CommonJS, `routes/ → controllers/ → models/`. Env in `config/config.env` (gitignored; copy from `config.env.example`). Swagger at `/api-docs`. Responses: `{ success, data }` / `{ success: false, error }`. Backend may be modified if the project needs it.
- `apps/web` — Next.js App Router + TypeScript, Tailwind 3 + shadcn/ui, Redux Toolkit (`src/store`). API calls go through `src/lib/api-client.ts`. Feature UI under `src/features/<domain>/`; `components/` is only for `ui/` primitives, guards, and app shell. Shared types: one file per resource in `src/types/`.

Commands: `yarn install`, `yarn db:up`, `yarn api:dev`, `yarn web:dev`, `yarn lint`, `yarn format:check`, `yarn web:typecheck`.
Formatting: Prettier (100 cols, double quotes, semicolons) + ESLint via husky/lint-staged; don't bypass with `--no-verify`. No test suite yet.
