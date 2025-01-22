import Fastify from 'fastify';
import { app } from './app/app';
import { getConfig } from './config';

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
