import Fastify from 'fastify';
import { app } from './app/app';
import { getConfig } from './config';
import { Uploader } from '@gapp/sondehub';

const uploader = new Uploader({ uploaderCallsign: 'CESILKO-NODE', uploaderPosition: [50.01, 15.01, 200] });

uploader.addTelemetry({
    payload_callsign: 'test_payload',
    datetime: new Date().toISOString(),
    lat: 50,
    lon: 14.05,
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
