import { log } from "util";
import DHTSensor, { DHTSensorData } from "./DHTSensor";

let rpiDhtSensor;
try {
  rpiDhtSensor = require("rpi-dht-sensor");
} catch (err) {
  log("rpi-dht-sensor is not installed! Using test data!");
}

interface AM2302Options {
  round?: boolean;
}

export default class AM2302 implements DHTSensor {
  pin: number;
  round: boolean;
  gpio: any;

  constructor(pin: number, options?: AM2302Options) {
    this.pin = pin;

    options = options || {};
    this.round = typeof options.round === "undefined" ? true : options.round;
    if (rpiDhtSensor) this.gpio = new rpiDhtSensor.DHT22(this.pin);
  }

  getData() {
    if (!rpiDhtSensor) return this.doRound(
      30,
      20
      // getRandomArbitrary(0, 60),
      // getRandomArbitrary(0, 100)
    );

    let { temperature, humidity } = this.gpio.read();

    if (this.round) {
      temperature = roundTwo(temperature);
      humidity = Math.round(humidity);
    }

    return this.doRound(temperature, humidity);
  }

  doRound(temperature: number, humidity: number): DHTSensorData {
    if (this.round) {
      temperature = roundTwo(temperature);
      humidity = Math.round(humidity);
    }

    return {
      temperature,
      humidity
    };
  }
}

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function roundTwo(value: number) {
  return Math.round(value * 100) / 100;
}
