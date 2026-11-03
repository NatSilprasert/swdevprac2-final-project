# Equipment Rental System

SW Dev Prac II final project — **Project 2: Equipment Rental System**.

Monorepo (Yarn workspaces), structured after [FaFaFront/se-project](https://github.com/FaFaFront/se-project):

- **apps/web** — Next.js (App Router, TypeScript), Tailwind CSS, shadcn/ui, Redux Toolkit
- **apps/api** — Express 5 + Mongoose, vendored from
  [SWDevPrac2-69-1/PJ02-EquipmentRent](https://github.com/SWDevPrac2-69-1/PJ02-EquipmentRent)
  (Swagger docs at `/api-docs`; see `apps/api/README.md` and `apps/api/2026-PJ02.md` for the spec)
- **MongoDB** — local via Docker, or MongoDB Atlas

## Getting started

```bash
corepack enable
yarn install

# 1. database (Docker). Or use an Atlas URI and skip this.
yarn db:up

# 2. env files
cp apps/api/config/config.env.example apps/api/config/config.env   # set MONGO_URI + JWT_SECRET
cp apps/web/.env.example apps/web/.env

# 3. run (separate terminals)
yarn api:dev   # http://localhost:5000  (docs: /api-docs, health: /health)
yarn web:dev   # http://localhost:3000
```

> **macOS:** AirPlay Receiver occupies port 5000 (requests get `403` from `AirTunes`). Either turn it
> off (System Settings → General → AirDrop & Handoff → AirPlay Receiver) or set `PORT=5001` in
> `apps/api/config/config.env` and `NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1` in
> `apps/web/.env`.

## API summary (`/api/v1`)

| Area      | Endpoints                                                                                  |
| --------- | ------------------------------------------------------------------------------------------ |
| Auth      | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `GET /auth/logout`              |
| Equipment | `GET /equipment`, `GET /equipment/:id` (public); `POST`, `PUT /:id`, `DELETE /:id` (admin) |
| Rentals   | `GET /rentals`, `GET/PUT/DELETE /rentals/:id` (owner or admin); `POST /rentals` (member)   |

Envelope: success → `{ success: true, data, count? }`, failure → `{ success: false, error }`.
Auth: `Authorization: Bearer <jwt>` (token is returned in `data.token` on login/register).

Rental rules enforced by the API: start date not in the past, return date not before start,
quantity 1–3 and ≤ available, duration ≤ 7 days.

## Web structure

```
apps/web/src
├── app/                 routes (App Router)
├── components/ui/       shadcn/ui primitives (button, input, label, card)
├── components/          app shell (Navbar, ...)
├── features/<domain>/   feature UI: auth, equipment, rentals
├── store/               Redux Toolkit store, typed hooks, provider, slices/
├── lib/                 api-client (backend envelope), auth-storage, utils
└── types/               one file per resource (auth, equipment, rental)
```

- Add shadcn components: `cd apps/web && npx shadcn@latest add <component>`
- Add a Redux slice: create `store/slices/<name>Slice.ts`, register it in `store/index.ts`
- Auth state (`state.auth`) is hydrated from localStorage on mount; the JWT is attached by `lib/api-client.ts`

## Scripts

`yarn lint` · `yarn format` · `yarn format:check` · `yarn web:typecheck` · `yarn web:build` ·
`yarn db:up|stop|down`. Husky + lint-staged run ESLint/Prettier on commit. `apps/api` is vendored
backend code and is excluded from ESLint/Prettier.
