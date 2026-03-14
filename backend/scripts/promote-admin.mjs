import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const userId = process.argv[2];

if (!userId) {
  console.error('Usage: node scripts/promote-admin.mjs <userId>');
  process.exit(1);
}

try {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      role: 'ADMIN',
      isVerified: true
    },
    select: {
      id: true,
      username: true,
      role: true,
      isVerified: true
    }
  });

  console.log(JSON.stringify({ success: true, data: user }));
} catch (error) {
  console.error(JSON.stringify({ success: false, message: error.message }));
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
