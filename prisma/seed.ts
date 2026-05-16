import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('demo1234', 12);

  // 1. Restaurants
  const chezMartin = await prisma.restaurant.upsert({
    where: { email: 'demo@resto.fr' },
    update: {},
    create: {
      name: 'Chez Martin',
      slug: 'chez-martin',
      email: 'demo@resto.fr',
      passwordHash,
    },
  });

  // 2. Influenceurs (comptes autonomes)
  const marie = await prisma.influencer.upsert({
    where: { email: 'marie@demo.fr' },
    update: {},
    create: {
      displayName: 'Marie',
      email: 'marie@demo.fr',
      passwordHash,
    },
  });

  const paul = await prisma.influencer.upsert({
    where: { email: 'paul@demo.fr' },
    update: {},
    create: {
      displayName: 'Paul',
      email: 'paul@demo.fr',
      passwordHash,
    },
  });

  // 3. Collaborations active Marie ↔ Chez Martin et Paul ↔ Chez Martin
  const marieCollab = await prisma.collaboration.upsert({
    where: { uniq_collaboration_pair: { influencerId: marie.id, restaurantId: chezMartin.id } },
    update: {},
    create: {
      influencerId: marie.id,
      restaurantId: chezMartin.id,
      code: 'MARIE7K',
      discountPercent: 15,
      rewardPerScanXof: 500,
      status: 'active',
      decidedAt: new Date(),
    },
  });

  await prisma.collaboration.upsert({
    where: { uniq_collaboration_pair: { influencerId: paul.id, restaurantId: chezMartin.id } },
    update: {},
    create: {
      influencerId: paul.id,
      restaurantId: chezMartin.id,
      code: 'PAUL3X',
      discountPercent: 10,
      rewardPerScanXof: 300,
      status: 'active',
      decidedAt: new Date(),
    },
  });

  // 4. Scans de démo pour Marie (5 tickets)
  const existingScans = await prisma.scan.count({ where: { collaborationId: marieCollab.id } });
  if (existingScans === 0) {
    for (let i = 0; i < 5; i++) {
      await prisma.scan.create({
        data: {
          restaurantId: chezMartin.id,
          collaborationId: marieCollab.id,
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
  console.log('  Admin restaurant : demo@resto.fr  / demo1234');
  console.log('  Login Marie      : marie@demo.fr  / demo1234');
  console.log('  Login Paul       : paul@demo.fr   / demo1234');
  console.log('  Page scan        : http://localhost:5173/s/chez-martin');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
