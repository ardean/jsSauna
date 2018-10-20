"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const commander_1 = __importDefault(require("commander"));
const GPIO_1 = __importDefault(require("./GPIO"));
const Sauna_1 = __importDefault(require("./Sauna"));
const Relay_1 = __importDefault(require("./Relay"));
const config_1 = require("./config");
const AM2302_1 = __importDefault(require("./dhtSensors/AM2302"));
const SaunaControl_1 = __importDefault(require("./SaunaControl"));
util_1.log(`${config_1.dev ? "development" : "production"} mode`);
commander_1.default
    .version("0.2.0")
    .option("-p, --port <port>", "override default webserver port", parseInt)
    .option("-t, --target-temperature <targetTemperature>", "override default target temperature (50°C)", parseInt)
    .option("-m, --max-temperature <maxTemperature>", "override default max temperature (60°C)", parseInt)
    .option("--rp, --relay-pin <relayPin>", "set relay pin", parseInt)
    .option("--sp, --sensor-pin <sensorPin>", "set dht sensor pin", parseInt)
    .option("--drive-strength <strength>", "set optional drive strength for gpio", parseInt)
    .option("--username <username>", "set username")
    .option("--pw <pw>", "set password")
    .parse(process.argv);
if (typeof commander_1.default.relayPin === "undefined")
    throw new Error("relayPin required");
if (typeof commander_1.default.sensorPin === "undefined")
    throw new Error("sensorPin required");
const sauna = new Sauna_1.default({
    targetTemperature: commander_1.default.targetTemperature,
    maxTemperature: commander_1.default.maxTemperature,
    relay: new Relay_1.default(commander_1.default.relayPin),
    dhtSensors: [
        new AM2302_1.default(commander_1.default.sensorPin)
    ]
});
sauna
    .on("error", (err) => {
    util_1.log(err);
})
    .on("isHeating", (isHeating) => {
    util_1.log("sauna is " + (!isHeating ? "not " : "") + "heating");
})
    .on("temperatureChange", (temperature) => {
    util_1.log("temperature at " + temperature.toFixed(0) + "°C");
})
    .on("targetTemperatureChange", (targetTemperature) => {
    util_1.log("target temperature at " + targetTemperature.toFixed(0) + "°C");
})
    .on("humidityChange", (humidity) => {
    util_1.log("humidity at " + humidity.toFixed(0) + "%");
});
let users;
if (commander_1.default.username && commander_1.default.pw) {
    users = [{
            username: commander_1.default.username,
            password: commander_1.default.pw
        }];
}
const saunaControl = new SaunaControl_1.default(sauna, {
    port: 80,
    users
});
(() => __awaiter(this, void 0, void 0, function* () {
    if (commander_1.default.driveStrength) {
        yield GPIO_1.default.setDriveStrength(commander_1.default.driveStrength);
    }
    try {
        saunaControl.listen(commander_1.default.port);
    }
    catch (err) {
        util_1.log(err);
    }
}))();
process.on("SIGINT", () => {
    saunaControl.destroy();
    process.exit(0);
});
//# sourceMappingURL=CLI.js.map