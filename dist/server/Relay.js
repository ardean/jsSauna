"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const events_1 = require("events");
let Gpio;
try {
    Gpio = require("onoff").Gpio;
}
catch (err) {
    util_1.log("onoff is not installed! Ignoring On / Off requests!");
}
class Relay extends events_1.EventEmitter {
    constructor(options) {
        super();
        options = options || {};
        this.pin = options.pin;
        this.turnedOn = false;
        this.core = Gpio && new Gpio(this.pin, "out");
    }
    turnOn() {
        if (this.turnedOn)
            return;
        this.turnedOn = true;
        return new Promise((resolve, reject) => {
            if (!this.core)
                return resolve();
            this.core.write(1, (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        }).then(() => {
            this.emit("change", this.turnedOn);
        }).catch((err) => {
            this.turnedOn = false;
            throw err;
        });
    }
    turnOff() {
        if (!this.turnedOn)
            return;
        this.turnedOn = false;
        return new Promise((resolve, reject) => {
            if (!this.core)
                return resolve();
            this.core.write(0, (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        }).then(() => {
            this.emit("change", this.turnedOn);
        }).catch((err) => {
            this.turnedOn = true;
            throw err;
        });
    }
}
exports.default = Relay;
//# sourceMappingURL=Relay.js.map