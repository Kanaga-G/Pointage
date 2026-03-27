// Minimal reproduction: does Prisma accept a standard postgresql:// URL?
// (No real DB connection is attempted; Prisma fails early while validating the datasource.)

process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://user:pass@localhost:5432/dbname?schema=public';

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    console.log('OK');
  } catch (err) {
    console.error(String(err?.message || err));
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

main();

