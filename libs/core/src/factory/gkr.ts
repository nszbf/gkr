import { INestApplication } from '@nestjs/common';
import { CommandModule } from 'yargs';
import { Configure } from '../resolvers/configure';
import { UtilResolver } from '../resolvers/util.resolver';
import { IApp } from './types';

export class Gkr {
    protected static _configure: Configure;

    protected static _util: UtilResolver;

    protected static _app: IApp;

    protected static _commands: CommandModule<any, any>[];

    protected static _instance: INestApplication;

    protected static _close: () => Promise<void>;

    static setApp(app: IApp) {
        this._app = app;
        this._instance = this._app.instance;
        this._close = this._app.close;
        this._configure = this._app.configure;
        this._util = this._app.util;
        this._commands = this._app.commands;
        return this._app;
    }

    static get app() {
        return this._app;
    }

    static get instance() {
        return this._instance;
    }

    static get close() {
        return this._close;
    }

    static get configure() {
        return this._configure;
    }

    static get util() {
        return this._util;
    }

    static get commands() {
        return this._commands;
    }
}
