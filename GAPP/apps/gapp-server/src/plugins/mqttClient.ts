import { FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import mqtt from 'mqtt';
import fp from 'fastify-plugin';
import { Plugins } from './plugins';

interface MqttPluginOptions extends FastifyPluginOptions {
    clientId: string;
    host: string;
    username: string;
    password: string;
}

declare module 'fastify' {
    interface FastifyInstance {
        mqtt: mqtt.MqttClient;
    }
}

const mqttPlugin: FastifyPluginCallback<MqttPluginOptions> = (fastify, options, done) => {
    const client = mqtt.connect(options.host, {
        clientId: options.clientId,
        username: options.username,
        password: options.password,
    });

    fastify.decorate('mqttClient', client);
    fastify.addHook(
        'onClose',
        async () =>
            new Promise<void>((resolve) => {
                fastify.log.info('Closing MQTT client...');
                client.end(() => {
                    fastify.log.info('MQTT client closed');
                    resolve();
                });
            })
    );

    client.on('error', (error: Error) => {
        fastify.log.error(error);
    });

    client.on('connect', () => {
        fastify.log.info('Connected to MQTT broker');
        done();
    });
};

export default fp(mqttPlugin, { name: Plugins.MQTT });
