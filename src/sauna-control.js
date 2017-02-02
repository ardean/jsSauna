import path from "path";
import crypto from "crypto";
import express from "express";
import socketIO from "socket.io";
import { EventEmitter } from "events";
import { log } from "util";

export default class SaunaControl extends EventEmitter {
  constructor(options) {
    super();

    options = options || {};
    this.users = options.users || [];
    this.sauna = options.sauna;
    this.port = options.port ||  80;
    this.rootPath = options.rootPath || "/";
    this.publicFolder = options.publicFolder || fixWindowsPath(path.join(__dirname, "../public"));

    if (!this.sauna) throw new Error("no sauna!");

    this.app = express();
    this.app.disable("x-powered-by");
    this.app.use(express.static(this.publicFolder));
  }

  listen(port, fn) {
    if (typeof port === "function") {
      fn = port;
      port = null;
    }

    fn = fn || function () {};

    this.socket = this.app.listen(port || this.port, () => {
      this.sauna.init();
      fn();
    });

    this.clients = [];
    this.sessionIds = []; // TODO: should expire!

    const sendToAll = (eventName, data) => {
      this.clients.forEach((client) => {
        client.emit(eventName, data);
      });
    };

    this.io = socketIO(this.socket, {
      path: fixWindowsPath(path.join("/", this.rootPath, "/sockets"))
    }).on("connection", (client) => {
      this.onConnection(client);
    });

    this.sauna.on("temperatureChange", (temperature) => {
      sendToAll("temperatureChange", temperature);
    }).on("humidityChange", (humidity) => {
      sendToAll("humidityChange", humidity);
    }).on("targetTemperatureChange", (targetTemperature) => {
      sendToAll("targetTemperatureChange", targetTemperature);
    }).on("turnOn", () => {
      sendToAll("turnOn");
    }).on("turnOff", () => {
      sendToAll("turnOff");
    });

    return this.socket;
  }

  onConnection(client) {
    this.clients.push(client);

    client.on("login", (data) => {
      const user = this.users.find((user) => {
        return user.pw === data.pw && user.name === data.username;
      });

      if (user) {
        const sessionId = generateSessionId();
        this.sessionIds.push(sessionId);
        client.sessionId = sessionId;
        client.user = user;
        client.isLoggedIn = true;
      }

      client.emit("login.res", client.isLoggedIn ? client.sessionId : false);
    });

    client.on("sId", (sessionId) => {
      const sessionExists = this.sessionIds.indexOf(sessionId) > -1;
      client.isLoggedIn = sessionExists;
      client.emit("sId.res", sessionExists);
    });

    client.on("settings", () => {
      client.emit("settings.res", {
        isOn: this.sauna.isOn,
        isLoginRequired: !!this.users.length,
        temperature: this.sauna.temperature,
        humidity: this.sauna.humidity,
        targetTemperature: this.sauna.targetTemperature,
        maxTemperature: this.sauna.maxTemperature
      });
    });

    client.on("setTargetTemperature", (targetTemperature) => {
      if (this.users.length && !client.isLoggedIn) return;
      this.sauna.setTargetTemperature(targetTemperature);
    }).on("setSaunaOn", () => {
      if (this.users.length && !client.isLoggedIn) return;
      this.sauna.turnOn();
    }).on("setSaunaOff", () => {
      if (this.users.length && !client.isLoggedIn) return;
      this.sauna.turnOff();
    });

    client.once("disconnect", () => {
      const index = this.clients.indexOf(client);
      if (index < 0) return;
      this.clients.splice(0, index);
    });
  }

  destroy() {
    this.sauna.destroy();
    this.socket.close();
    this.emit("stop");
  }
}

function fixWindowsPath(url) {
  return url.replace(/\\/g, "/");
}

function generateSessionId() {
  const sha = crypto.createHash("sha256");
  sha.update(Math.random().toString());
  return sha.digest("hex");
}
