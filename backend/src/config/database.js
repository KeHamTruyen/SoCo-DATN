import { PrismaClient } from '@prisma/client';
import { logInfo } from '../utils/logger.js';
import { addQueryMetrics } from '../observability/requestMetrics.js';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

prisma.$use(async (params, next) => {
  const start = process.hrtime.bigint();
  const result = await next(params);
  const elapsedNs = process.hrtime.bigint() - start;
  const durationMs = Number(elapsedNs) / 1_000_000;

  addQueryMetrics({
    model: params.model ?? null,
    action: params.action,
    durationMs,
  });

  const slowQueryThresholdMs = Number(process.env.SLOW_QUERY_THRESHOLD_MS ?? 200);
  if (durationMs >= slowQueryThresholdMs) {
    logInfo('Slow Prisma query detected', {
      model: params.model ?? null,
      action: params.action,
      durationMs: Math.round(durationMs * 100) / 100,
    });
  }

  return result;
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
