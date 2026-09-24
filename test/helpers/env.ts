import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';

// The tests sign in as the platform admin the backend seeds from backend/.env.
// E2E_* variables override it, e.g. when running against another database.
function readBackendEnv(): Record<string, string | undefined> {
  try {
    const file = resolve(__dirname, '../../backend/.env');
    return parseEnv(readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

const backendEnv = readBackendEnv();

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? backendEnv.ADMIN_EMAIL;
const adminPassword =
  process.env.E2E_ADMIN_PASSWORD ?? backendEnv.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error(
    'Admin credentials not found. Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env, or E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.',
  );
}

export const ADMIN_EMAIL: string = adminEmail;
export const ADMIN_PASSWORD: string = adminPassword;

export const WEB_URL = process.env.E2E_WEB_URL ?? 'http://localhost:3002';
export const API_URL = process.env.E2E_API_URL ?? 'http://localhost:4000';
export const MAILHOG_URL = process.env.E2E_MAILHOG_URL ?? 'http://localhost:8025';
