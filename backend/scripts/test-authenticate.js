const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const AdminModel = require('../models/AdminModel');
const EmployeModel = require('../models/EmployeModel');

const envLocalPath = path.join(__dirname, '..', '.env.local');
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: fs.existsSync(envLocalPath) ? envLocalPath : envPath });

async function main() {
  const adminModel = new AdminModel();
  const employeModel = new EmployeModel();

  try {
    const admin = await adminModel.authenticate('superadmin@xpertpro.local', 'admin123');
    console.log('admin authenticate:', admin ? { id: admin.id, email: admin.email, role: admin.role } : null);

    const employe = await employeModel.authenticate('alice.traore@xpertpro.local', 'employe123');
    console.log('employe authenticate:', employe ? { id: employe.id, email: employe.email, role: employe.role } : null);
  } finally {
    // Prevent hanging process due to open Prisma engines.
    await Promise.allSettled([
      adminModel.prisma?.$disconnect?.(),
      employeModel.prisma?.$disconnect?.()
    ]);
  }
}

main().catch((err) => {
  console.error('authenticate test failed:', err);
  process.exit(1);
});

