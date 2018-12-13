import User from "./User";
import GPIO from "./GPIO";
import { log } from "util";
import Sauna from "./Sauna";
import Relay from "./Relay";
import { dev } from "./config";
import * as program from "commander";
import AM2302 from "./dhtSensors/AM2302";
import SaunaControl from "./SaunaControl";

log(`${dev ? "development" : "production"} mode`);

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
  .on("isHeating", (isHeating) => {
    log("sauna is " + (!isHeating ? "not " : "") + "heating");
  })
  .on("temperatureChange", (temperature) => {
    log("temperature at " + temperature.toFixed(0) + "°C");
  })
  .on("targetTemperatureChange", (targetTemperature) => {
    log("target temperature at " + targetTemperature.toFixed(0) + "°C");
  })
  .on("humidityChange", (humidity) => {
    log("humidity at " + humidity.toFixed(0) + "%");
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
    await GPIO.setDriveStrength(program.driveStrength);
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
