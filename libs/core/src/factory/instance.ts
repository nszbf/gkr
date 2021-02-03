import { INestApplication, Type } from '@nestjs/common';
import { useContainer } from 'typeorm';
import { printError } from '../helpers';
import { Configure } from '../resolvers/configure';
import { ModuleResolver } from '../resolvers/module.resolver';
import { UtilResolver } from '../resolvers/util.resolver';
import { InstanceRegister } from './types';

// eslint-disable-next-line consistent-return
export async function createInstance(
    register: InstanceRegister,
    configure: Configure,
    util: UtilResolver,
    bootModule?: Type<any>,
): Promise<INestApplication | void> {
    try {
        // 实例化模块生成服务
        const ms = new ModuleResolver(configure, util);

        // 生成启动模块
        const BootModule = await ms.getBootModule(
            configure.get<Type<any>[]>('app.modules', [])!,
            bootModule,
        );

        // 创建APP
        const app = await register({
            configure,
            util,
            BootModule,
        });
        app.enableShutdownHooks();
        await app.init();
        // class-validator类库绑定服务容器
        useContainer(app.select(BootModule), {
            fallbackOnErrors: true,
        });
        return app;
    } catch (error) {
        console.log();
        printError('Startup framework failed.', error);
    }
}

export async function closeInstance(instance: INestApplication, util: UtilResolver) {
    await instance.close();
    util.all.forEach(async ({ value }) => {
        await value.close();
    });
}
