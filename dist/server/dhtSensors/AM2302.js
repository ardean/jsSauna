"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
let dhtSensor;
try {
    dhtSensor = require("node-dht-sensor");
}
catch (err) {
    util_1.log("node-dht-sensor is not installed! Using test data!");
}
class AM2302 {
    constructor(pin, options) {
        this.pin = pin;
        options = options || {};
        this.type = 22;
        this.round = typeof options.round === "undefined" ? true : options.round;
    }
    getData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!dhtSensor)
                return this.doRound(30, 20);
            return new Promise((resolve, reject) => {
                dhtSensor.read(this.type, this.pin, (err, temperature, humidity) => {
                    if (err)
                        return reject(err);
                    if (this.round) {
                        temperature = roundTwo(temperature);
                        humidity = Math.round(humidity);
                    }
                    resolve(this.doRound(temperature, humidity));
                });
            });
        });
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