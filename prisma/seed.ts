/**
 * EOS Backend – Database Seed Script
 *
 * Creates all 16 roles + one test user per role.
 * Password for ALL test users: EOS@test123
 *
 * Run:  npm run seed
 */

import 'dotenv/config';
import crypto from 'node:crypto';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma  = new PrismaClient({ adapter } as any);

const TEST_PASSWORD = 'EOS@test123';
const PASSWORD_HASH = crypto.createHash('sha256').update(TEST_PASSWORD).digest('hex');

// ─── All roles ───────────────────────────────────────────────────────────────
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
] as const;

async function main() {
  console.log('\n🌱  EOS Backend – Database Seed\n');

  // 1. Upsert all roles
  console.log('📋  Upserting roles...');
  const roleMap: Record<string, number> = {};

  for (const role of ROLES) {
    const r = await (prisma as any).roles.upsert({
      where:  { name: role.name },
      update: { description: role.description },
      create: role,
    });
    roleMap[role.name] = r.id;
    console.log(`   ✅  ${role.name.padEnd(26)} id=${r.id}`);
  }

  // 2. Create one test user per role
  console.log('\n👤  Creating test users...');

  for (const role of ROLES) {
    const email = `${role.name}@eos.test`;
    const u = await (prisma as any).users.upsert({
      where:  { email },
      update: { password_hash: PASSWORD_HASH, role_id: roleMap[role.name] },
      create: {
        email,
        password_hash: PASSWORD_HASH,
        role_id:       roleMap[role.name],
        status:        'active',
      },
    });
    console.log(`   ✅  ${email.padEnd(42)} id=${u.id}`);
  }

  // 3. Print credentials table
  const LINE = '═'.repeat(65);
  console.log(`\n${LINE}`);
  console.log('  POSTMAN TEST CREDENTIALS');
  console.log('  Password for every account: EOS@test123');
  console.log(LINE);
  console.log('  Email                                    Role');
  console.log('─'.repeat(65));
  for (const r of ROLES) {
    console.log(`  ${`${r.name}@eos.test`.padEnd(43)}${r.name}`);
  }
  console.log(LINE);
  console.log('\n✅  Seed complete!\n');
}

main()
  .catch((e) => { console.error('❌  Seed failed:', e); process.exit(1); })
  .finally(() => (prisma as any).$disconnect());
