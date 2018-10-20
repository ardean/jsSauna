import { log } from "util";
import DHTSensor, { DHTSensorData } from "./DHTSensor";

let dhtSensor;
try {
  dhtSensor = require("node-dht-sensor");
} catch (err) {
  log("node-dht-sensor is not installed! Using test data!");
}

export default class AM2302 implements DHTSensor {
  pin: any;
  type: number;
  round: any;

  constructor(options) {
    options = options || {};
    this.pin = options.pin;
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
