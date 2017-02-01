"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require("util");

let dhtSensor;
try {
  dhtSensor = require("node-dht-sensor");
} catch (e) {
  (0, _util.log)("node-dht-sensor is not installed! Using test data!");
}

class AM2302 {
  constructor(options) {
    options = options || {};
    this.pin = options.pin;
    this.type = 22;
    this.round = typeof options.round === "undefined" ? true : options.round;
  }

  getData() {
    return new Promise((resolve, reject) => {
      if (!dhtSensor) return resolve(this.doRound(30, 20
      // getRandomArbitrary(0, 60),
      // getRandomArbitrary(0, 100)
      ));

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

  doRound(temperature, humidity) {
    if (this.round) {
      temperature = roundTwo(temperature);
      humidity = Math.round(humidity);
    }

    return {
      temperature: temperature,
      humidity: humidity
    };
  }
}

exports.default = AM2302;
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function roundTwo(value) {
  return Math.round(value * 100) / 100;
}