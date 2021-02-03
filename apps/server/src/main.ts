import { createApp, run } from '@gkr/core';
import { ApiUtil, buildApi, echoApi } from '@gkr/restful';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as configs from './config';
import { api } from './routes';

declare const module: any;
const creator = createApp({
    configs,
    register: async ({ BootModule }) => {
        const app = await NestFactory.create<NestFastifyApplication>(
            BootModule,
            new FastifyAdapter(),
            {
                cors: true,
                logger: ['error', 'warn'],
            },
        );
        return app;
    },
    hooks: {
        inited: (configure, util) => buildApi(configure, util, api),
        started: (app, util) => util.get(ApiUtil).registerDocs(app),
        hmr: module.hot,
        echo: (configure) => echoApi(configure),
    },
});
run(creator);
