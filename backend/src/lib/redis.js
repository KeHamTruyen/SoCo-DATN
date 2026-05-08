import { createClient } from 'redis';

let clientPromise = null;

function createRedisClient() {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  const client = createClient({
    url,
    socket: {
      connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 5000),
    },
  });

  client.on('error', () => {});
  return client;
}

export async function getRedisClient() {
  if (!clientPromise) {
    const client = createRedisClient();
    clientPromise = client ? client.connect().then(() => client).catch(() => null) : Promise.resolve(null);
  }
  return clientPromise;
}

export async function closeRedisClient() {
  const client = await getRedisClient();
  if (client?.isOpen) {
    await client.quit();
  }
}
