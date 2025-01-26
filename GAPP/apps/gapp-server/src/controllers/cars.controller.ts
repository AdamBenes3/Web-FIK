import { B_CarStatus, Q_Callsign } from '../schemas';
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

export const carsController: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.get(
        '/status',
        {
            schema: {
                summary: 'Get cars positions',
                description: 'Get latest location for all registered cars.',
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
                summary: 'Uploads car position to sondehub amateur.',
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
