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
- Vitest for unit and e2e tests
- oxlint + Prettier for linting/formatting

### platform-admin

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- Redux Toolkit for state management
- Tailwind CSS + shadcn/radix UI components
- React Router

## Getting started

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Platform Admin

```bash
cd platform-admin
npm install
npm run dev
```

## Scripts

Each package manages its own scripts — see the `package.json` in `backend/` and `platform-admin/` respectively.
