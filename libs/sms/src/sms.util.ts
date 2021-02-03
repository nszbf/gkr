import { BaseUtil, IConfigMaps, ValueOf } from '@gkr/core';
import { Injectable } from '@nestjs/common';
import { SmsDrivers } from './drivers';
import { SendParams, SmsConfig, SmsConnectionOption } from './types';

@Injectable()
export class SmsUtil extends BaseUtil<SmsConfig> {
    protected configMaps: IConfigMaps = {
        required: true,
        maps: 'sms',
    };

    protected _default!: string;

    protected _enabled!: string[];

    protected _options!: SmsConnectionOption[];

    protected _connections!: {
        [key: string]: InstanceType<ValueOf<Required<typeof SmsDrivers>>>;
    };

    create(config: SmsConfig) {
        this.config = config;
        this.setDefault().setOptions().setEnabled();
        this._enabled.map((name) => {
            return this._options.find((option) => option.name === name)!.type;
        });
        this._connections = Object.fromEntries(
            this._enabled.map((name) => {
                const { type, option } = this._options.find((item) => item.name === name)!;
                return [name, new SmsDrivers[type]!(option)];
            }),
        );
    }

    async send(params: SendParams, name?: string) {
        const connection = this._connections[name ?? this._default];
        if (!connection) {
            throw new Error(`Sms connection ${name} not exists!`);
        }
        await connection.send(params);
    }

    protected setOptions() {
        this._options = this.config.connections;
        return this;
    }

    protected setDefault() {
        if (!this.config.default) {
            const [firstEnabled] = this.config.enabled;
            this._default = firstEnabled;
            return this;
        }
        this._default = this.config.default;
        return this;
    }

    protected setEnabled() {
        const { enabled } = this.config;
        if (!this._default) {
            throw new Error(
                'Default sms connection or at least one enabled provider should be configure!',
            );
        }
        for (const name of enabled) {
            if (!this._options.map((option) => option.name).includes(name)) {
                throw new Error(
                    `Sms connection ${name} which enabled or default is not been configure!`,
                );
            }
        }
        if (!enabled.includes(this._default)) {
            enabled.push(this._default);
        }
        this._enabled = enabled;
        return this;
    }
}
