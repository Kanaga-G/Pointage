const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const email = 'noone@example.com';
    console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? '(set)' : '(missing)');
    const admin = await prisma.admin.findUnique({ where: { email } });
    console.log('admin result:', admin);
    const employe = await prisma.employe.findUnique({ where: { email } });
    console.log('employe result:', employe);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

main().catch((err) => {
  console.error('Prisma query test error:', err);
  process.exit(1);
});

