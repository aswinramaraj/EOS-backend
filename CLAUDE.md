# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

EOS Backend is a NestJS API for a college ERP system ("EOS" — school/college management). It's a modular monolith: one Nest module per business domain (admissions, faculty, exams, fees-billing, library, placement, procurement, venues, academic-structure, announcements, notifications, feedback), each owned independently by a team member, all wired into `src/app.module.ts`. Data access goes through a single Prisma schema (`prisma/schema.prisma`, ~1700 lines) covering the whole ERP domain.

## Commands

```bash
# Install & DB setup
npm install
npx prisma generate          # regenerate the Prisma client after any schema.prisma change — output goes to generated/prisma
npx prisma studio             # visual DB browser
npm run seed                  # tsx prisma/seed.ts

# Run
npm run start:dev             # hot-reload dev server (swc-based), http://localhost:3000/api/v1
npm run build                 # nest build
npm run start:prod            # run compiled dist/main

# Lint / format
npm run lint                  # eslint --fix over src, apps, libs, test
npm run format                 # prettier --write src/**/*.ts test/**/*.ts

# Tests
npm run test                  # unit tests (*.spec.ts), jest config lives inline in package.json
npm run test -- books.service.spec.ts     # run a single unit test file
npm run test -- -t "should create a book" # run tests matching a name
npm run test:watch
npm run test:cov
npm run test:e2e              # e2e tests (*.e2e-spec.ts), separate config: test/jest-e2e.json
```

There is no separate typecheck script; use `npx tsc --noEmit` if you need to verify types without emitting.

## Architecture

### Request pipeline (`src/main.ts`)
Global prefix `api/v1`, CORS from `ALLOWED_ORIGINS`, a global `ValidationPipe` (`src/common/pipes/validation.pipe.ts`), a global `HttpExceptionFilter`, and global `LoggingInterceptor` + `TransformInterceptor`. A global `ThrottlerGuard` (100 req/60s by default) is registered in `app.module.ts` via `APP_GUARD`.

Every 2xx response is auto-wrapped by `TransformInterceptor` into `{ success, message, data, timestamp }`; errors come out of `HttpExceptionFilter` as `{ success: false, statusCode, message, timestamp, path }`. Don't hand-wrap responses in controllers/services — return plain data/DTOs and let the interceptor do it.

### `src/common/` — shared, import don't duplicate
Barrel-exported from `src/common/index.ts`: `ROLES` constant, `ApiResponse<T>`, `PaginationDto` + `paginate()` helper, the exception filter, interceptors, and the global validation pipe. New cross-module utilities belong here, not copy-pasted into a feature module.

### Auth & RBAC (`src/auth/`)
JWT-based (`passport-jwt`). Guard a route with both guards and restrict by role:
```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.LIBRARY, ROLES.ADMIN)   // or role literals like 'library' — both styles exist in the codebase
```
`RolesGuard` reads roles set by `@Roles()` from the reflector; a route with no `@Roles()` is open to any authenticated user. `@CurrentUser()` decorator pulls the `JwtPayload` (`{ userId, role, ... }`) off the request. Roles are the strings in `src/common/constants/roles.constant.ts` (`ROLES.ADMIN`, `HOD`, `FACULTY`, `STUDENT`, `PARENT`, `COE`, `PLACEMENT`, `LIBRARY`, `BILLING`, `HR_PAYROLL`, `FINANCE`, `IQAC`, `SECRETARY`, `GATE_WARDEN`, `MEDIA_ROOM`, `ACADEMIC_COORDINATOR`).

### Data layer (`src/prisma/`, `prisma/schema.prisma`)
`PrismaService` extends the generated `PrismaClient` using the `@prisma/adapter-pg` driver adapter over `DATABASE_URL` (Supabase Postgres). The client is generated as an **ESM module** into `generated/prisma` (gitignored, regenerate with `npx prisma generate` — do this after pulling schema changes). Feature modules just import `PrismaModule` and inject `PrismaService`.

**Supabase connection pool is small** — the pooler caps out at `pool_size: 15` concurrent connections for the whole team's shared project. One-off diagnostic scripts (e.g. ad-hoc `PrismaClient` scripts to count rows) can exhaust it (`EMAXCONNSESSION: max clients reached in session mode`), which then makes unrelated requests on the actual running dev server fail too. Prefer `npx prisma studio` or a single sequential-query script over firing several concurrent ad-hoc connections, and always let scripts `$disconnect()`.

**Schema gotcha — `students` has no name fields.** `first_name`/`last_name` live on `faculty` and `soa_applications`, *not* on `students` directly (`students.soa_application_id` is an optional FK to `soa_applications`, where the original admission-application name was captured). Selecting `students.first_name` throws a `PrismaClientValidationError` at runtime (a NestJS 500, since it isn't a `HttpException`) rather than a compile-time error. To get a student's display name, include the nested relation: `students: { select: { ..., soa_applications: { select: { first_name, last_name } } } }`, and handle `soa_applications` being `null` (a student with no linked application has no name available this way).

**Important test gotcha:** because the generated Prisma client uses `import.meta`, it cannot be parsed by the plain (CommonJS) `ts-jest` config that `*.spec.ts` unit tests run under (`rootDir: src` config in `package.json`). Any unit test that transitively imports the real `PrismaService` will fail with a `SyntaxError: Cannot use 'import.meta'`. Always mock it at the top of the spec file instead of letting it resolve for real:
```ts
jest.mock('src/prisma/prisma.service', () => ({ PrismaService: jest.fn() }));
```
(see `books.service.spec.ts` for the full pattern, including a `mockPrismaService` object passed via `useValue`). If a service mixes `prisma.$transaction(async (tx) => ...)` (interactive/callback form) with `prisma.$transaction([...])` (batch/array form) — as `borrow-records.service.ts` does — mock `$transaction` to handle both by branching on `typeof arg === 'function'` and invoking it with the same mock instance as `tx` (see `borrow-records.service.spec.ts`). E2E tests don't have this problem — `test/jest-e2e.json` runs ts-jest in `useESM: true` mode and boots the real app via `test/utils/bootstrap-test-app.ts` (which mirrors `main.ts`'s pipes/filters/interceptors manually — keep the two in sync if either changes).

### Scaffold-only modules (not yet implemented)
Most modules outside `library/` (e.g. `admissions/students`, `faculty/faculty`, and others still owned by other team members per `TEAM_SETUP.md`) are still the raw `nest g resource` scaffold: their controllers have no guards, and their services' `create`/`findAll`/`findOne`/`update`/`remove` just return literal template strings (`` `This action returns all students` ``) instead of calling Prisma. Don't assume `GET /students`, `GET /faculty`, etc. hit the database or return real records — check the specific service file before relying on one as a data source (e.g. for looking up a valid `student_id`/`faculty_id` to use elsewhere, go through `prisma/schema.prisma` + `npx prisma studio` instead). `src/modules/library/*` is the one domain that's actually been built out this session.

### Feature module conventions
Every module under `src/modules/<domain>/<resource>/` follows the same Nest-CLI-generated shape: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/create-*.dto.ts` + `dto/update-*.dto.ts` (usually `PartialType(Create...)`) + `dto/search-*.dto.ts` for list filters, and an `entities/*.entity.ts` (typically unused placeholder). Look at `src/modules/library/books/` as the most complete reference implementation for this pattern:
- `findAll` takes a search DTO with optional filters + `page`/`page_size` (`@Transform(({value}) => Number(value))` + `class-validator` decorators for query-string coercion), runs `findMany` + `count` in one `prisma.$transaction([...])`, and returns `{ page, page_size, total, data }`.
- Services throw Nest `HttpException` subclasses directly (`NotFoundException`, `ConflictException`, `BadRequestException`) — the global filter formats them, no manual try/catch needed except to translate known Prisma error codes (e.g. `P2003` foreign-key violation → `ConflictException`).
- Multi-step writes that touch more than one table (e.g. borrowing a book decrements `books.available_copies`) run inside `prisma.$transaction(async (tx) => {...})`.
- Controllers put `@UseGuards(JwtAuthGuard)` on read routes and `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)` on mutating routes.

`src/modules/library/borrow-records/` is a second fully-built-out reference (in addition to `books/`), useful for patterns beyond plain CRUD:
- Action-style `PATCH` instead of a generic partial-update: body is `{ action: 'return' | 'renew', ... }` (see `dto/update-borrow-record.dto.ts`), because a borrow record doesn't have arbitrary editable fields — it has specific state transitions.
- A business-rule guard beyond simple existence checks: `create()` runs a `findFirst` inside the transaction to block a borrower from having two simultaneously-active (`status: 'borrowed'`) records for the same book, throwing `ConflictException` rather than relying on a DB unique constraint (there isn't one for this).
- Derived, non-persisted response fields computed in a `formatRecord()` mapper (`is_overdue`/`days_overdue` computed live against "now"; `returned_late`/`days_late` computed once at return time and frozen from then on; `fine_amount` = `days_overdue`/`days_late` × a flat `FINE_PER_DAY_AMOUNT` in-code constant, since the schema has no fine column) — a pattern for surfacing time-based/derived state without adding write-time logic, a background job, or new schema.
- `POSTMAN_BORROW_RECORDS.md` (repo root) is a full manual-testing writeup for this module: every endpoint's good/bad request cases with the actual response bodies hit while building it — useful both as a Postman script and as a model for documenting *other* modules' test cases the same way.
- **Identity-aware authorization, not just role-gated.** `create()` takes the caller's `JwtPayload` (via `@CurrentUser()`) alongside the DTO: a `student`-role caller can only ever borrow for their *own* linked `students` row (resolved from `students.user_id = <JWT sub>` inside the transaction) — any `student_id` they name must match their own, and `borrower_type: "faculty"` is rejected outright. `library`/`admin` remain unrestricted (can issue to anyone). `findAll()`/`findOne()` apply the same self-scoping to reads: a `student`/`faculty` caller only ever sees their own records (any mismatched filter is silently overridden, not rejected), and `findOne()` returns a plain `404` — not `403` — for someone else's record, so existence isn't leaked to an unauthorized caller. `library`/`admin` and every other role stay unrestricted. This is the one place in the codebase that scopes reads/writes to the caller's own identity rather than just their role; if you're adding a similar self-service flow elsewhere, this is the reference pattern.
- **`remove()` treats `status: "returned"` as permanent history, not deletable data** — it throws `409` rather than hard-deleting, since `books.remove()` already blocks deleting a book with *any* `book_borrow_records` row attached (P2003 "existing borrow history"), which only makes sense if those rows are meant to be permanent. Only a still-`"borrowed"` (not-yet-historical) record can be deleted, which still restores `available_copies`. No soft-delete column was added for this — it reuses the existing `status` column.
- `update()`'s `renew` action is blocked (`409`) once the record is already overdue, and capped at a `MAX_RENEWALS` in-code constant (currently 2) — both plain business constants alongside `RENEWAL_PERIOD_DAYS`, since there's no policy-config table to source them from.
- `SearchBorrowRecordsDto.status` accepts `"overdue"` as a query value, but the DB only ever persists `"borrowed"`/`"returned"` (there is no code path that writes the enum's third `overdue` value) — `findAll()` maps `status=overdue` to the same derived `status='borrowed' AND due_date < now` predicate that `overdue=true` already uses, rather than a literal equality filter that would always match zero rows.

`src/modules/library/e-resources/` is a third reference, smaller than `books`/`borrow-records` but notable for one thing: unlike `books` (which has no such guard either, but is less prone to accidental dupes since `qr_code` is unique), `e-resources.create()`/`update()` treat `url` as the resource's real identity — a case-insensitive `findFirst` on (trimmed) `url` runs before every write and throws `ConflictException` on a match, since nothing in the schema (`e_resources` has no unique constraint besides `id`) stops the same subscription link being inserted twice otherwise. `update()` excludes the record's own `id` from that lookup so saving without changing the URL doesn't self-conflict.

### Manual test docs (`test/methods/*.md`)
`books.md`, `book_categories.md`, `borrow_records.md`, `e_resources.md` — one file per `library` submodule, each following the `POSTMAN_BORROW_RECORDS.md` format (route table, request/response bodies, good/bad cases) plus a "Known gaps" section noting intentional non-features vs. actual bugs. Update the relevant file's request/response examples and "Known gaps" section whenever a module's behavior changes (e.g. a new validation rule or guard) so the doc doesn't drift from what the code actually does.

### Verified test results (`test/verified/*.verified.md`)
One file per `library` submodule (`books.verified.md`, `book_categories.verified.md`, `borrow_records.verified.md`, `e_resources.verified.md`), separate from `test/methods/`. Where `test/methods/` documents the *intended* contract, `test/verified/` records what was actually observed by live-testing every route (good and bad cases) against a running `npm run start:dev` instance hitting the real Prisma/Supabase path — no mocks. Each file states what was confirmed, calls out any discrepancy found between the documented contract and actual behavior, and ends with a "Remaining limitations" section. When a module's behavior changes, re-verify live and rewrite (not append to) that module's `.verified.md` file so it always reflects only the current, final behavior — treat it as a snapshot, not a changelog.

### Git workflow
`main` is protected/production; `develop` is the integration branch. Create feature branches off `develop` as `feature/<module-name>` and PR back into `develop`, never push directly to `main`.

### Reference docs in the repo
- `TEAM_SETUP.md` — onboarding, module ownership table, RBAC/pagination/response examples.
- `api-contracts.md` + `docs/api/0N-*.md` — per-module REST contracts (request/response shapes, query params, error codes) meant to be shared with each module owner; check the relevant `docs/api/` file before changing a module's public API.
- `worflow.md` — plain-language walkthrough of the college's actual business process (admissions → fee demands → hostel/transport → procurement → announcements etc.) end to end; useful for understanding *why* a module's data model looks the way it does.
- `POSTMAN_BORROW_RECORDS.md` — manual Postman test guide for `library/borrow-records`, with real good/bad request-response pairs; a model to follow if writing the same kind of guide for another module.
