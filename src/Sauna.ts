import Relay from "./Relay";
import { EventEmitter } from "events";
import DHTSensor from "./dhtSensors/DHTSensor";

export interface SaunaOptions {
  maxTemperature?: number;
  dhtSensorsWatchInterval?: number;
  dhtSensors?: DHTSensor[];
  relay?: Relay;
  targetTemperature?: number;
}

export default class Sauna extends EventEmitter {
  maxTemperature: number;
  dhtSensorsWatchInterval: number;
  dhtSensors: DHTSensor[];
  relay: Relay;
  turnedOn: boolean;
  watchingDhtSensors: boolean;
  targetTemperature: number;
  temperature: number;
  dhtSensorsWatchIntervalId: NodeJS.Timeout;
  humidity: number;

  constructor(options?: SaunaOptions) {
    super();

    options = options || {};
    this.maxTemperature = options.maxTemperature || 60;
    this.dhtSensorsWatchInterval = options.dhtSensorsWatchInterval || 1000;
    this.dhtSensors = options.dhtSensors || [];
    this.relay = options.relay;
    this.turnedOn = false;
    this.watchingDhtSensors = false;
    this.changeTargetTemperature(options.targetTemperature || 50);
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
    if (this.turnedOn) return;
    if (!this.watchingDhtSensors) throw new Error("can't turn on - dht sensor watching is disabled");
    this.turnedOn = true;

    this.handleTemperature();

    this.emit("turnOn");
  }

  turnOff() {
    if (!this.turnedOn) return;
    this.turnedOn = false;

    this.relay.turnOff();
    this.emit("turnOff");
  }

  destroy() {
    this.turnOff();
    this.unwatchDhtSensors();
  }

  changeTargetTemperature(targetTemperature: number) {
    targetTemperature = Math.min(this.maxTemperature, targetTemperature);
    this.targetTemperature = Math.max(0, targetTemperature);
    this.emit("targetTemperatureChange", this.targetTemperature);
  }

  handleTemperature() {
    if (!this.turnedOn) return;
    if (this.temperature > this.targetTemperature) {
      return this.relay.turnOff();
    } else {
      return this.relay.turnOn();
    }
  }

  async watchDhtSensors() {
    if (this.watchingDhtSensors) return;
    this.watchingDhtSensors = true;

    this.dhtSensorsWatchIntervalId = setInterval(async () => {
      try {
        await this.checkDHTSensors();
      } catch (err) {
        this.destroy();
        this.emit("error", err);
      }
    }, this.dhtSensorsWatchInterval);
  }

  checkDHTSensors = async () => {
    const dataPromises = this.dhtSensors.map(dhtSensor => dhtSensor.getData());

    const dhtSensorDataList = await Promise.all(dataPromises);
    let totalTemperature = 0;
    let temperatureCount = 0;
    let totalHumidity = 0;
    let humidityCount = 0;

    for (const dhtSensorData of dhtSensorDataList) {
      if (dhtSensorData.temperature) {
        totalTemperature += dhtSensorData.temperature;
        ++temperatureCount;
      }

      if (dhtSensorData.humidity) {
        totalHumidity += dhtSensorData.humidity;
        ++humidityCount;
      }
    }

    let temperature = totalTemperature / temperatureCount;
    if (this.temperature !== temperature) {
      if (isNaN(temperature)) temperature = 0;

      this.temperature = temperature;
      this.handleTemperature();
      this.emit("temperatureChange", temperature);
    }

    let humidity = totalHumidity / humidityCount;
    if (this.humidity !== humidity) {
      if (isNaN(humidity)) humidity = 0;

      this.humidity = humidity;
      this.emit("humidityChange", humidity);
    }
  }

  unwatchDhtSensors() {
    if (!this.watchingDhtSensors) return;
    this.watchingDhtSensors = false;
    clearInterval(this.dhtSensorsWatchIntervalId);
  }
}
