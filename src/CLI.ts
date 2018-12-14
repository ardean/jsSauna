import User from "./User";
import { log } from "util";
import Sauna from "./Sauna";
import Relay from "./Relay";
import { dev } from "./config";
import gpioUtil from "./gpioUtil";
import * as program from "commander";
import AM2302 from "./dhtSensors/AM2302";
import SaunaControl from "./SaunaControl";

const { version } = require("../package.json");

log(`${dev ? "development" : "production"} mode, v${version}`);

program
  .version(version)
  .option("-p, --port <port>", "override default webserver port", parseInt)
  .option("-t, --target-temperature <targetTemperature>", "override default target temperature (50°C)", parseInt)
  .option("-m, --max-temperature <maxTemperature>", "override default max temperature (60°C)", parseInt)
  .option("--rp, --relay-pin <relayPin>", "set relay pin", parseInt)
  .option("--sp, --sensor-pin <sensorPin>", "set dht sensor pin", parseInt)
  .option("--drive-strength <strength>", "set optional drive strength for gpio", parseInt)
  .option("--username <username>", "set username")
  .option("--pw <pw>", "set password")
  .parse(process.argv);

if (!dev) {
  if (typeof program.relayPin === "undefined") throw new Error("relayPin required");
  if (typeof program.sensorPin === "undefined") throw new Error("sensorPin required");
}

const sauna = new Sauna({
  targetTemperature: program.targetTemperature,
  maxTemperature: program.maxTemperature,
  relay: new Relay(program.relayPin),
  dhtSensors: [
    new AM2302(program.sensorPin)
  ]
});

sauna
  .on("error", (err) => {
    log(err);
  })
  .on("heatingChange", (heating: boolean) => {
    log(`sauna is ${!heating ? "not " : ""}heating`);
  })
  .on("temperatureChange", (temperature: number) => {
    log(`temperature at ${temperature}°C`);
  })
  .on("targetTemperatureChange", (targetTemperature: number) => {
    log(`target temperature at ${targetTemperature}°C`);
  })
  .on("humidityChange", (humidity: number) => {
    log(`humidity at ${humidity}%`);
  });

let users: User[];
if (program.username && program.pw) {
  users = [{
    username: program.username,
    password: program.pw
  }];
}

const saunaControl = new SaunaControl(sauna, {
  port: 80,
  users
});

(async () => {
  if (program.driveStrength) {
    await gpioUtil.setDriveStrength(program.driveStrength);
  }

  try {
    saunaControl.listen(program.port);
  } catch (err) {
    log(err);
  }
})();

process.on("SIGINT", () => {
  saunaControl.destroy();
  process.exit(0);
});
