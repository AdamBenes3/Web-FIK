// Import required modules
import axios from 'axios';
import { gzipSync } from 'node:zlib';

export type Position = [number, number, number];

interface TelemetryPacket {
    payload_callsign: string;
    datetime: string;
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

interface UploaderConfig {
  uploaderCallsign: string;
  uploaderPosition?: Position;
  uploaderRadio?: string;
  uploaderAntenna?: string;
  softwareName: string;
  softwareVersion: string;
  uploadRate: number;
  uploadTimeout: number;
  uploadRetries: number;
  developerMode: boolean;
}

export type UploaderOptions = Partial<Omit<UploaderConfig, 'uploaderCallsign'>> & Pick<UploaderConfig, 'uploaderCallsign'>;

export class Uploader {
    private uploaderConfig: UploaderConfig = {
      uploaderCallsign: '',
      uploadRate: 2,
      uploadTimeout: 20_000,
      uploadRetries: 5,
      developerMode: false,
      softwareName: 'node-sondehub',
      softwareVersion: '0.0.1',
    }

    private inputQueue: TelemetryPacket[] = [];

    public static readonly SONDEHUB_AMATEUR_URL = 'https://api.v2.sondehub.org/amateur/telemetry';
    public static readonly SONDEHUB_AMATEUR_STATION_POSITION_URL = 'https://api.v2.sondehub.org/amateur/listeners';

    constructor(options: UploaderOptions) {
      this.uploaderConfig = {
        ...this.uploaderConfig,
        ...options,
      }
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
          console.log(packets);
          const compressedPayload = gzipSync(JSON.stringify(packets));
            const headers = {
                'User-Agent': `${this.uploaderConfig.softwareName}-${this.uploaderConfig.softwareVersion}`,
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

    // public async uploadStationPosition(
    //     callsign: string,
    //     position: Position,
    //     radio?: string,
    //     antenna?: string,
    //     contactEmail?: string,
    //     mobile = false
    // ): Promise<void> {
    //     const payload = {
    //         software_name: this.softwareName,
    //         software_version: this.softwareVersion,
    //         uploader_callsign: callsign,
    //         uploader_position: position,
    //         uploader_radio: radio || this.uploaderRadio,
    //         uploader_antenna: antenna || this.uploaderAntenna,
    //         uploader_contact_email: contactEmail || '',
    //         mobile,
    //         dev: this.developerMode,
    //     };

    //     try {
    //         const response = await axios.put(Uploader.SONDEHUB_AMATEUR_STATION_POSITION_URL, payload, {
    //             headers: {
    //                 'User-Agent': `${this.softwareName}-${this.softwareVersion}`,
    //                 'Content-Type': 'application/json',
    //             },
    //             timeout: this.uploadTimeout * 1000,
    //         });

    //         if (response.status === 200) {
    //             this.logInfo('Station position uploaded successfully.');
    //         } else {
    //             this.logError(`Failed to upload station position. Status: ${response.status}, Message: ${response.statusText}`);
    //         }
    //     } catch (error) {
    //         this.logError(`Error uploading station position: ${error}`);
    //     }
    // }
    //

    private enhanceTelemetryPacket(packet: TelemetryPacket): TelemetryPacket {
      console.log('Config: ', this.uploaderConfig);
      const enhancedPacket = { ...packet };
      enhancedPacket.software_name = this.uploaderConfig.softwareName;
      enhancedPacket.software_version = this.uploaderConfig.softwareVersion;

      if (!packet.uploader_callsign) {
          enhancedPacket.uploader_callsign = this.uploaderConfig.uploaderCallsign;
      }

      if(!packet.uploader_position) {
        enhancedPacket.uploader_position = this.uploaderConfig.uploaderPosition;
      }

      if (!packet.time_received) {
        enhancedPacket.time_received = new Date().toISOString();
      }

      return enhancedPacket;
    }
}
