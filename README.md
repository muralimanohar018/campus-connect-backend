# Campus Connect — Backend (Foundation)

Node.js + Express + TypeScript + Prisma + PostgreSQL foundation for the
Campus Connect coding-club platform. This is the **foundation only** —
Events, Certificates, Attendance, Leaderboards and Announcements business
logic are intentionally not implemented; their tables already exist in the
schema so feature prompts can build directly on top of this.

## Architecture

```
Routes → Controllers → Services → Repositories → Prisma → PostgreSQL
```

- **Routes** — define endpoints + attach validators/middleware only.
- **Controllers** — translate HTTP ⇄ service calls. No business logic.
- **Services** — all business logic lives here.
- **Repositories** — the only layer that talks to Prisma directly.

## Folder Structure

```
src/
  config/        env, database, logger, cloudinary, swagger
  routes/        versioned routes (/api/v1/...)
  controllers/   HTTP request/response handlers
  services/      business logic
  repositories/  Prisma data-access layer
  middleware/    auth, rbac, error handling, validation, logging
  validators/    express-validator chains
  utils/         ApiResponse, AppError, asyncHandler, JWT helpers
prisma/
  schema.prisma  full DB schema (foundation + feature tables)
  seed.ts        roles + super-admin seed data
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# edit .env with your DATABASE_URL and JWT secrets
```

### 3. Start PostgreSQL

Easiest with Docker:

```bash
docker compose up -d postgres
```

Or point `DATABASE_URL` at your own Postgres/Supabase instance.

### 4. Generate Prisma client & run migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

> **Note:** `prisma generate` downloads a query-engine binary from
> `binaries.prisma.sh` the first time. This requires outbound network
> access — it could not be run inside the sandboxed environment this
> project was scaffolded in (that network only allowlists npm/GitHub/
> PyPI domains), but works normally on your machine, CI, or Railway/Render.
> Everything else in this backend has been installed and type-checked
> successfully.

### 5. Run the dev server

```bash
npm run dev
```

- API base: `http://localhost:4000/api/v1`
- Swagger docs: `http://localhost:4000/docs`
- Health check: `http://localhost:4000/api/v1/health`

### 6. Build for production

```bash
npm run build
npm start
```

### 7. Docker (full stack)

```bash
docker compose up --build
```

## Authentication

- `POST /api/v1/auth/register` — create account (default role: `STUDENT`)
- `POST /api/v1/auth/login` — returns access + refresh token pair
- `POST /api/v1/auth/refresh` — rotates refresh token
- `POST /api/v1/auth/logout` — revokes a refresh token
- `GET  /api/v1/auth/me` — current user profile (requires `Authorization: Bearer <accessToken>`)

Role-based access control is available via the `authorize('ADMIN', 'CORE_TEAM')`
middleware, used after `authenticate`.

## Response Format

Every endpoint returns:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": { "...": "..." },
  "pagination": null,
  "timestamp": "2026-07-18T00:00:00.000Z"
}
```

## Database Schema

Tables included: `users`, `roles`, `user_roles`, `refresh_tokens`, `events`,
`registrations`, `attendance`, `certificates`, `announcements`,
`notifications`, `gallery`, `badges`, `user_badges`, `leaderboard_entries`,
`audit_logs`. See `prisma/schema.prisma` for full relationships, indexes,
and constraints.

## Adding a New Feature Module

Example: "Build the Event Module"

1. Add validators in `src/validators/event.validator.ts`
2. Add repository methods in `src/repositories/event.repository.ts`
3. Add business logic in `src/services/event.service.ts`
4. Add HTTP handlers in `src/controllers/event.controller.ts`
5. Add routes in `src/routes/v1/event.routes.ts`
6. Register the router in `src/routes/v1/index.ts`

No existing file needs to change beyond that last registration step.
