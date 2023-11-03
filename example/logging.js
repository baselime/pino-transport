import pino from 'pino';

const transport = pino.transport({
  target: "../dist/index",
  options: { baselimeApiKey: process.env.BASELIME_API_KEY }
});

const logger = pino(transport);

logger.info("Hello Pino!");

await new Promise((resolve) => setTimeout(resolve, 1000))