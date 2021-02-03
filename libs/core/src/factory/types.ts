import { INestApplication, Type } from '@nestjs/common';
import { CommandModule } from 'yargs';
import { Configure } from '../resolvers/configure';
import { UtilResolver } from '../resolvers/util.resolver';
import { ClassType, ConfigRegCollection } from '../types';

export type InstanceRegister = (params: {
    configure: Configure;
    util: UtilResolver;
    BootModule: Type<any>;
}) => Promise<INestApplication>;

export type IApp = {
    instance: INestApplication;
    configure: Configure;
    util: UtilResolver;
    commands: Array<CommandModule<any, any>>;
    close: () => Promise<void>;
    mounted: boolean;
};

export type Creator = () => Promise<{
    app: IApp;
    hooks: LifeCycleHooks;
}>;

export type LifeCycleHooks = {
    inited?: (configure: Configure, util: UtilResolver) => void;
    started?: (instance: INestApplication, util: UtilResolver) => void;
    hmr?: any;
    echo?: (configure: Configure, util: UtilResolver) => void;
};

export type CreateOptions = {
    configs: ConfigRegCollection<Record<string, any>>;
    register: InstanceRegister;
    BootModule?: Type<any>;
    utils?: Array<ClassType<any>>;
    hooks?: LifeCycleHooks;
};
