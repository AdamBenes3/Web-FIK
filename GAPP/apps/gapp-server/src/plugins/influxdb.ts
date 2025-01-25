import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { InfluxDB, QueryApi, WriteApi } from '@influxdata/influxdb-client';
import { Plugins } from './plugins';

interface InfluxdbPluginOptions extends FastifyPluginOptions {
    host: string;
    token: string;
    org: string;
}

declare module 'fastify' {
    interface FastifyInstance {
        influxWriteApi: WriteApi;
        influxQueryApi: QueryApi;
    }
}

const influxDbPlugin: FastifyPluginAsync<InfluxdbPluginOptions> = async (fastify, options) => {
    const influxClient = new InfluxDB({
        token: options.token,
        url: options.host,
    });

    const writeApi = influxClient.getWriteApi(options.org, 'fik');
    const queryApi = influxClient.getQueryApi(options.org);

    fastify.decorate('influxWriteApi', writeApi);
    fastify.decorate('influxQueryApi', queryApi);
    fastify.addHook('onClose', async () => {
        fastify.log.info('Closing influxdb write api...');
        await writeApi.close();
        fastify.log.info('Influxdb write api closed');
    });
};

export default fp(influxDbPlugin, {
    name: Plugins.INFLUXDB,
});
