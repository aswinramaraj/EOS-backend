/**
 * EOS Backend – Database Seed Script (plain .mjs, no transpilation needed)
 *
 * Creates all 16 roles + one test user per role.
 * Password for ALL test users: EOS@test123
 *
 * Run:  npm run seed
 */

import 'dotenv/config';
import crypto from 'crypto';

// ─── Dynamically import the generated Prisma client (ESM) ───────────────────
const { PrismaClient } = await import('../generated/prisma/client.js');
const { PrismaPg }     = await import('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

const TEST_PASSWORD  = 'EOS@test123';
const PASSWORD_HASH  = crypto.createHash('sha256').update(TEST_PASSWORD).digest('hex');

// ─── Role definitions ────────────────────────────────────────────────────────
const ROLES = [
  { name: 'admin',                description: 'System Administrator – full access' },
  { name: 'hod',                  description: 'Head of Department' },
  { name: 'faculty',              description: 'Teaching Faculty' },
  { name: 'student',              description: 'Student' },
  { name: 'parent',               description: 'Parent / Guardian' },
  { name: 'coe',                  description: 'Controller of Examinations' },
  { name: 'placement',            description: 'Placement Cell' },
  { name: 'library',              description: 'Library Staff' },
  { name: 'billing',              description: 'Billing / Fees Collection' },
  { name: 'hr_payroll',           description: 'HR & Payroll Management' },
  { name: 'finance',              description: 'Finance Team' },
  { name: 'iqac',                 description: 'IQAC – Internal Quality Assurance Cell' },
  { name: 'secretary',            description: 'Department Secretary / IT Infrastructure' },
  { name: 'gate_warden',          description: 'Main Gate Watch / Hostel Warden' },
  { name: 'media_room',           description: 'Media Room' },
  { name: 'academic_coordinator', description: 'Academic Co-ordinator' },
];

async function main() {
  console.log('\n🌱  EOS Backend – Database Seed\n');

  // 1. Upsert all roles
  console.log('📋  Upserting roles...');
  const roleMap = {};

  for (const role of ROLES) {
    const r = await prisma.roles.upsert({
      where:  { name: role.name },
      update: { description: role.description },
      create: role,
    });
    roleMap[role.name] = r.id;
    console.log(`   ✅  ${role.name.padEnd(25)} id=${r.id}`);
  }

  // 2. Create one test user per role
  console.log('\n👤  Creating test users...');

  for (const role of ROLES) {
    const email = `${role.name}@eos.test`;
    const u = await prisma.users.upsert({
      where:  { email },
      update: { password_hash: PASSWORD_HASH, role_id: roleMap[role.name] },
      create: {
        email,
        password_hash: PASSWORD_HASH,
        role_id:       roleMap[role.name],
        status:        'active',
      },
    });
    console.log(`   ✅  ${email.padEnd(40)} id=${u.id}`);
  }

  // 3. Give the HoD test user a faculty row.
  // Several HoD-only endpoints (e.g. Class Mentors' department-scope check)
  // resolve the caller's own department via faculty.department_id — there is
  // no other column anywhere in the schema that records which department a
  // user belongs to. Without this row, those checks 404 with "Faculty
  // profile not found for the authenticated user" even for a valid HoD JWT.
  console.log('\n🏫  Ensuring hod@eos.test has a faculty profile...');

  const hodUser = await prisma.users.findUnique({ where: { email: 'hod@eos.test' } });
  const existingHodFaculty = hodUser
    ? await prisma.faculty.findUnique({ where: { user_id: hodUser.id } })
    : null;

  if (existingHodFaculty) {
    console.log(`   ✅  Already exists: faculty.id=${existingHodFaculty.id}, department_id=${existingHodFaculty.department_id}`);
  } else if (hodUser) {
    const firstDepartment = await prisma.departments.findFirst({ orderBy: { id: 'asc' } });
    if (firstDepartment) {
      const hodFaculty = await prisma.faculty.create({
        data: {
          user_id: hodUser.id,
          first_name: 'Test',
          last_name: 'HoD',
          designation: 'Head of Department',
          department_id: firstDepartment.id,
          status: 'active',
        },
      });
      console.log(`   ✅  Created: faculty.id=${hodFaculty.id}, department_id=${hodFaculty.department_id}`);
    } else {
      console.log('   ⚠️  No departments exist yet — skipped (run this seed again after departments are created).');
    }
  }

  // 4. Print credentials table
  const line = '═'.repeat(62);
  console.log(`\n${line}`);
  console.log('  POSTMAN TEST CREDENTIALS  (password: EOS@test123)');
  console.log(line);
  console.log('  Email                                  Role');
  console.log('─'.repeat(62));
  for (const r of ROLES) {
    console.log(`  ${`${r.name}@eos.test`.padEnd(39)}${r.name}`);
  }
  console.log(line);
  console.log('\n✅  Seed complete!\n');
}

main()
  .catch((e) => { console.error('❌  Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());