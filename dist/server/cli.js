"use strict";

var _child_process = require("child_process");

var _util = require("util");

var _ = require("./");

var _commander = require("commander");

var _commander2 = _interopRequireDefault(_commander);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version("0.1.0").option("-p, --port <port>", "override default webserver port", parseInt).option("-t, --target-temperature <targetTemperature>", "override default target temperature (50°C)", parseInt).option("-m, --max-temperature <maxTemperature>", "override default max temperature (60°C)", parseInt).option("--rp, --relay-pin <relayPin>", "set relay pin", parseInt).option("--sp, --sensor-pin <sensorPin>", "set dht sensor pin", parseInt).option("--drive-strength <strength>", "set optional drive strength for gpio", parseInt).option("--username <username>", "set username").option("--pw <pw>", "set password").parse(process.argv);

const sauna = new _.Sauna({
  targetTemperature: _commander2.default.targetTemperature,
  maxTemperature: _commander2.default.maxTemperature,
  relay: new _.Relay({
    pin: _commander2.default.relayPin
  }),
  dhtSensors: [new _.AM2302({
    pin: _commander2.default.sensorPin
  })]
});

sauna.on("error", err => {
  (0, _util.log)(err);
}).on("isHeating", isHeating => {
  (0, _util.log)("sauna is " + (!isHeating ? "not " : "") + "heating");
}).on("temperatureChange", temperature => {
  (0, _util.log)("temperature at " + temperature.toFixed(0) + "°C");
}).on("targetTemperatureChange", targetTemperature => {
  (0, _util.log)("target temperature at " + targetTemperature.toFixed(0) + "°C");
}).on("humidityChange", humidity => {
  (0, _util.log)("humidity at " + humidity.toFixed(0) + "%");
});

let users;
if (_commander2.default.username && _commander2.default.pw) {
  users = [{
    name: _commander2.default.username,
    pw: _commander2.default.pw
  }];
}

const saunaControl = new _.SaunaControl({
  port: 80,
  sauna: sauna,
  users: users
});

Promise.resolve().then(() => {
  if (_commander2.default.driveStrength) {
    return setDriveStrength(_commander2.default.driveStrength);
  }
}).catch(err => {
  (0, _util.log)("error while setting drive strength", err);
}).then(() => {
  saunaControl.listen(_commander2.default.port);
}).catch(err => {
  (0, _util.log)(err);
});

process.on("SIGINT", () => {
  saunaControl.destroy();
  process.exit(0);
});

function setDriveStrength(strength = 7) {
  return new Promise((resolve, reject) => {
    (0, _util.log)("setting drive strength to " + strength);
    (0, _child_process.exec)("gpio drive 0 " + strength, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve();
    });
  });
}