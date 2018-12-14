/// <reference types="node" />
import { EventEmitter } from "events";
export default class Relay extends EventEmitter {
    pin: any;
    turnedOn: boolean;
    gpio: any;
    constructor(pin: number);
    turnOn(): boolean;
    turnOff(): boolean;
}
