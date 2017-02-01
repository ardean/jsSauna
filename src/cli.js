import { exec } from "child_process";
import { log } from "util";
import { Sauna, SaunaControl, AM2302, Relay } from "./";
import program from "commander";

program
  .version("0.1.0")
  .option("-p, --port <port>", "override default webserver port", parseInt)
  .option("-t, --target-temperature <targetTemperature>", "override default target temperature (50°C)", parseInt)
  .option("-m, --max-temperature <maxTemperature>", "override default max temperature (60°C)", parseInt)
  .option("--rp, --relay-pin <relayPin>", "set relay pin", parseInt)
  .option("--sp, --sensor-pin <sensorPin>", "set dht sensor pin", parseInt)
  .option("--drive-strength <strength>", "set optional drive strength for gpio", parseInt)
  .option("--username <username>", "set username")
  .option("--pw <pw>", "set password")
  .parse(process.argv);

const sauna = new Sauna({
  targetTemperature: program.targetTemperature,
  maxTemperature: program.maxTemperature,
  relay: new Relay({
    pin: program.relayPin
  }),
  dhtSensors: [
    new AM2302({
      pin: program.sensorPin
    })
  ]
});

sauna.on("error", (err) => {
  log(err);
}).on("isHeating", (isHeating) => {
  log("sauna is " + (!isHeating ? "not " : "") + "heating");
}).on("temperatureChange", (temperature) => {
  log("temperature at " + temperature.toFixed(0) + "°C");
}).on("targetTemperatureChange", (targetTemperature) => {
  log("target temperature at " + targetTemperature.toFixed(0) + "°C");
}).on("humidityChange", (humidity) => {
  log("humidity at " + humidity.toFixed(0) + "%");
});

let users;
if (program.username && program.pw) {
  users = [{
    name: program.username,
    pw: program.pw
  }];
}

const saunaControl = new SaunaControl({
  port: 80,
  sauna: sauna,
  users: users
});

Promise
  .resolve()
  .then(() => {
    if (program.driveStrength) {
      return setDriveStrength(program.driveStrength);
    }
  })
  .catch((err) => {
    log("error while setting drive strength", err);
  })
  .then(() => {
    saunaControl.listen(program.port);
  })
  .catch((err) => {
    log(err);
  });

process.on("SIGINT", () => {
  saunaControl.destroy();
  process.exit(0);
});

function setDriveStrength(strength = 7) {
  return new Promise((resolve, reject) => {
    log("setting drive strength to " + strength);
    exec("gpio drive 0 " + strength, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
