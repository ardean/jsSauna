import { log } from "util";
import { EventEmitter } from "events";

let Gpio;
try {
  Gpio = require("onoff").Gpio;
} catch (err) {
  log("onoff is not installed! Ignoring On / Off requests!");
}

export default class Relay extends EventEmitter {
  pin: any;
  turnedOn: boolean;
  gpio: any;

  constructor(pin: number) {
    super();

    this.pin = pin;
    this.turnedOn = false;
    if (Gpio) this.gpio = new Gpio(this.pin, "out");
  }

  turnOn() {
    if (this.turnedOn) return;
    this.turnedOn = true;

    if (!this.gpio) return;

    try {
      this.gpio.writeSync(1);
      this.emit("change", this.turnedOn);
    } catch (err) {
      this.turnedOn = false;
      throw err;
    }
  }

  turnOff() {
    if (!this.turnedOn) return;
    this.turnedOn = false;

    if (!this.gpio) return;

    try {
      this.gpio.writeSync(0);
      this.emit("change", this.turnedOn);
    } catch (err) {
      this.turnedOn = true;
      throw err;
    }
  }
}
