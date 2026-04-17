# IoT SmartLock

Web application for managing IoT smart lock devices. Built with Next.js 16, Prisma 7, and NextAuth v4.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Database ORM | Prisma 7 (multi-file schema) |
| Database | PostgreSQL 18 |
| Authentication | NextAuth v4 — credentials + Google OAuth |
| Password hashing | argon2 |
| Validation | Zod 4 |
| Styling | Tailwind CSS 4 |
| DB adapter | `@prisma/adapter-pg` (connection pooling) |

---

## Prerequisites

- Node.js 20+
- npm 10+
- Docker + Docker Compose (local development)
- A Supabase project (production) — or keep Docker for production too

---

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/DanMullerCZ/iot_smartlock.git
cd iot_smartlock
npm ci
```

### 2. Start local PostgreSQL

The project ships a Docker Compose file that starts a PostgreSQL 18 container on port **5431** (avoids conflicting with any local Postgres on 5432).

```bash
docker compose -f local-db/docker-compose.postgres.yml up -d
```

Container details:

| Setting | Value |
|---|---|
| Host | `localhost:5431` |
| Database | `smartlock_local` |
| User | `admin` |
| Password | `admin` |

### 3. Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```env
# Generate a secret: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Local Docker Postgres (both point to the same instance in dev)
DATABASE_URL="postgresql://admin:admin@localhost:5431/smartlock_local"
DATABASE_DIRECT_URL="postgresql://admin:admin@localhost:5431/smartlock_local"
```

`DATABASE_URL` is used by the Prisma client at runtime.  
`DATABASE_DIRECT_URL` is used by `prisma migrate` via `prisma.config.ts` — it bypasses the connection pooler, which is required for DDL commands. In local dev both variables are identical.

### 4. Run database migrations

```bash
npm run db:migrate
```

This runs `prisma migrate dev`, which applies pending migrations and generates the Prisma client into `generated/prisma/`.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## npm Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Generate Prisma client, then build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Regenerate Prisma client from schema (no migration) |
| `npm run db:migrate` | Create + apply a new migration (dev only) |
| `npm run db:migrate:deploy` | Apply pending migrations (production / CI) |
| `npm run db:push` | Push schema changes without a migration file (prototyping only) |
| `npm run db:studio` | Open Prisma Studio at http://localhost:5555 |

---

## Database Schema

Prisma uses a **multi-file schema** under `prisma/schema/`:

```
prisma/
  schema/
    base.prisma     ← generator + datasource
    user.prisma     ← User model, Role enum, Status enum
  migrations/       ← migration history
```

Adding a new model: create `prisma/schema/<model>.prisma` and run `npm run db:migrate`.

### User model summary

| Column | Type | Notes |
|---|---|---|
| `id` | `Int` PK | Internal numeric ID |
| `uuid` | `UUID` | Public-facing identifier, unique index |
| `email` | `VARCHAR(254)` | Unique, RFC 5321 max length |
| `name` | `VARCHAR(100)` | Display name |
| `password` | `VARCHAR(255)?` | argon2id hash; `null` for OAuth-only accounts |
| `role` | `Role` enum | `USER` / `ADMIN` / `SUPER_ADMIN` |
| `status` | `Status` enum | `NOT_VERIFIED` / `ACTIVE` / `DISABLED` |
| `createdAt` | `DateTime` | Indexed for pagination |
| `deletedAt` | `DateTime?` | Soft delete; indexed + composite index with `status` |

`updatedAt` is managed automatically by Prisma on every update.

---

## Authentication

### Login flow

Password is never sent in a request body. All credential endpoints use HTTP Basic Auth (`Authorization: Basic base64(email:password)`).

```
Login form
  → POST /api/auth/login        (Basic Auth header)
      • Looks up user by email
      • Verifies argon2 hash
      • Returns short-lived HMAC token (30 s TTL)
  → signIn("credentials", { token, ... })
      • NextAuth authorize() verifies HMAC — no DB call
      • Sets encrypted JWT session cookie
  → redirect /dashboard
```

### Registration flow

```
Register form
  → POST /api/users             (Basic Auth header)
      • Decodes email + password from header
      • Validates with Zod (name in body, email + password from header)
      • Hashes password with argon2id
      • Creates User row (status: NOT_VERIFIED)
  → redirect /login
```

### Google OAuth

Configured via `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (optional). OAuth users have `password: null`.

---

## API Reference

### Public endpoints (no auth required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Server + DB health check |
| `POST` | `/api/auth/login` | Credential verification (Basic Auth) |
| `POST` | `/api/users` | Register new user (Basic Auth) |
| `ALL` | `/api/auth/*` | NextAuth internal routes |

### Protected endpoints (NextAuth JWT required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/devices` | List devices |
| `GET` | `/api/devices/[id]` | Get device by ID |

All unrecognised `/api/*` routes without a valid session cookie return:

```json
{ "error": "Unauthorized" }
```

with HTTP `401`.

### Health check response

**200 OK**
```json
{ "status": "ok", "db": "ok" }
```

**503 Service Unavailable**
```json
{ "status": "degraded", "db": "error" }
```

---

## Middleware & Proxy

`proxy.ts` at the project root enforces authentication on every request before it reaches a route handler. Route tiers:

| Tier | Paths | Rule |
|---|---|---|
| Public pages | `/`, `/login`, `/register` | Pass through |
| Public API | `/api/auth/*`, `/api/health`, `/api/users` | Pass through |
| Protected | Everything else | Valid NextAuth JWT required |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXTAUTH_SECRET` | Yes | JWT signing secret. Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Full base URL of the app (`http://localhost:3000` in dev) |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma client at runtime |
| `DATABASE_DIRECT_URL` | Yes | Direct (non-pooled) connection used by `prisma migrate` |
| `GOOGLE_CLIENT_ID` | No | Google OAuth app client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth app client secret |

---

## Project Structure

```
.
├── app/
│   ├── (auth)/               # Login + register pages (unauthenticated layout)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/          # Protected pages (authenticated layout + header)
│   │   └── dashboard/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts   # NextAuth handler
│   │   │   └── login/route.ts           # Credential verification (Basic Auth)
│   │   ├── health/route.ts
│   │   └── users/route.ts               # Registration
│   └── layout.tsx
├── components/
│   ├── auth/SessionProvider.tsx
│   └── layout/LogoutButton.tsx
├── lib/
│   ├── api/
│   │   └── users.ts                     # createUser — hashes password, writes to DB
│   ├── auth/
│   │   ├── auth.ts                      # NextAuth options
│   │   └── providers/
│   │       ├── credential.ts            # HMAC token-based credentials provider
│   │       └── google.ts
│   ├── db.ts                            # Prisma client singleton (PrismaPg adapter)
│   ├── env.ts                           # Type-safe env vars (t3-env)
│   └── validations/
│       └── user.ts                      # Zod schemas
├── prisma/
│   ├── schema/
│   │   ├── base.prisma
│   │   └── user.prisma
│   └── migrations/
├── proxy.ts                             # Auth enforcement (Edge runtime)
├── prisma.config.ts                     # Prisma CLI config (migration URLs)
└── local-db/
    └── docker-compose.postgres.yml
```