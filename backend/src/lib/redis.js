import { createClient } from 'redis';

let clientPromise = null;

function createRedisClient() {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  const client = createClient({
    url,
    socket: {
      connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 5000),
      // Fail fast when URL/TLS is wrong — avoids hanging API/tests on reconnect loops.
      reconnectStrategy: () => false,
    },
    disableOfflineQueue: true,
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
