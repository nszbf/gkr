/* eslint-disable global-require */
import path from 'path';
import { CLICommonConfig, CLILibConfig, CustomLibConfig } from '../types';

export function getLibConfig(commonConfig: CLICommonConfig, libConfig: CustomLibConfig) {
    const config: CLILibConfig = {
        ...commonConfig,
        dirs: {
            ...commonConfig.dirs,
            lib: libConfig.path,
        },
        paths: {
            ...commonConfig.paths,
            lib: path.join(commonConfig.paths.root, libConfig.path),
        },
    };
    return config;
}
