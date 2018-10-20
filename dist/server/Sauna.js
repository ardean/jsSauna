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
const events_1 = require("events");
class Sauna extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.checkDHTSensors = () => __awaiter(this, void 0, void 0, function* () {
            const dataPromises = this.dhtSensors.map(dhtSensor => dhtSensor.getData());
            const dhtSensorDataList = yield Promise.all(dataPromises);
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
                if (isNaN(temperature))
                    temperature = 0;
                this.temperature = temperature;
                this.handleTemperature();
                this.emit("temperatureChange", temperature);
            }
            let humidity = totalHumidity / humidityCount;
            if (this.humidity !== humidity) {
                if (isNaN(humidity))
                    humidity = 0;
                this.humidity = humidity;
                this.emit("humidityChange", humidity);
            }
        });
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
        if (this.dhtSensors.length < 1)
            throw new Error("no dht sensors");
        if (!this.relay)
            throw new Error("no relay");
        this.relay.on("change", (isHeating) => {
            this.emit("isHeating", isHeating);
        });
        this.watchDhtSensors();
    }
    turnOn() {
        if (this.turnedOn)
            return;
        if (!this.watchingDhtSensors)
            throw new Error("can't turn on - dht sensor watching is disabled");
        this.turnedOn = true;
        this.handleTemperature();
        this.emit("turnOn");
    }
    turnOff() {
        if (!this.turnedOn)
            return;
        this.turnedOn = false;
        this.relay.turnOff();
        this.emit("turnOff");
    }
    destroy() {
        this.turnOff();
        this.unwatchDhtSensors();
    }
    changeTargetTemperature(targetTemperature) {
        targetTemperature = Math.min(this.maxTemperature, targetTemperature);
        this.targetTemperature = Math.max(0, targetTemperature);
        this.emit("targetTemperatureChange", this.targetTemperature);
    }
    handleTemperature() {
        if (!this.turnedOn)
            return;
        if (this.temperature > this.targetTemperature) {
            return this.relay.turnOff();
        }
        else {
            return this.relay.turnOn();
        }
    }
    watchDhtSensors() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.watchingDhtSensors)
                return;
            this.watchingDhtSensors = true;
            this.dhtSensorsWatchIntervalId = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.checkDHTSensors();
                }
                catch (err) {
                    this.destroy();
                    this.emit("error", err);
                }
            }), this.dhtSensorsWatchInterval);
        });
    }
    unwatchDhtSensors() {
        if (!this.watchingDhtSensors)
            return;
        this.watchingDhtSensors = false;
        clearInterval(this.dhtSensorsWatchIntervalId);
    }
}
exports.default = Sauna;
//# sourceMappingURL=Sauna.js.map