// Import required modules
import axios from 'axios';
import { gzipSync } from 'node:zlib';

export interface Position {
    lat: number;
    lon: number;
    alt: number;
}

export interface TelemetryPacket {
    payload_callsign: string;
    timestamp: string;
    lat: number;
    lon: number;
    alt: number;
    frame?: number;
    time_received?: string;
    sats?: number;
    batt?: number;
    temp?: number;
    humidity?: number;
    pressure?: number;
    vel_h?: number;
    vel_v?: number;
    heading?: number;
    tx_frequency?: number;
    modulation?: string;
    snr?: number;
    frequency?: number;
    rssi?: number;
    uploader_callsign?: string;
    uploader_position?: Position;
    uploader_radio?: string;
    uploader_antenna?: string;
    software_name?: string;
    software_version?: string;
    [key: string]: any;
}

export class Uploader {
    private inputQueue: TelemetryPacket[] = [];
    private static SONDEHUB_AMATEUR_URL = 'https://api.v2.sondehub.org/amateur/telemetry';
    private static SONDEHUB_AMATEUR_STATION_POSITION_URL = 'https://api.v2.sondehub.org/amateur/listeners';

    constructor(
        private uploaderCallsign: string,
        private uploaderPosition?: Position,
        private uploaderRadio?: string,
        private uploaderAntenna?: string,
        private softwareName = 'ts-sondehub',
        private softwareVersion = '0.0.1',
        private uploadRate = 2,
        private uploadTimeout = 20,
        private uploadRetries = 5,
        private developerMode = false
    ) {}

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
        const now = new Date();
        packet.software_name = this.softwareName;
        packet.software_version = this.softwareVersion;

        if (!packet.uploader_callsign) {
            packet.uploader_callsign = this.uploaderCallsign;
        }

        if (!packet.time_received) {
            packet.time_received = now.toISOString();
        }

        this.inputQueue.push(packet);
        this.logDebug('Telemetry packet added to queue.');
    }

    public async uploadTelemetry(): Promise<void> {
        if (this.inputQueue.length === 0) {
            this.logDebug('No telemetry packets to upload.');
            return;
        }

        const packets = [...this.inputQueue];
        this.inputQueue = []; // Clear the queue

        try {
            const compressedPayload = gzipSync(JSON.stringify(packets));
            const headers = {
                'User-Agent': `${this.softwareName}-${this.softwareVersion}`,
                'Content-Encoding': 'gzip',
                'Content-Type': 'application/json',
            };

            const response = await axios.put(Uploader.SONDEHUB_AMATEUR_URL, compressedPayload, {
                headers,
                timeout: this.uploadTimeout * 1000,
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

    public async uploadStationPosition(
        callsign: string,
        position: Position,
        radio?: string,
        antenna?: string,
        contactEmail?: string,
        mobile = false
    ): Promise<void> {
        const payload = {
            software_name: this.softwareName,
            software_version: this.softwareVersion,
            uploader_callsign: callsign,
            uploader_position: position,
            uploader_radio: radio || this.uploaderRadio,
            uploader_antenna: antenna || this.uploaderAntenna,
            uploader_contact_email: contactEmail || '',
            mobile,
            dev: this.developerMode,
        };

        try {
            const response = await axios.put(Uploader.SONDEHUB_AMATEUR_STATION_POSITION_URL, payload, {
                headers: {
                    'User-Agent': `${this.softwareName}-${this.softwareVersion}`,
                    'Content-Type': 'application/json',
                },
                timeout: this.uploadTimeout * 1000,
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
}
