"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GPIO_1 = require("./GPIO");
const util_1 = require("util");
const Sauna_1 = require("./Sauna");
const Relay_1 = require("./Relay");
const config_1 = require("./config");
const program = require("commander");
const AM2302_1 = require("./dhtSensors/AM2302");
const SaunaControl_1 = require("./SaunaControl");
util_1.log(`${config_1.dev ? "development" : "production"} mode`);
program
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
if (!config_1.dev) {
    if (typeof program.relayPin === "undefined")
        throw new Error("relayPin required");
    if (typeof program.sensorPin === "undefined")
        throw new Error("sensorPin required");
}
const sauna = new Sauna_1.default({
    targetTemperature: program.targetTemperature,
    maxTemperature: program.maxTemperature,
    relay: new Relay_1.default(program.relayPin),
    dhtSensors: [
        new AM2302_1.default(program.sensorPin)
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
if (program.username && program.pw) {
    users = [{
            username: program.username,
            password: program.pw
        }];
}
const saunaControl = new SaunaControl_1.default(sauna, {
    port: 80,
    users
});
(async () => {
    if (program.driveStrength) {
        await GPIO_1.default.setDriveStrength(program.driveStrength);
    }
    try {
        saunaControl.listen(program.port);
    }
    catch (err) {
        util_1.log(err);
    }
})();
process.on("SIGINT", () => {
    saunaControl.destroy();
    process.exit(0);
});
//# sourceMappingURL=CLI.js.map