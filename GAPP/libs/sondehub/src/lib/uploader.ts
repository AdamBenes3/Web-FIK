import axios from 'axios';
import { gzipSync } from 'node:zlib';

// Base interface containing common properties
interface BasePacket {
    software_name: string;
    software_version: string;
    uploader_callsign: string;
    uploader_position?: [number, number, number];
    uploader_antenna?: string;
}

// Telemetry packet interface
interface TelemetryPacket extends Partial<BasePacket> {
    dev?: string;
    time_received?: string; // ISO 8601 timestamp
    payload_callsign: string;
    datetime: string; // ISO 8601 timestamp
    lat: number;
    lon: number;
    alt: number;
    frequency?: number;
    temp?: number;
    humidity?: number;
    vel_h?: number;
    vel_v?: number;
    pressure?: number;
    heading?: number;
    batt?: number;
    sats?: number;
    snr?: number;
    rssi?: number;
    telemetry_hidden?: boolean;
    historical?: boolean;
    upload_time?: string; // ISO 8601 timestamp
}

type StationBasePayload = Partial<Omit<BasePacket, 'uploader_callsign' | 'uploader_position'>> &
    Required<Pick<BasePacket, 'uploader_callsign' | 'uploader_position'>>;

// Station position packet interface
interface StationPositionPacket extends StationBasePayload {
    uploader_radio?: string;
    uploader_contact_email?: string;
    mobile?: boolean;
}

interface UploaderConfig extends BasePacket {
    uploadRate: number;
    uploadTimeout: number;
    uploadRetries: number;
    dev: boolean;
}

type MinimalUploaderConfig = Partial<Omit<UploaderConfig, 'uploader_Callsign'>> & Pick<UploaderConfig, 'uploader_callsign'>;

export class Uploader {
    private uploaderConfig: UploaderConfig = {
        uploader_callsign: '',
        uploadRate: 2,
        uploadTimeout: 20_000,
        uploadRetries: 5,
        dev: false,
        software_name: 'node-sondehub',
        software_version: '0.0.1',
    };

    private inputQueue: TelemetryPacket[] = [];

    public static readonly SONDEHUB_AMATEUR_URL = 'https://api.v2.sondehub.org/amateur/telemetry';
    public static readonly SONDEHUB_AMATEUR_STATION_POSITION_URL = 'https://api.v2.sondehub.org/amateur/listeners';

    constructor(options: MinimalUploaderConfig) {
        this.uploaderConfig = {
            ...this.uploaderConfig,
            ...options,
        };
    }

    private logDebug(message: string): void {
        console.debug(`Sondehub Uploader: ${message}`);
    }

    private logInfo(message: string): void {
        console.info(`Sondehub Uploader: ${message}`);
    }

    private logError(message: string): void {
        console.error(`Sondehub Uploader: ${message}`);
    }

    public addTelemetry(packet: TelemetryPacket): void {
        const enhancedPacket = this.enhanceTelemetryPacket(packet);

        this.inputQueue.push(enhancedPacket);
        this.logDebug('Telemetry packet added to queue.');
    }

    public async uploadTelemetry(): Promise<void> {
        if (this.inputQueue.length === 0) {
            this.logDebug('No telemetry packets to upload.');
            return;
        }

        const packets = [...this.inputQueue];
        this.inputQueue = [];

        try {
            const compressedPayload = gzipSync(JSON.stringify(packets));
            const headers = {
                'User-Agent': `${this.uploaderConfig.software_name}-${this.uploaderConfig.software_version}`,
                'Content-Encoding': 'gzip',
                'Content-Type': 'application/json',
            };

            const response = await axios.put(Uploader.SONDEHUB_AMATEUR_URL, compressedPayload, {
                headers,
                timeout: this.uploaderConfig.uploadTimeout,
            });

            if (response.status === 200) {
                this.logInfo(`Uploaded ${packets.length} telemetry packets.`);
            } else {
                this.logError(`Failed to upload telemetry. Status: ${response.status}, Message: ${response.statusText}`);
            }
        } catch (error) {
            console.log(error);
            this.logError(`Error uploading telemetry: ${error}`);
        }
    }

    public async uploadStationPosition(stationPacket: StationPositionPacket): Promise<void> {
        const payload = {
            software_name: this.uploaderConfig.software_name,
            software_version: this.uploaderConfig.software_version,
            uploader_callsign: stationPacket.uploader_callsign,
            uploader_position: stationPacket.uploader_position,
            uploader_radio: stationPacket.uploader_radio,
            uploader_antenna: stationPacket.uploader_antenna || this.uploaderConfig.uploader_antenna,
            uploader_contact_email: stationPacket.uploader_contact_email,
            mobile: stationPacket.mobile ?? false,
            dev: this.uploaderConfig.dev,
        };

        try {
            const compressedPayload = gzipSync(JSON.stringify(payload));
            const headers = {
                'User-Agent': `${this.uploaderConfig.software_name}-${this.uploaderConfig.software_version}`,
                'Content-Encoding': 'gzip',
                'Content-Type': 'application/json',
            };
            const response = await axios.put(Uploader.SONDEHUB_AMATEUR_STATION_POSITION_URL, compressedPayload, {
                headers,
                timeout: this.uploaderConfig.uploadTimeout,
            });

            if (response.status === 200) {
                this.logInfo('Station position uploaded successfully.');
            } else {
                this.logError(`Failed to upload station position. Status: ${response.status}, Message: ${response.statusText}`);
            }
        } catch (error) {
            this.logError(`Error uploading station position: ${error}`);
        }
    }

    private enhanceTelemetryPacket(packet: TelemetryPacket): TelemetryPacket {
        const enhancedPacket = { ...packet };
        enhancedPacket.software_name = this.uploaderConfig.software_name;
        enhancedPacket.software_version = this.uploaderConfig.software_version;

        if (!packet.uploader_callsign) {
            enhancedPacket.uploader_callsign = this.uploaderConfig.uploader_callsign;
        }

        if (!packet.uploader_position) {
            enhancedPacket.uploader_position = this.uploaderConfig.uploader_position;
        }

        if (!packet.time_received) {
            enhancedPacket.time_received = new Date().toISOString();
        }

        return enhancedPacket;
    }
}
