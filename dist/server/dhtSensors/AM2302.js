"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
let rpiDhtSensor;
try {
    rpiDhtSensor = require("rpi-dht-sensor");
}
catch (err) {
    util_1.log("rpi-dht-sensor is not installed! Using test data!");
}
class AM2302 {
    constructor(pin, options) {
        this.pin = pin;
        options = options || {};
        this.round = typeof options.round === "undefined" ? true : options.round;
        this.gpio = new rpiDhtSensor.DHT22(this.pin);
    }
    getData() {
        if (!rpiDhtSensor)
            return this.doRound(30, 20);
        let { temperature, humidity } = this.gpio.read();
        if (this.round) {
            temperature = roundTwo(temperature);
            humidity = Math.round(humidity);
        }
        return this.doRound(temperature, humidity);
    }
    doRound(temperature, humidity) {
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
exports.default = AM2302;
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
function roundTwo(value) {
    return Math.round(value * 100) / 100;
}
//# sourceMappingURL=AM2302.js.map