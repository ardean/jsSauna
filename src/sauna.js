import { EventEmitter } from "events";

export default class Sauna extends EventEmitter {
  constructor(options) {
    super();

    options = options || {};
    this.maxTemperature = options.maxTemperature || 60;
    this.dhtSensorsWatchInterval = options.dhtSensorsWatchInterval || 1000;
    this.dhtSensors = options.dhtSensors || [];
    this.relay = options.relay;
    this.isOn = false;
    this.isWatchingDhtSensors = false;
    this.setTargetTemperature(options.targetTemperature || 50);
  }

  init() {
    if (this.dhtSensors.length < 1) throw new Error("no dht sensors");
    if (!this.relay) throw new Error("no relay");

    this.relay.on("change", (isHeating) => {
      this.emit("isHeating", isHeating);
    });

    this.watchDhtSensors();
  }

  turnOn() {
    if (this.isOn) return;
    if (!this.isWatchingDhtSensors) throw new Error("can't turn on - dht sensor watching is disabled");
    this.isOn = true;

    this.handleTemperature();

    this.emit("turnOn");
  }

  turnOff() {
    if (!this.isOn) return;
    this.isOn = false;

    this.relay.turnOff();
    this.emit("turnOff");
  }

  destroy() {
    this.turnOff();
    this.unwatchDhtSensors();
  }

  setTargetTemperature(temperature) {
    temperature = Math.min(this.maxTemperature, temperature);
    this.targetTemperature = Math.max(0, temperature);
    this.emit("targetTemperatureChange", this.targetTemperature);
  }

  handleTemperature() {
    if (!this.isOn) return;
    if (this.temperature > this.targetTemperature) {
      return this.relay.turnOff();
    } else {
      return this.relay.turnOn();
    }
  }

  watchDhtSensors() {
    if (this.isWatchingDhtSensors) return;
    this.isWatchingDhtSensors = true;

    this.dhtSensorsWatchIntervalId = setInterval(() => {
      const dataPromises = this.dhtSensors.map((dhtSensor) => {
        return dhtSensor.getData();
      });

      Promise
        .all(dataPromises)
        .then((dataList) => {
          let totalTemperature = 0;
          let temperatureCount = 0;
          let totalHumidity = 0;
          let humidityCount = 0;

          dataList.forEach((data) => {
            if (data.temperature) {
              totalTemperature += data.temperature;
              ++temperatureCount;
            }

            if (data.humidity) {
              totalHumidity += data.humidity;
              ++humidityCount;
            }
          });

          const temperature = totalTemperature / temperatureCount;
          const humidity = totalHumidity / humidityCount;

          if (this.temperature !== temperature) {
            this.temperature = temperature;
            this.handleTemperature();
            this.emit("temperatureChange", temperature);
          }

          if (this.humidity !== humidity) {
            this.humidity = humidity;
            this.emit("humidityChange", humidity);
          }
        })
        .catch((err) => {
          this.destroy();
          this.emit("error", err);
        });
    }, this.dhtSensorsWatchInterval);
  }

  unwatchDhtSensors() {
    if (!this.isWatchingDhtSensors) return;
    this.isWatchingDhtSensors = false;
    clearInterval(this.dhtSensorsWatchIntervalId);
  }
}
