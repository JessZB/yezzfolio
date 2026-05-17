import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { Role, Status } from '@prisma/client';
import 'dotenv/config';

const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL 
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'jesusnbz25@gmail.com';
  
  console.log(`🌱 Seeding Super Admin: ${adminEmail}...`);

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: Role.SUPER_ADMIN,
      status: Status.ACTIVE,
    },
    create: {
      email: adminEmail,
      name: 'Jesús NBZ',
      role: Role.SUPER_ADMIN,
      status: Status.ACTIVE,
    },
  });

  console.log(`✅ Super Admin created/updated: ${user.email} (ID: ${user.id})`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
