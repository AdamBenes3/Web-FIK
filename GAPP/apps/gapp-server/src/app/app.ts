import * as path from 'path';
import { FastifyInstance } from 'fastify';
import AutoLoad from '@fastify/autoload';

export interface AppOptions {
    influxDbToken: string;
    influxDbHost: string;
}

export const app = async (fastify: FastifyInstance, opts: AppOptions) => {
    fastify.register(AutoLoad, {
        dir: path.join(__dirname, 'plugins'),
        options: { ...opts },
    });

    fastify.register(AutoLoad, {
        dir: path.join(__dirname, 'routes'),
        options: { ...opts },
    });
};
