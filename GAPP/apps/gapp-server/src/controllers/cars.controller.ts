import { B_CarStatus, Q_Callsign } from '../schemas';
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

export const carsController: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.get(
        '/status',
        {
            schema: {
                summary: 'Get cars positions',
                description: 'Get latest location for all registered cars.',
                tags: ['cars'],
            },
        },
        async (req, rep) => {
            req.server.carsService.getCarsStatus(['cesilko-test']);
            rep.status(200).send();
        }
    );

    fastify.post(
        '/status',
        {
            schema: {
                tags: ['cars'],
                summary: 'Endpoint for car position',
                description: 'Received data are stored in InfluxDB and forwarded to SondeHub.',
                querystring: Q_Callsign,
                body: B_CarStatus,
            },
        },
        async (req, rep) => {
            const { callsign } = req.query;
            const { latitude, longitude, altitude } = req.body;

            req.server.carsService.writeCarStatus(callsign, {
                latitude,
                longitude,
                altitude,
            });

            await req.server.sondehub.uploadStationPosition({
                uploader_callsign: callsign,
                uploader_position: [latitude, longitude, altitude],
                mobile: true,
            });

            rep.code(201).send();
        }
    );
};
