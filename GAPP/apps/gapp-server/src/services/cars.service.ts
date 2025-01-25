import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';
import { InfluxDbServiceBase } from '../utils/influxdb-service-base';
import { Organization } from '@influxdata/influxdb-client-apis';
import { CarStatus } from '../schemas';

export class CarsService extends InfluxDbServiceBase {
    private writeAPi: WriteApi;

    constructor(private client: InfluxDB, private org: Organization) {
        super(client, org.id);
    }

    public async init() {
        await this.ensureBucket('cars');
        this.writeAPi = this.client.getWriteApi(this.org.id, 'cars', 'ms');
    }

    public async deinit() {
        await this.writeAPi.close();
    }

    public writeCarStatus(callsign: string, status: CarStatus) {
        const point = new Point('car_status')
            .timestamp(Date.now())
            .tag('callsign', callsign)
            .floatField('latitude', status.latitude)
            .floatField('longitude', status.longitude)
            .floatField('altitude', status.altitude);

        this.writeAPi.writePoint(point);
    }
}
