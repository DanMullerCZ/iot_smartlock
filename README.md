# IoT SmartLock

Web application for managing IoT smart lock devices. Built with Next.js 16, Prisma 7, and NextAuth v4.

## Tech Stack

| Layer            | Technology                                |
| ---------------- | ----------------------------------------- |
| Framework        | Next.js 16 (App Router)                   |
| Language         | TypeScript 5                              |
| Database ORM     | Prisma 7 (multi-file schema)              |
| Database         | PostgreSQL 18                             |
| Authentication   | NextAuth v4 — credentials + Google OAuth  |
| Password hashing | argon2                                    |
| Validation       | Zod 4                                     |
| Styling          | Tailwind CSS 4                            |
| DB adapter       | `@prisma/adapter-pg` (connection pooling) |
| API docs         | OpenAPI 3.0 via `@asteasolutions/zod-to-openapi` + Swagger UI |

---

## Prerequisites

- Node.js 20+
- npm 10+
- Docker + Docker Compose (local development)

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

| Setting  | Value             |
| -------- | ----------------- |
| Host     | `localhost:5431`  |
| Database | `smartlock_local` |
| User     | `admin`           |
| Password | `admin`           |

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

# Optional — enables Google OAuth sign-in
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
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

| Script                      | What it does                                                    |
| --------------------------- | --------------------------------------------------------------- |
| `npm run dev`               | Start Next.js dev server                                        |
| `npm run build`             | Generate Prisma client, then build for production               |
| `npm run start`             | Start production server                                         |
| `npm run lint`              | Run ESLint                                                      |
| `npm run db:generate`       | Regenerate Prisma client from schema (no migration)             |
| `npm run db:migrate`        | Create + apply a new migration (dev only)                       |
| `npm run db:migrate:deploy` | Apply pending migrations (production / CI)                      |
| `npm run db:push`           | Push schema changes without a migration file (prototyping only) |
| `npm run db:studio`         | Open Prisma Studio at http://localhost:5555                     |

---

## Database Schema

Prisma uses a **multi-file schema** under `prisma/schema/`:

```
prisma/
  schema/
    base.prisma               ← generator + datasource
    user.prisma               ← User, Role enum, Status enum
    room.prisma               ← Room
    access-card.prisma        ← AccessCard
    access-permission.prisma  ← AccessPermission
    access-request.prisma     ← AccessRequest (BigInt PK)
    access-result.prisma      ← AccessResult (BigInt PK)
  migrations/
```

Adding a new model: create `prisma/schema/<model>.prisma` and run `npm run db:migrate`.

### User

| Column      | Type            | Notes                                                |
| ----------- | --------------- | ---------------------------------------------------- |
| `id`        | `Int` PK        | Internal numeric ID                                  |
| `uuid`      | `UUID`          | Public-facing identifier, unique index               |
| `email`     | `VARCHAR(254)`  | Unique, RFC 5321 max length                          |
| `name`      | `VARCHAR(100)`  | Display name                                         |
| `password`  | `VARCHAR(255)?` | argon2id hash; `null` for OAuth-only accounts        |
| `role`      | `Role` enum     | `USER` / `ADMIN` / `SUPER_ADMIN`                     |
| `status`    | `Status` enum   | `NOT_VERIFIED` / `ACTIVE` / `DISABLED`               |
| `createdAt` | `DateTime`      | Indexed for pagination                               |
| `deletedAt` | `DateTime?`     | Soft delete; indexed + composite index with `status` |

### Room

| Column        | Type           | Notes                                    |
| ------------- | -------------- | ---------------------------------------- |
| `id`          | `Int` PK       |                                          |
| `uuid`        | `UUID`         | Public identifier                        |
| `name`        | `VARCHAR(100)` |                                          |
| `location`    | `TEXT?`        |                                          |
| `description` | `TEXT?`        |                                          |
| `status`      | `RoomStatus`   | `ACTIVE` / `BLOCKED` / `DISABLED`        |
| `deletedAt`   | `DateTime?`    | Soft delete                              |

### AccessCard

| Column       | Type           | Notes                                            |
| ------------ | -------------- | ------------------------------------------------ |
| `id`         | `Int` PK       |                                                  |
| `uuid`       | `UUID`         |                                                  |
| `code`       | `VARCHAR(128)` | Unique RFID/NFC code                             |
| `type`       | `CardType`     | `RFID`                                           |
| `status`     | `CardStatus`   | `ACTIVE` / `DISABLED`                            |
| `userId`     | `Int?` FK      | Owning user; `null` = unassigned                 |
| `assignedAt` | `DateTime?`    | When the card was last assigned                  |
| `deletedAt`  | `DateTime?`    | Soft delete                                      |

### AccessPermission

| Column     | Type                    | Notes                                              |
| ---------- | ----------------------- | -------------------------------------------------- |
| `id`       | `Int` PK                |                                                    |
| `userId`   | `Int` FK                |                                                    |
| `roomId`   | `Int` FK                |                                                    |
| `status`   | `PermissionStatus`      | `ACTIVE` / `SUSPENDED` / `EXPIRED`                 |
| `from`     | `DateTime?`             | Permission valid from                              |
| `to`       | `DateTime?`             | Permission valid until                             |
| `deletedAt`| `DateTime?`             | Soft delete                                        |

### AccessRequest / AccessResult

High-volume tables — use **BigInt** primary keys to avoid 32-bit overflow. `AccessResult` is a 1:1 with `AccessRequest` (written after the door controller responds). BigInt values are serialised as decimal strings in all API responses.

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

Sign-in and sign-up pages both have a "Continue / Sign up with Google" button. On first Google login the user is created automatically with `status: ACTIVE`. On subsequent logins the existing row is reused — no duplicate is created. Disabled (`DISABLED`) or deleted accounts are blocked even via Google.

Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in env. Add `<NEXTAUTH_URL>/api/auth/callback/google` to the Authorized Redirect URIs in Google Cloud Console.

---

## API Reference

### Public endpoints (no auth required)

| Method | Path              | Description                                  |
| ------ | ----------------- | -------------------------------------------- |
| `GET`  | `/api/health`     | Server + DB health check                     |
| `POST` | `/api/auth/login` | Credential verification (Basic Auth)         |
| `POST` | `/api/users`      | Register new user (Basic Auth)               |
| `ALL`  | `/api/auth/*`     | NextAuth internal routes (OAuth callbacks)   |
| `GET`  | `/api/docs`       | OpenAPI 3.0 JSON spec (machine-readable)     |

### Admin endpoints (SUPER_ADMIN JWT required)

All paths are under `/api/admin/`. Every list endpoint is paginated (`page`, `limit` query params).

| Method   | Path                              | Description                        |
| -------- | --------------------------------- | ---------------------------------- |
| `GET`    | `/api/admin/users`                | List users (filters: role, status) |
| `POST`   | `/api/admin/users`                | Create user                        |
| `GET`    | `/api/admin/users/[id]`           | Get user by ID                     |
| `PATCH`  | `/api/admin/users/[id]`           | Update user                        |
| `DELETE` | `/api/admin/users/[id]`           | Soft-delete user                   |
| `GET`    | `/api/admin/rooms`                | List rooms                         |
| `POST`   | `/api/admin/rooms`                | Create room                        |
| `GET`    | `/api/admin/rooms/[id]`           | Get room by ID                     |
| `PATCH`  | `/api/admin/rooms/[id]`           | Update room                        |
| `DELETE` | `/api/admin/rooms/[id]`           | Soft-delete room                   |
| `GET`    | `/api/admin/access-cards`         | List access cards                  |
| `POST`   | `/api/admin/access-cards`         | Create access card                 |
| `GET`    | `/api/admin/access-cards/[id]`    | Get card by ID                     |
| `PATCH`  | `/api/admin/access-cards/[id]`    | Update card                        |
| `DELETE` | `/api/admin/access-cards/[id]`    | Soft-delete card                   |
| `GET`    | `/api/admin/access-permissions`   | List permissions                   |
| `POST`   | `/api/admin/access-permissions`   | Create permission                  |
| `GET`    | `/api/admin/access-permissions/[id]` | Get permission by ID            |
| `PATCH`  | `/api/admin/access-permissions/[id]` | Update permission               |
| `DELETE` | `/api/admin/access-permissions/[id]` | Soft-delete permission          |
| `GET`    | `/api/admin/access-requests`      | List access requests (read-only)   |
| `GET`    | `/api/admin/access-requests/[id]` | Get request by BigInt ID           |
| `GET`    | `/api/admin/access-results`       | List access results (read-only)    |
| `GET`    | `/api/admin/access-results/[id]`  | Get result by BigInt ID            |

All unrecognised `/api/*` routes without a valid session cookie return:

```json
{ "error": "Unauthorized" }
```

with HTTP `401`.

---

## API Documentation (Swagger UI)

Interactive docs are available at `/docs`. The JSON spec is at `/api/docs`.

**Auth flow in Swagger UI:**
1. Expand `POST /api/auth/login`, click **Try it out**, enter credentials under the BasicAuth scheme
2. Copy the `token` from the response
3. Click **Authorize** at the top and paste the token under **BearerAuth**
4. All `/api/admin/*` requests now include `Authorization: Bearer <token>`

The spec is generated at runtime from Zod schemas via `@asteasolutions/zod-to-openapi`. All schemas are created inside `getOpenApiSpec()` — after `extendZodWithOpenApi(z)` runs — to avoid a Zod 4 production incompatibility where the `.openapi()` method is not retroactively added to pre-existing schema instances.

---

## Middleware & Proxy

`proxy.ts` at the project root enforces authentication on every request before it reaches a route handler. Route tiers:

| Tier         | Paths                                                           | Rule                             |
| ------------ | --------------------------------------------------------------- | -------------------------------- |
| Public pages | `/`, `/login`, `/register`                                      | Pass through                     |
| Public API   | `/api/auth/*`, `/api/health`, `/api/users`, `/api/docs`         | Pass through                     |
| Protected    | Everything else                                                 | Valid NextAuth JWT required      |
| Admin API    | `/api/admin/*`                                                  | JWT + `SUPER_ADMIN` role required |

---

## Environment Variables

| Variable               | Required | Description                                                   |
| ---------------------- | -------- | ------------------------------------------------------------- |
| `NEXTAUTH_SECRET`      | Yes      | JWT signing secret. Generate: `openssl rand -base64 32`       |
| `NEXTAUTH_URL`         | Yes      | Full base URL of the app (`http://localhost:3000` in dev)     |
| `DATABASE_URL`         | Yes      | PostgreSQL connection string used by Prisma client at runtime |
| `DATABASE_DIRECT_URL`  | Yes      | Direct (non-pooled) connection used by `prisma migrate`       |
| `GOOGLE_CLIENT_ID`     | No       | Google OAuth app client ID                                    |
| `GOOGLE_CLIENT_SECRET` | No       | Google OAuth app client secret                                |

---

## Project Structure

```
.
├── app/
│   ├── (auth)/                         # Unauthenticated layout
│   │   ├── login/page.tsx              # Credentials + Google sign-in
│   │   └── register/page.tsx           # Credentials + Google sign-up
│   ├── (dashboard)/                    # Protected layout
│   │   └── dashboard/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │   │   └── login/route.ts          # Credential verification (Basic Auth)
│   │   ├── admin/
│   │   │   ├── users/[id]/route.ts
│   │   │   ├── users/route.ts
│   │   │   ├── rooms/[id]/route.ts
│   │   │   ├── rooms/route.ts
│   │   │   ├── access-cards/[id]/route.ts
│   │   │   ├── access-cards/route.ts
│   │   │   ├── access-permissions/[id]/route.ts
│   │   │   ├── access-permissions/route.ts
│   │   │   ├── access-requests/[id]/route.ts
│   │   │   ├── access-requests/route.ts
│   │   │   ├── access-results/[id]/route.ts
│   │   │   └── access-results/route.ts
│   │   ├── docs/route.ts               # GET → OpenAPI JSON spec (public)
│   │   ├── health/route.ts
│   │   └── users/route.ts              # Registration
│   ├── docs/
│   │   ├── page.tsx                    # Swagger UI page (auth-protected)
│   │   └── SwaggerUI.tsx               # "use client" wrapper for swagger-ui-react
│   └── layout.tsx
├── components/
│   ├── auth/SessionProvider.tsx
│   └── layout/LogoutButton.tsx
├── hooks/
│   ├── useDevice.ts
│   └── useSession.ts
├── lib/
│   ├── api/
│   │   ├── devices.ts
│   │   └── users.ts                    # createUser — hashes password, writes to DB
│   ├── auth/
│   │   ├── auth.ts                     # NextAuth options (JWT, callbacks, providers)
│   │   └── providers/
│   │       ├── credential.ts           # HMAC token-based credentials provider
│   │       └── google.ts
│   ├── openapi/
│   │   ├── parameters.ts               # Reusable query/path param factory
│   │   ├── schemas.ts                  # Request + response schema factory
│   │   └── spec.ts                     # Registers all paths, exports getOpenApiSpec()
│   ├── db.ts                           # Prisma client singleton (PrismaPg adapter)
│   ├── env.ts                          # Type-safe env vars (t3-env)
│   └── validations/
│       ├── access-card.ts
│       ├── access-permission.ts
│       ├── room.ts
│       └── user.ts
├── prisma/
│   ├── schema/
│   │   ├── base.prisma
│   │   ├── user.prisma
│   │   ├── room.prisma
│   │   ├── access-card.prisma
│   │   ├── access-permission.prisma
│   │   ├── access-request.prisma
│   │   └── access-result.prisma
│   └── migrations/
├── types/
│   ├── auth.d.ts                       # NextAuth type augmentations
│   └── device.ts
├── proxy.ts                            # Auth enforcement (Edge runtime)
├── prisma.config.ts                    # Prisma CLI config (migration URLs)
└── local-db/
    └── docker-compose.postgres.yml
```
