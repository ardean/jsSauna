/// <reference types="socket.io" />
import User from "./User";
export default interface Client {
    socket: SocketIO.Socket;
    loggedIn: boolean;
    sessionId?: string;
    user?: User;
}
