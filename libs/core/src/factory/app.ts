import { INestApplication, Type } from '@nestjs/common';
import chalk from 'chalk';
import ora from 'ora';
import yargs from 'yargs';
import { BaseUtil } from '../base';
import { Configure } from '../resolvers/configure';
import { ModuleResolver } from '../resolvers/module.resolver';
import { UtilResolver } from '../resolvers/util.resolver';
import { ClassesType } from '../types';
import { buildCommands, generateCommands, getMountCommand, getRunCommand } from './command';
import { Gkr } from './gkr';
import { closeInstance, createInstance } from './instance';
import { CreateOptions, Creator, IApp } from './types';

export async function initApp(name: string, initlizer: () => Promise<string | undefined>) {
    const spinner = ora({
        text: chalk.cyan('Startup the framework..'),
        isEnabled: false,
    }).start();
    await initlizer();
    spinner.succeed(chalk.green('framework has started'));
    return name;
}

export function createApp({ configs, utils, register, BootModule, hooks }: CreateOptions): Creator {
    return async () => {
        const configure = new Configure();
        // 实例化扩展操作服务
        const utiler = new UtilResolver(configure);
        const none = (null as unknown) as INestApplication;
        let app: IApp = Gkr.setApp({
            configure,
            util: utiler,
            commands: [],
            instance: none,
            mounted: true,
            close: async () => closeInstance(none, utiler),
        });
        // 设置自定义配置
        configure.reset(configs);
        // 根据配置通过扩展服务实例添加app配置中要使用的扩展
        let appUtils: ClassesType<BaseUtil<any>[]> = [];
        appUtils = utils ?? configure.get<ClassesType<BaseUtil<any>[]>>('app.utils', [])!;
        appUtils.forEach((util) => utiler.add(util));
        const modules = configure.get<Type<any>[]>('app.modules', [])!;
        const moduler = new ModuleResolver(configure, utiler);
        if (!(await moduler.checkMounted(modules))) {
            app = Gkr.setApp({
                ...app,
                mounted: false,
                commands: process.env.RUN_SOURCE ? [getMountCommand(moduler, modules)] : [],
            });
            return { app, hooks: hooks ?? {} };
        }
        // 如果有回调函数则执行回调
        if (hooks?.inited) hooks.inited(configure, utiler);
        const instance = (await createInstance(
            register,
            configure,
            utiler,
            BootModule,
        )) as INestApplication;
        if (hooks?.started) {
            hooks.started(instance, utiler);
        }
        const close = async () => closeInstance(instance, utiler);
        const commands = generateCommands(instance, utiler, close);
        app = Gkr.setApp({
            ...app,
            instance,
            close,
            commands,
        });
        return {
            app,
            hooks: hooks ?? {},
        };
    };
}

async function getCreated(creator: Creator) {
    const spinner = ora({
        text: chalk.cyan('Startup the framework..'),
        isEnabled: false,
    }).start();

    const created = await creator();

    spinner.succeed(chalk.green('framework has started'));
    return created;
}

export async function run(creator: Creator) {
    const created = await getCreated(creator);
    let { app } = created;
    if (app.mounted) {
        app = Gkr.setApp({
            ...app,
            commands: [...app.commands, getRunCommand(app, created.hooks)],
        });
    }
    app.commands.forEach((command) => yargs.command(command));
    buildCommands(app);
    return created;
}
