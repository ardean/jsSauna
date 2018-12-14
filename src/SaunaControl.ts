import User from "./User";
import Sauna from "./Sauna";
import * as path from "path";
import Client from "./Client";
import { Server } from "http";
import { Express } from "express";
import * as express from "express";
import * as socketIO from "socket.io";
import { EventEmitter } from "events";
import * as Random from "meteor-random";

const APP_PATH = path.resolve(path.dirname(require.resolve("jssauna-app/package.json")), "build");

interface SaunaControlOptions {
  users?: User[];
  port?: number;
  rootPath?: string;
  appFolder?: string;
}

export default class SaunaControl extends EventEmitter {
  app: Express;
  port: number;
  sauna: Sauna;
  users: User[];
  socket: Server;
  rootPath: string;
  clients: Client[];
  appFolder: string;
  sessionIds: string[];
  io: socketIO.Namespace;
  loginRequired: boolean;

  constructor(sauna: Sauna, options?: SaunaControlOptions) {
    super();

    this.sauna = sauna;
    if (!this.sauna) throw new Error("no_sauna_instance");

    options = options || {};
    this.users = options.users || [];
    this.loginRequired = this.users.length > 0;
    this.port = options.port || 80;
    this.rootPath = options.rootPath || "/";
    this.appFolder = options.appFolder || APP_PATH;

    this.app = express();
    this.app.disable("x-powered-by");
    this.app.use(express.static(this.appFolder));
  }

  listen(port: number, callback?: () => any) {
    if (typeof port === "function") {
      callback = port;
      port = null;
    }

    this.socket = this.app.listen(port || this.port, () => {
      this.sauna.init();
      if (callback) callback();
    });

    this.clients = [];
    this.sessionIds = []; // TODO: should expire!

    const sendToAll = (eventName, data?) => {
      this.clients.forEach(client => {
        client.socket.emit(eventName, data);
      });
    };

    this.io = socketIO(this.socket, {
      path: fixWindowsPath(path.join("/", this.rootPath, "/sockets"))
    })
      .on("connection", (client: socketIO.Socket) => {
        this.onConnection(client);
      });

    this.sauna
      .on("temperatureChange", (temperature: number) => {
        sendToAll("temperatureChange", temperature);
      })
      .on("humidityChange", (humidity: number) => {
        sendToAll("humidityChange", humidity);
      })
      .on("heatingChange", (heating: boolean) => {
        sendToAll("heatingChange", heating);
      })
      .on("targetTemperatureChange", (targetTemperature) => {
        sendToAll("targetTemperatureChange", targetTemperature);
      })
      .on("turnOn", () => {
        sendToAll("onChange", true);
      })
      .on("turnOff", () => {
        sendToAll("onChange", false);
      });

    return this.socket;
  }

  onConnection(socket: socketIO.Socket) {
    const client: Client = {
      socket,
      loggedIn: false
    };
    this.clients.push(client);

    socket.on("login", (data: { username: string, password: string }) => {
      const user = this.users.find(
        (x) => x.password === data.password && x.username === data.username
      );

      if (user) {
        const sessionId = Random.secret();
        this.sessionIds.push(sessionId);

        client.sessionId = sessionId;
        client.user = user;
        client.loggedIn = true;
      } else {
        client.sessionId = null;
        client.user = null;
        client.loggedIn = false;
      }

      socket.emit("login.res", client.loggedIn ? client.sessionId : false);
    });

    socket
      .on("check", (sessionId?: string) => {
        let loggedIn = false;
        if (this.loginRequired) {
          client.loggedIn = loggedIn = this.sessionIds.indexOf(sessionId) > -1;
        }

        const settings = {
          on: this.sauna.turnedOn,
          targetTemperature: this.sauna.targetTemperature
        };

        const status = {
          loginRequired: this.loginRequired,
          temperature: this.sauna.temperature,
          humidity: this.sauna.humidity,
          heating: this.sauna.heating,
          loggedIn,
          maxTemperature: this.sauna.maxTemperature
        };

        socket.emit("check.res", {
          settings,
          status
        });
      })
      .on("settings.changeTargetTemperature", (targetTemperature: number) => {
        if (this.loginRequired && !client.loggedIn) return socket.emit("settings.changeTargetTemperature.err", new Error("not_allowed"));
        this.sauna.changeTargetTemperature(targetTemperature);
        socket.emit("settings.changeTargetTemperature.res");
      })
      .on("settings.changeOn", (on: boolean) => {
        if (this.loginRequired && !client.loggedIn) return socket.emit("settings.turnOn.err", new Error("not_allowed"));
        if (on) this.sauna.turnOn();
        else this.sauna.turnOff();
        socket.emit("settings.changeOn.res");
      });

    socket.once("disconnect", () => {
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