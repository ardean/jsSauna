import { log } from "util";
import { EventEmitter } from "events";

let Gpio;
try {
  Gpio = require("onoff").Gpio;
} catch (err) {
  log("onoff is not installed! Ignoring On / Off requests!");
}

export interface RelayOptions {
  pin?: number;
}

export default class Relay extends EventEmitter {
  pin: any;
  turnedOn: boolean;
  core: any;

  constructor(options?: RelayOptions) {
    super();

    options = options || {};
    this.pin = options.pin;
    this.turnedOn = false;
    this.core = Gpio && new Gpio(this.pin, "out");
  }

  turnOn() {
    if (this.turnedOn) return;
    this.turnedOn = true;

    return new Promise((resolve, reject) => {
      if (!this.core) return resolve();

      this.core.write(1, (err) => {
        if (err) return reject(err);
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
    if (!this.turnedOn) return;
    this.turnedOn = false;

    return new Promise((resolve, reject) => {
      if (!this.core) return resolve();

      this.core.write(0, (err) => {
        if (err) return reject(err);
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
