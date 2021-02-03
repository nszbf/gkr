import { ConfigRegister, Configure, Gkr, UtilResolver } from '@gkr/core';
import chalk from 'chalk';
import { ApiUtil } from './api.util';
import { ApiConfig, APIDocOption } from './types';

export function buildApi(configure: Configure, util: UtilResolver, api: ConfigRegister<ApiConfig>) {
    configure.set('api', api);
    util.add(ApiUtil);
}
export function echoApi(configure: Configure) {
    const host = configure.get<boolean>('app.host');
    const port = configure.get<number>('app.port')!;
    const https = configure.get<boolean>('app.https');
    let appUrl = configure.get<string>('app.url');
    if (!appUrl) {
        appUrl = `${https ? 'https' : 'http'}://${host!}:${port}`;
    }
    const prefix = configure.get<ApiConfig['prefix']>('api.prefix');
    console.log(
        `- RestAPI: ${chalk.green.underline(
            prefix?.route
                ? `${appUrl}${prefix.route.length > 0 ? `/${prefix.route}` : prefix.route}`
                : appUrl,
        )}`,
    );
    console.log('- RestDocs:');
    const api = Gkr.util.get(ApiUtil);
    const { default: defaultDoc, ...docs } = api.docs;
    echoApiDocs('default', defaultDoc, appUrl);
    for (const [name, doc] of Object.entries(docs)) {
        console.log();
        echoApiDocs(name, doc, appUrl);
    }
}

function echoApiDocs(name: string, doc: APIDocOption, appUrl: string) {
    const getDocPath = (dpath: string) => `${appUrl}/${dpath}`;
    if (!doc.routes && doc.default) {
        console.log(
            `    [${chalk.blue(name.toUpperCase())}]: ${chalk.green.underline(
                getDocPath(doc.default.path),
            )}`,
        );
        return;
    }
    console.log(`    [${chalk.blue(name.toUpperCase())}]:`);
    if (doc.default) {
        console.log(`      default: ${chalk.green.underline(getDocPath(doc.default.path))}`);
    }
    if (doc.routes) {
        Object.entries(doc.routes).forEach(([_routeName, rdocs]) => {
            console.log(
                `      <${chalk.yellowBright.bold(rdocs.title)}>: ${chalk.green.underline(
                    getDocPath(rdocs.path),
                )}`,
            );
        });
    }
}
