/// <reference types="node" />
import User from "./User";
import Sauna from "./Sauna";
import Client from "./Client";
import { Server } from "http";
import { Express } from "express";
import * as socketIO from "socket.io";
import { EventEmitter } from "events";
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
    constructor(sauna: Sauna, options?: SaunaControlOptions);
    listen(port: number, callback?: () => any): Server;
    onConnection(socket: socketIO.Socket): void;
    destroy(): void;
}
export {};
