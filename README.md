# Multi-Tenant E-commerce

A multi-tenant e-commerce platform, built as a monorepo with a NestJS backend and a React-based admin dashboard.

## Project structure

```
.
├── backend/          # NestJS API server
├── platform-admin/   # React (Vite) admin dashboard
└── test/             # Playwright end-to-end tests
```

### backend

- [NestJS](https://nestjs.com/) API server
- [Prisma ORM](https://www.prisma.io/) with PostgreSQL
- JWT auth via `@nestjs/passport` (registered globally, see `src/common/passport`)
- Emails through [Nodemailer](https://nodemailer.com/) (MailHog for local development)
- Vitest for unit and e2e tests
- oxlint + Prettier for linting/formatting

### platform-admin

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- Redux Toolkit for state management
- Tailwind CSS + shadcn/radix UI components
- React Router
- [sonner](https://sonner.emilkowal.ski/) for toast notifications

### test

- [Playwright](https://playwright.dev/) end-to-end tests that drive the real dashboard, API, database and MailHog inbox

## Features

**Auth**

- Admin login with JWT access/refresh tokens
- Two-factor login: when 2FA is on, `POST /auth/login` checks the password and emails a 6-digit code instead of issuing tokens. The dashboard then asks for the code on `/auth/2fa`, which calls `POST /auth/login/2fa` to receive the tokens
  - Codes expire after 5 minutes, allow 5 attempts, and are single use
  - Signing in again within 60 seconds reuses the code already sent instead of emailing a new one
- Login returns the same error for an unknown email and a wrong password, and takes about as long for both
- Session bootstrap on load via `GET /auth/me`, gating all `/dashboard/*` routes
- Logout
- The forgot/reset password screens are UI only and are not connected to the backend yet

**My Account**

- View profile details
- Edit profile (full name, phone) with success/error toasts sourced from the backend's response message
- Enable or disable two-factor authentication with an emailed code

## Getting started

### Backend

Requires a running PostgreSQL instance and [MailHog](https://github.com/mailhog/MailHog) for the two-factor emails. Configure `backend/.env`:

```env
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme

JWT_ACCESS_SECRET=your-secret
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=your-secret
JWT_REFRESH_EXPIRES_IN=30d

# Token that carries the user between the password step and the code step of a 2FA login
JWT_2FA_SECRET=your-secret
JWT_2FA_EXPIRES_IN=15m

# MailHog
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM="Platform Admin <no-reply@platform.local>"
```

Start MailHog from the repository root. SMTP is on port `1025` and the inbox is at [http://localhost:8025](http://localhost:8025), where the 2FA codes arrive:

```bash
docker compose up -d mailhog
```

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed      # creates the platform admin from ADMIN_EMAIL / ADMIN_PASSWORD
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

## End-to-end tests

The Playwright suite in `test/` covers login, the two-factor flow (enable, sign in with a code, wrong and reused codes, disable), login error handling and the reset password page. It reads the emailed codes from MailHog.

Before running, have PostgreSQL and MailHog up and the admin seeded (see [Backend](#backend)). The backend and the dashboard are started for you unless they are already running.

```bash
cd test
npm install
npx playwright install chromium   # first time only
npm test
```

Other scripts: `npm run test:headed` (visible browser), `npm run test:ui` (Playwright UI mode), `npm run report` (open the last HTML report).

Things to know:

- The tests sign in as the admin from `backend/.env` and switch that account's 2FA on and off, so run them against a development database only. The account is put back to "2FA off" before and after the run, even if a test fails
- They run one at a time because they share that account
- Only 2FA emails sent to the admin address are read, so a MailHog shared with other projects is fine
- Override the defaults with `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, `E2E_WEB_URL` (`http://localhost:3002`), `E2E_API_URL` (`http://localhost:4000`) and `E2E_MAILHOG_URL` (`http://localhost:8025`)

## Scripts

Each package manages its own scripts — see the `package.json` in `backend/`, `platform-admin/` and `test/` respectively.
