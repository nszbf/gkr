import { GModule, HashUtil, TimeUtil } from '@gkr/core';
import { DatabaseUtil, DbUtilMeta } from '@gkr/database';
import { database } from './database';
import * as dtoMaps from './dtos';
import * as serviceMaps from './services';

const dtos = Object.values(dtoMaps);
const services = Object.values(serviceMaps);
const providers = [...dtos, ...services];

// const dbpath = path.join(process.cwd(), 'database/content');
// const mount: GModuleMount = {
//     resolve: async () => {
//         fse.emptyDirSync(dbpath);
//         posts.forEach(({ contentFile }) => {
//             const contentPath = path.join(__dirname, 'database/fixtures/posts', contentFile);
//             if (!isFile(contentPath)) {
//                 throw new Error(`file ${contentPath} not exists!`);
//             }
//             fse.copySync(contentPath, path.join(dbpath, contentFile));
//         });
//     },
//     check: async () => posts.every(({ contentFile }) => isFile(path.join(dbpath, contentFile))),
// };
/**
 * 内容模块
 *
 * @export
 * @class ContentModule
 */
@GModule<DbUtilMeta>(() => ({
    utils: [HashUtil, TimeUtil, DatabaseUtil],
    database,
    providers,
    exports: services,
}))
export class ContentModule {}
