import Fastify from 'fastify';
import { app } from './app/app';
import { getConfig } from './config';
import pino from 'pino';
import { Uploader } from '@gapp/sondehub';

console.log(Uploader);

const config = getConfig(process.env);
const logger = pino();
const server = Fastify({ loggerInstance: logger });

server.register(app, {
    influxDbToken: config.INFLUXDB_TOKEN,
    influxDbHost: config.INFLUXDB_HOST,
});

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
