import dotenv from 'dotenv';

dotenv.config();

let prismaClient = null;

async function main() {
  const [{ reindexSearchDocuments }, { default: prisma }] = await Promise.all([
    import('../src/services/elasticsearch.service.js'),
    import('../src/config/database.js'),
  ]);
  prismaClient = prisma;
  const summary = await reindexSearchDocuments({
    batchSize: Number(process.env.ELASTICSEARCH_REINDEX_BATCH_SIZE || 500),
  });
  console.log('Elasticsearch reindex summary:', JSON.stringify(summary, null, 2));
}

main()
  .catch((error) => {
    console.error('Elasticsearch reindex failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (prismaClient) {
      await prismaClient.$disconnect();
    }
  });
