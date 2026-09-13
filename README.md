# Multi-Tenant E-commerce

A multi-tenant e-commerce platform, built as a monorepo with a NestJS backend and a React-based admin dashboard.

## Project structure

```
.
├── backend/          # NestJS API server
└── platform-admin/   # React (Vite) admin dashboard
```

### backend

- [NestJS](https://nestjs.com/) API server
- [Prisma ORM](https://www.prisma.io/) with PostgreSQL
- JWT auth via `@nestjs/passport` (registered globally, see `src/common/passport`)
- Vitest for unit and e2e tests
- oxlint + Prettier for linting/formatting

### platform-admin

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- Redux Toolkit for state management
- Tailwind CSS + shadcn/radix UI components
- React Router
- [sonner](https://sonner.emilkowal.ski/) for toast notifications

## Features

**Auth**

- Admin login with JWT access/refresh tokens
- Session bootstrap on load via `GET /auth/me`, gating all `/dashboard/*` routes
- Logout

**My Account**

- View profile details
- Edit profile (full name, phone) with success/error toasts sourced from the backend's response message

## Getting started

### Backend

Requires a running PostgreSQL instance. Configure `backend/.env`:

```env
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme

JWT_ACCESS_SECRET=your-secret
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=your-secret
JWT_REFRESH_EXPIRES_IN=30d
```

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

Runs at [http://localhost:4000](http://localhost:4000).

### Platform Admin

Configure `platform-admin/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

```bash
cd platform-admin
npm install
npm run dev
```

Runs at [http://localhost:3002](http://localhost:3002) (set via `vite.config.ts`, not Vite's default `5173`).

## Scripts

Each package manages its own scripts — see the `package.json` in `backend/` and `platform-admin/` respectively.
