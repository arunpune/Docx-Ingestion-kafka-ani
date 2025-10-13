import { createClient } from 'redis';

// If you're using a different host, port, or password, you can pass them in an object.
// For example: createClient({ url: 'redis://alice:foobared@awesome.redis.server:6380' })
// By default, it connects to redis://localhost:6379
const redisClient = createClient();

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// You must connect the client before sending commands.
// Using an async IIFE (Immediately Invoked Function Expression) to connect.
(async () => {
  await redisClient.connect();
})();

export default redisClient;

