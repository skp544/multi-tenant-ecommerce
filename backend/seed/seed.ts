import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { PrismaClient } from '../src/generated/prisma/client.js';

dotenv.config();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log('🌱 Seeding the platform admin...');
  const email = process.env.ADMIN_EMAIL ?? 'iamskp2001@gmail.com';
  const password = process.env.ADMIN_PASSWORD ?? '123456';

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
    },
    create: {
      email,
      passwordHash,
      userType: 'PLATFORM_ADMIN',
      twoFactorEnabled: false,
      fullName: 'Shubham Kumar Prajapati',
      phone: '9350163368',
    },
  });

  console.log('🌱 Seeding complete!');
}

main();
