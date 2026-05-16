import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

async function main() {
  const restoHash = await bcrypt.hash('demo1234', 12);
  const influencerHash = await bcrypt.hash('demo1234', 12);

  const restaurant = await prisma.restaurant.upsert({
    where: { email: 'demo@resto.fr' },
    update: {},
    create: {
      name: 'Chez Martin',
      slug: 'chez-martin',
      email: 'demo@resto.fr',
      passwordHash: restoHash,
    },
  });

  const marie = await prisma.influencer.upsert({
    where: { email: 'marie@demo.fr' },
    update: {},
    create: {
      restaurantId: restaurant.id,
      displayName: 'Marie',
      code: 'MARIE7K',
      email: 'marie@demo.fr',
      passwordHash: influencerHash,
      discountPercent: 15,
      rewardPerScanXof: 500,
    },
  });

  await prisma.influencer.upsert({
    where: { email: 'paul@demo.fr' },
    update: {},
    create: {
      restaurantId: restaurant.id,
      displayName: 'Paul',
      code: 'PAUL3X',
      email: 'paul@demo.fr',
      passwordHash: influencerHash,
      discountPercent: 10,
      rewardPerScanXof: 300,
    },
  });

  const existingScans = await prisma.scan.count({ where: { influencerId: marie.id } });
  if (existingScans === 0) {
    for (let i = 0; i < 5; i++) {
      await prisma.scan.create({
        data: {
          restaurantId: restaurant.id,
          influencerId: marie.id,
          fingerprintHash: crypto.randomBytes(32).toString('hex'),
          rewardXof: 500,
          discountPercent: 15,
          ticket: {
            create: {
              ticketCode: `TKT-SEED-${String(i).padStart(4, '0')}`,
              expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            },
          },
        },
      });
    }
  }

  console.log('Seed terminé.');
  console.log('  Admin restaurant : demo@resto.fr / demo1234');
  console.log('  Login Marie      : marie@demo.fr / demo1234');
  console.log('  Login Paul       : paul@demo.fr  / demo1234');
  console.log('  Page scan        : http://localhost:5173/s/chez-martin');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
