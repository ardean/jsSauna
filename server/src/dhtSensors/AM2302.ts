import { log } from "util";
import DHTSensor, { DHTSensorData } from "./DHTSensor";

let dhtSensor;
try {
  dhtSensor = require("node-dht-sensor");
} catch (err) {
  log("node-dht-sensor is not installed! Using test data!");
}

interface AM2302Options {
  round?: boolean;
}

export default class AM2302 implements DHTSensor {
  pin: number;
  type: number;
  round: boolean;

  constructor(pin: number, options?: AM2302Options) {
    this.pin = pin;

    options = options || {};
    this.type = 22;
    this.round = typeof options.round === "undefined" ? true : options.round;
  }

  async getData() {
    if (!dhtSensor) return this.doRound(
      30,
      20
      // getRandomArbitrary(0, 60),
      // getRandomArbitrary(0, 100)
    );

    return new Promise<DHTSensorData>((resolve, reject) => {
      dhtSensor.read(this.type, this.pin, (err, temperature, humidity) => {
        if (err) return reject(err);

        if (this.round) {
          temperature = roundTwo(temperature);
          humidity = Math.round(humidity);
        }

        resolve(this.doRound(temperature, humidity));
      });
    });
  }

  doRound(temperature, humidity): DHTSensorData {
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

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function roundTwo(value) {
  return Math.round(value * 100) / 100;
}
