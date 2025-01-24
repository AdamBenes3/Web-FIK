import Fastify from 'fastify';
import { app } from './app/app';
import { getConfig } from './config';
import pino from 'pino';

const config = getConfig(process.env);
const logger = pino();
const server = Fastify({ loggerInstance: logger });

server.register(app);

server.listen({ port: config.PORT, host: '0.0.0.0' }, (err) => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    await server.close();
    server.log.info('Server stopped');
});
