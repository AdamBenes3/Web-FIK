import Fastify from 'fastify';
import { app } from './app/app';
import { getConfig } from './config';
import { Uploader } from '@gapp/sondehub';

const uploader = new Uploader('CSK-TST');

uploader.addTelemetry({
    payload_callsign: 'CSK-TST-PAYLOAD',
    timestamp: new Date().toISOString(),
    lat: 1.0,
    lon: 1.0,
    alt: 1000,
});
uploader.uploadTelemetry();

const config = getConfig(process.env);

const server = Fastify({
    logger: true,
});

server.register(app);

server.listen({ port: config.PORT, host: '0.0.0.0' }, (err) => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }
});
