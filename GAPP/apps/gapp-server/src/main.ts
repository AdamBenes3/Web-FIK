import Fastify from 'fastify';
import { app } from './app/app';
import { getConfig } from './config';
import { Uploader } from '@gapp/sondehub';

const uploader = new Uploader({ uploader_callsign: 'node-sondehub' });

uploader.addTelemetry({
    payload_callsign: 'cesilko-payload',
    datetime: new Date().toISOString(),
    lat: 50,
    lon: 15,
    alt: 2000,
});

uploader.uploadTelemetry();

uploader.uploadStationPosition({
  uploader_callsign: 'cesilko-car',
  uploader_position: [50.01, 15.01, 185],
  mobile: true
});

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
