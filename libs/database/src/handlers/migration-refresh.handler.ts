import { MigrationRefreshArguments } from '../types';
import { MigrationRevertHandler } from './migration-revert.handler';
import { MigrationRunHandler } from './migration-run.handler';

export const MigrationRefreshHandler = async (args: MigrationRefreshArguments) => {
    await MigrationRevertHandler(args);
    await MigrationRunHandler(args);
};
