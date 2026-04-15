import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

const shouldSkipConnect =
  process.env.NODE_ENV === 'test' || process.env.SKIP_DB_CONNECT === 'true';

if (!shouldSkipConnect) {
  // Handle Prisma connection errors
  prisma.$connect()
    .then(() => {
      console.log('✅ Database connected successfully');
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    });
}

// Graceful shutdown
process.on('beforeExit', async () => {
  if (!shouldSkipConnect) {
    await prisma.$disconnect();
    console.log('👋 Database disconnected');
  }
});

export default prisma;
