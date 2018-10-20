import * as io from "socket.io-client";
import { EventEmitter } from "events";

class Transport extends EventEmitter {
  connected: boolean = false;
  socket: SocketIOClient.Socket;

  connect(host: string) {
    this.socket = io(host, {
      path: location.pathname + "sockets",
    });

    this.socket
      .on("connect", () => {
        this.connected = true;
        this.emit("connect");
      })
      .on("disconnect", () => {
        this.connected = false;
        this.emit("disconnect");
      });
  }

  async call(route: string, data?: any): Promise<any> {
    const callPromise = new Promise((resolve) => {
      this.socket.once(`${route}.res`, resolve);
    });

    this.socket.emit(route, data);

    return await callPromise;
  }
}

export default new Transport();