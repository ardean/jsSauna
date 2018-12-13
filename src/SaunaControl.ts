import User from "./User";
import Sauna from "./Sauna";
import * as path from "path";
import { Server } from "http";
import * as crypto from "crypto";
import { Express } from "express";
import * as express from "express";
import * as socketIO from "socket.io";
import { EventEmitter } from "events";

const APP_PATH = path.resolve(path.dirname(require.resolve("jssauna-app/package.json")), "build");

interface SaunaControlOptions {
  users?: User[];
  port?: number;
  rootPath?: string;
  appFolder?: string;
}

export default class SaunaControl extends EventEmitter {
  users: User[];
  sauna: Sauna;
  port: number;
  rootPath: string;
  appFolder: string;
  app: Express;
  clients: socketIO.Socket[];
  sessionIds: string[];
  io: any;
  socket: Server;

  constructor(sauna: Sauna, options?: SaunaControlOptions) {
    super();

    this.sauna = sauna;
    if (!this.sauna) throw new Error("no_sauna_instance");

    options = options || {};
    this.users = options.users || [];
    this.port = options.port || 80;
    this.rootPath = options.rootPath || "/";
    this.appFolder = options.appFolder || APP_PATH;

    this.app = express();
    this.app.disable("x-powered-by");
    this.app.use(express.static(this.appFolder));
  }

  listen(port, fn?) {
    if (typeof port === "function") {
      fn = port;
      port = null;
    }

    this.socket = this.app.listen(port || this.port, () => {
      this.sauna.init();
      if (fn) fn();
    });

    this.clients = [];
    this.sessionIds = []; // TODO: should expire!

    const sendToAll = (eventName, data?) => {
      this.clients.forEach((client) => {
        client.emit(eventName, data);
      });
    };

    this.io = socketIO(this.socket, {
      path: fixWindowsPath(path.join("/", this.rootPath, "/sockets"))
    })
      .on("connection", (client) => {
        this.onConnection(client);
      });

    this.sauna
      .on("temperatureChange", (temperature) => {
        sendToAll("temperatureChange", temperature);
      })
      .on("humidityChange", (humidity) => {
        sendToAll("humidityChange", humidity);
      })
      .on("targetTemperatureChange", (targetTemperature) => {
        sendToAll("targetTemperatureChange", targetTemperature);
      })
      .on("turnOn", () => {
        sendToAll("turnOn");
      })
      .on("turnOff", () => {
        sendToAll("turnOff");
      });

    return this.socket;
  }

  onConnection(client) {
    this.clients.push(client);

    client.on("login", (data: { username: string, password: string }) => {
      const user = this.users.find(
        (x) => x.password === data.password && x.username === data.username
      );

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

    client
      .on("settings.load", () => {
        client.emit("settings.load.res", {
          on: this.sauna.turnedOn,
          loginRequired: !!this.users.length,
          temperature: this.sauna.temperature,
          humidity: this.sauna.humidity,
          targetTemperature: this.sauna.targetTemperature,
          maxTemperature: this.sauna.maxTemperature
        });
      })
      .on("settings.changeTargetTemperature", (targetTemperature: number) => {
        // if (this.users.length && !client.isLoggedIn) return;
        this.sauna.changeTargetTemperature(targetTemperature);
        client.emit("settings.changeTargetTemperature.res");
      })
      .on("settings.turnOn", () => {
        // if (this.users.length && !client.isLoggedIn) return;
        this.sauna.turnOn();
        client.emit("settings.turnOn.res");
      })
      .on("settings.turnOff", () => {
        // if (this.users.length && !client.isLoggedIn) return;
        this.sauna.turnOff();
        client.emit("settings.turnOff.res");
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
