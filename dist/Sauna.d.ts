/// <reference types="node" />
import Relay from "./Relay";
import { EventEmitter } from "events";
import DHTSensor from "./dhtSensors/DHTSensor";
export interface SaunaOptions {
    maxTemperature?: number;
    dhtSensorsWatchInterval?: number;
    dhtSensors?: DHTSensor[];
    relay?: Relay;
    targetTemperature?: number;
}
export default class Sauna extends EventEmitter {
    maxTemperature: number;
    dhtSensorsWatchInterval: number;
    dhtSensors: DHTSensor[];
    relay: Relay;
    turnedOn: boolean;
    watchingDhtSensors: boolean;
    targetTemperature: number;
    temperature: number;
    dhtSensorsWatchIntervalId: NodeJS.Timeout;
    humidity: number;
    heating: boolean;
    constructor(options?: SaunaOptions);
    init(): void;
    turnOn(): void;
    turnOff(): void;
    destroy(): void;
    changeTargetTemperature(targetTemperature: number): void;
    handleTemperature(): boolean;
    watchDhtSensors(): Promise<void>;
    checkDHTSensors: () => Promise<void>;
    unwatchDhtSensors(): void;
}
