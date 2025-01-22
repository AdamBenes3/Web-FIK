import Fastify from 'fastify';
import { app } from './app/app';
import { getConfig } from './config';
import { InfluxDB, Point } from '@influxdata/influxdb-client';

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


const client = new InfluxDB({ url: config.INFLUXDB_HOST, token: config.INFLUXDB_TOKEN });

const writeApi = client.getWriteApi('FikFlights', 'Fik', 'ns');

const point = new Point('measurement');

point.tag('location', 'PRG')
point.intField('humidity', 185);

writeApi.writePoint(point);
