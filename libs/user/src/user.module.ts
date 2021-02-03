import { GModule, GModuleMount, HashUtil, isFile, TimeUtil } from '@gkr/core';
import { DatabaseUtil, DbUtilMeta } from '@gkr/database';
import { QueueUtil, QueueUtilMeta } from '@gkr/queue';
import { RedisUtil } from '@gkr/redis';
import { SmsUtil } from '@gkr/sms';
import { PassportModule } from '@nestjs/passport';
import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import { database } from './database';
import * as dtoMaps from './dtos';
import * as guardMaps from './guards';
import { SendValidationProcessor } from './processors/send-validation.processor';
import * as serviceMaps from './services';
import * as strategyMaps from './strategies';

const strategies = Object.values(strategyMaps);
const guards = Object.values(guardMaps);
const dtos = Object.values(dtoMaps);
const services = Object.values(serviceMaps);
const mount: GModuleMount = {
    resolve: async () => {
        const target = path.join(process.cwd(), 'src/config/user.config.ts');
        const configIndex = path.join(process.cwd(), 'src/config/index.ts');
        const configFile = {
            stub: path.join(__dirname, 'stubs/user.config.ts.stub'),
            target,
        };
        if (!isFile(configFile.target)) {
            fse.copyFileSync(configFile.stub, configFile.target);
            fs.appendFileSync(configIndex, `export * from './user.config';`, 'utf8');
        }
    },
    check: async (configure) => configure.has('user'),
};
/**
 * 用户模块
 *
 * @export
 * @class UserModule
 */

@GModule<DbUtilMeta & QueueUtilMeta>(() => ({
    mount,
    utils: [HashUtil, TimeUtil, DatabaseUtil, RedisUtil, QueueUtil, SmsUtil],
    database,
    queue: {
        producers: [{ name: 'send-validation-code' }],
        consumers: [SendValidationProcessor],
    },
    imports: [PassportModule, serviceMaps.AuthService.jwtModuleFactory()],
    providers: [...strategies, ...dtos, ...guards, ...services],
    exports: services,
}))
export class UserModule {}
