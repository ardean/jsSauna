"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require("util");

var _events = require("events");

let Gpio;
try {
  Gpio = require("onoff").Gpio;
} catch (e) {
  (0, _util.log)("onoff is not installed! Ignoring On / Off requests!");
}

class Relay extends _events.EventEmitter {
  constructor(options) {
    super();

    options = options || {};
    this.pin = options.pin;
    this.isOn = false;
    this.core = Gpio && new Gpio(this.pin, "out");
  }

  turnOn() {
    if (this.isOn) return;
    this.isOn = true;

    return new Promise((resolve, reject) => {
      if (!this.core) return resolve();

      this.core.write(1, err => {
        if (err) return reject(err);
        resolve();
      });
    }).then(() => {
      this.emit("change", this.isOn);
    }).catch(err => {
      this.isOn = false;
      throw err;
    });
  }

  turnOff() {
    if (!this.isOn) return;
    this.isOn = false;

    return new Promise((resolve, reject) => {
      if (!this.core) return resolve();

      this.core.write(0, err => {
        if (err) return reject(err);
        resolve();
      });
    }).then(() => {
      this.emit("change", this.isOn);
    }).catch(err => {
      this.isOn = true;
      throw err;
    });
  }
}
exports.default = Relay;