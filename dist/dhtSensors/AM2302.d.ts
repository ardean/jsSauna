import DHTSensor, { DHTSensorData } from "./DHTSensor";
interface AM2302Options {
    round?: boolean;
}
export default class AM2302 implements DHTSensor {
    pin: number;
    round: boolean;
    gpio: any;
    constructor(pin: number, options?: AM2302Options);
    getData(): DHTSensorData;
    doRound(temperature: number, humidity: number): DHTSensorData;
}
export {};
