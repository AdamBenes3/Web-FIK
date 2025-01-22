import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { InfluxDB } from '@influxdata/influxdb-client';

export default fp(async (fastify: FastifyInstance, config) => {
    const influxClient = new InfluxDB({
        token: '',
        url: 'https://localhost:8086',
    });

    fastify.decorate('influxClient', influxClient);
});
