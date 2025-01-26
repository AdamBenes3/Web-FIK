import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { B_SondeTtnTelemetry } from '../schemas';
import { ttnPacketDto } from '../utils/ttn-packet-dto';

export const sondesController: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.post(
        '/ttn',
        {
            schema: {
                summary: 'TTN webhook',
                description: 'Endpoint for receiving telemetry data from TTN',
                body: B_SondeTtnTelemetry,
            },
        },
        async (req, rep) => {
            const telemetryPacket = ttnPacketDto(req.body);

            req.server.telemetryService.writeTelemetry(telemetryPacket);
            req.server.sondehub.addTelemetry(telemetryPacket);

            rep.code(200).send('OK');
        }
    );
};
