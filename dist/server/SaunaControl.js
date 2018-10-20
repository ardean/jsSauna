"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = __importDefault(require("socket.io"));
const events_1 = require("events");
class SaunaControl extends events_1.EventEmitter {
    constructor(sauna, options) {
        super();
        this.sauna = sauna;
        if (!this.sauna)
            throw new Error("no_sauna_instance");
        options = options || {};
        this.users = options.users || [];
        this.port = options.port || 80;
        this.rootPath = options.rootPath || "/";
        this.appFolder = options.appFolder || fixWindowsPath(path.join(__dirname, "../app"));
        this.app = express_1.default();
        this.app.disable("x-powered-by");
        this.app.use(express_1.default.static(this.appFolder));
    }
    listen(port, fn) {
        if (typeof port === "function") {
            fn = port;
            port = null;
        }
        this.socket = this.app.listen(port || this.port, () => {
            this.sauna.init();
            if (fn)
                fn();
        });
        this.clients = [];
        this.sessionIds = [];
        const sendToAll = (eventName, data) => {
            this.clients.forEach((client) => {
                client.emit(eventName, data);
            });
        };
        this.io = socket_io_1.default(this.socket, {
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
        client.on("login", (data) => {
            const user = this.users.find(x => x.password === data.password && x.username === data.username);
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
            .on("settings.changeTargetTemperature", (targetTemperature) => {
            this.sauna.changeTargetTemperature(targetTemperature);
            client.emit("settings.changeTargetTemperature.res");
        })
            .on("settings.turnOn", () => {
            this.sauna.turnOn();
            client.emit("settings.turnOn.res");
        })
            .on("settings.turnOff", () => {
            this.sauna.turnOff();
            client.emit("settings.turnOff.res");
        });
        client.once("disconnect", () => {
            const index = this.clients.indexOf(client);
            if (index < 0)
                return;
            this.clients.splice(0, index);
        });
    }
    destroy() {
        this.sauna.destroy();
        this.socket.close();
        this.emit("stop");
    }
}
exports.default = SaunaControl;
function fixWindowsPath(url) {
    return url.replace(/\\/g, "/");
}
function generateSessionId() {
    const sha = crypto.createHash("sha256");
    sha.update(Math.random().toString());
    return sha.digest("hex");
}
//# sourceMappingURL=SaunaControl.js.map