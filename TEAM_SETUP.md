# EOS Backend – Team Setup & Developer Guide

## 1. Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| npm | ≥ 10 |
| Git | any recent |

---

## 2. First-time Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd EOS-backend

# 2. Install dependencies
npm install

# 3. Create your local .env
cp .env.example .env
# → Open .env and fill in your DATABASE_URL and JWT_SECRET
#   (ask the team lead for the Supabase credentials)

# 4. Generate the Prisma client
npx prisma generate

# 5. Start the dev server
npm run start:dev
```

The API will be available at: **http://localhost:3000/api/v1**

---

## 3. Project Structure

```
src/
├── app.module.ts            ← Root module (add your module here)
├── main.ts                  ← Bootstrap (global pipes/filters/interceptors)
│
├── auth/                    ← Authentication & RBAC (DO NOT modify unless assigned)
│   ├── decorators/          ← @Roles(), @CurrentUser()
│   ├── guards/              ← JwtAuthGuard, RolesGuard
│   ├── strategies/          ← JWT passport strategy
│   ├── interfaces/          ← JwtPayload interface
│   ├── dto/                 ← LoginDto
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   └── auth.module.ts
│
├── common/                  ← Shared utilities (import from here, don't duplicate)
│   ├── constants/
│   │   └── roles.constant.ts   ← ROLES object with all role names
│   ├── dto/
│   │   ├── api-response.dto.ts  ← ApiResponse<T> class
│   │   └── pagination.dto.ts    ← PaginationDto + paginate() helper
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── transform.interceptor.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   └── index.ts             ← Barrel export (import everything from 'src/common')
│
├── config/
│   └── configuration.ts     ← App configuration factory
│
├── prisma/                  ← Database service
│   ├── prisma.service.ts
│   └── prisma.module.ts
│
└── modules/                 ← Feature modules (one per team member's domain)
    ├── academic-structure/
    ├── admissions/
    ├── announcements/
    ├── exams/
    ├── faculty/
    ├── fees-billing/
    ├── feedback/
    ├── library/
    ├── notifications/
    ├── placement/
    ├── procurement/
    └── venues/
```

---

## 4. Module Ownership (assign to team members)

| Module folder | Owner | Role(s) it serves |
|---|---|---|
| `academic-structure/` | — | Admin, Academic Coordinator, HOD |
| `admissions/` | — | Admin, Student |
| `exams/` | — | COE, Faculty, Student |
| `faculty/` | — | Faculty, HOD, HR |
| `fees-billing/` | — | Billing, Student, Parent |
| `library/` | — | Library, Faculty, Student |
| `placement/` | — | Placement, Student |
| `procurement/` | — | Secretary, Finance, HOD, Admin |
| `venues/` | — | IQAC, HOD, Faculty, Placement |
| `announcements/` | — | Admin, Faculty, HOD |
| `notifications/` | — | All roles |
| `feedback/` | — | Academic Coordinator, Student |

---

## 5. How to Protect a Route (RBAC)

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard }  from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard }    from 'src/auth/guards/roles.guard';
import { Roles }         from 'src/auth/decorators/roles.decorator';
import { CurrentUser }   from 'src/auth/decorators/current-user.decorator';
import { ROLES }         from 'src/common/constants/roles.constant';
import { JwtPayload }    from 'src/auth/interfaces/jwt-payload.interface';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)        // ← applied to ALL routes in controller
export class DepartmentsController {

  @Get()
  @Roles(ROLES.ADMIN, ROLES.HOD)            // ← only admin and hod can list
  findAll(@CurrentUser() user: JwtPayload) {
    console.log(user.role);                 // 'admin' | 'hod' | ...
    return this.departmentsService.findAll();
  }
}
```

> **Available roles** (from `src/common/constants/roles.constant.ts`):
> `ROLES.ADMIN` · `ROLES.HOD` · `ROLES.FACULTY` · `ROLES.STUDENT` · `ROLES.PARENT`
> `ROLES.COE` · `ROLES.PLACEMENT` · `ROLES.LIBRARY` · `ROLES.BILLING`
> `ROLES.HR_PAYROLL` · `ROLES.FINANCE` · `ROLES.IQAC` · `ROLES.SECRETARY`
> `ROLES.GATE_WARDEN` · `ROLES.MEDIA_ROOM` · `ROLES.ACADEMIC_COORDINATOR`

---

## 6. Standard API Response Shape

Every response is automatically wrapped by `TransformInterceptor`:

```json
// Success
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "timestamp": "2026-07-26T06:00:00.000Z"
}

// Error (from HttpExceptionFilter)
{
  "success": false,
  "statusCode": 404,
  "message": "Department not found",
  "timestamp": "2026-07-26T06:00:00.000Z",
  "path": "/api/v1/departments/999"
}
```

---

## 7. Pagination Pattern

```typescript
import { PaginationDto, paginate } from 'src/common';

@Get()
async findAll(@Query() pagination: PaginationDto) {
  const [data, total] = await this.prisma.$transaction([
    this.prisma.departments.findMany({
      skip: pagination.skip,
      take: pagination.limit,
    }),
    this.prisma.departments.count(),
  ]);
  return paginate(data, total, pagination);
}
```

Query params: `?page=1&limit=20`

---

## 8. Accessing the Database

Inject `PrismaService` into your service:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.departments.findMany();
  }
}
```

Your module must import `PrismaModule`:

```typescript
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  ...
})
export class DepartmentsModule {}
```

---

## 9. Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/login` | Login – returns `{ accessToken, user }` |
| `GET` | `/api/v1/auth/me` | Get own profile (requires Bearer token) |

**Login request body:**
```json
{ "email": "admin@eos.ac.in", "password": "your_password" }
```

---

## 10. Git Workflow

```
main              ← production-ready, protected
├── develop       ← integration branch (merge your PRs here)
│   ├── feature/admission-module     ← your feature branch
│   ├── feature/faculty-module
│   └── feature/library-module
```

- Create your branch from `develop`: `git checkout -b feature/<module-name>`
- Never push directly to `main`
- Open a PR to `develop` when your module is ready

---

## 11. Useful Scripts

```bash
npm run start:dev       # dev server with hot reload
npm run lint            # run ESLint
npm run format          # run Prettier
npm run test            # run unit tests
npx prisma studio       # visual DB browser (local only)
npx prisma generate     # re-generate Prisma client after schema changes
```

---

## 12. Need Help?

- Check the workflow doc: `worflow.md`
- Check the Prisma schema: `prisma/schema.prisma`
- Ask the team lead (Yashwanth) for Supabase credentials
