import { Type as T } from '@sinclair/typebox';

export const Q_Callsign = T.Object({
    callsign: T.String(),
});

export const B_CarStatus = T.Object({
    car_id: T.Optional(T.String()),
    car_heartbeat_value: T.Optional(T.String({ format: 'date-time' })),
    latitude: T.Number(),
    longitude: T.Number(),
    altitude: T.Number(),
});
