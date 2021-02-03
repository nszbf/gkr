import * as chokidar from 'chokidar';
import { dirname, join, relative } from 'path';
import * as shell from 'shelljs';
import { ActionOnFile, AssetEntry, IConfig } from '../types';

export class AssetsManager {
    constructor(
        protected config: IConfig,
        protected onWatch: boolean,
        private watchAssetsKeyValue: { [key: string]: boolean } = {},
        private watchers: chokidar.FSWatcher[] = [],
    ) {}

    /**
     * Using on `nest build` to close file watch or the build process will not end
     */
    closeWatchers() {
        const timeoutMs = 300;
        const closeFn = () => this.watchers.forEach((watcher) => watcher.close());

        setTimeout(closeFn, timeoutMs);
        return this;
    }

    copyAssets() {
        if (this.config.assets.length <= 0) {
            return this;
        }

        try {
            const filesToCopy = this.config.assets.map<AssetEntry>((item) => {
                if (typeof item === 'string') {
                    return {
                        glob: join(this.config.appPath, item),
                        outDir: this.config.buildPath,
                    };
                }
                return {
                    outDir: item.outDir || this.config.buildPath,
                    glob: join(this.config.appPath, item.include!),
                    exclude: item.exclude ? join(this.config.appPath, item.exclude) : undefined,
                    flat: item.flat, // deprecated field
                    watchAssets: item.watchAssets,
                    resolve: item.resolve,
                };
            });

            const isWatchEnabled = this.config.watchAssets || this.onWatch;
            for (const item of filesToCopy) {
                const option: ActionOnFile = {
                    action: 'change',
                    item,
                    path: '',
                    watchAssetsMode: isWatchEnabled,
                };
                const watcher = chokidar
                    .watch(item.glob!, { ignored: item.exclude })
                    .on('add', (path: string) =>
                        this.actionOnFile({ ...option, path, action: 'change' }),
                    )
                    .on('change', (path: string) =>
                        this.actionOnFile({ ...option, path, action: 'change' }),
                    )
                    .on('unlink', (path: string) =>
                        this.actionOnFile({ ...option, path, action: 'unlink' }),
                    );

                this.watchers.push(watcher);
            }
        } catch (err) {
            throw new Error(`An error occurred during the assets copying process. ${err.message}`);
        }
        return this;
    }

    private actionOnFile(option: ActionOnFile) {
        const { action, item, path, watchAssetsMode } = option;
        const isWatchEnabled = watchAssetsMode || item.watchAssets;

        // Allow to do action for the first time before check watchMode
        if (!isWatchEnabled && this.watchAssetsKeyValue[path]) {
            return;
        }

        // Set path value to true for watching the first time
        this.watchAssetsKeyValue[path] = true;

        const target = relative(this.config.appPath, path);

        const dest = join(
            this.config.appPath,
            item.outDir!,
            item.resolve ? item.resolve(target) : target,
        );
        // Copy to output dir if file is changed or added
        if (action === 'change') {
            shell.mkdir('-p', dirname(dest));
            shell.cp(path, dest);
        } else if (action === 'unlink') {
            // Remove from output dir if file is deleted
            shell.rm(dest);
        }
    }
}
