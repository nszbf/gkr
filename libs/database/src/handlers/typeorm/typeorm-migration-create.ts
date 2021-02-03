import chalk from 'chalk';
import { CommandUtils } from 'typeorm/commands/CommandUtils';
import { camelCase } from 'typeorm/util/StringUtils';
import { DbOption } from '../../types';

/**
 * Creates a new migration file.
 */
export class TypeormMigrationCreate {
    async handler(args: { name: string; dir: string }, connectionOptions: DbOption) {
        try {
            const timestamp = new Date().getTime();
            const fileContent = TypeormMigrationCreate.getTemplate(args.name as any, timestamp);
            const filename = `${timestamp}-${args.name}.ts`;
            let directory = args.dir as string | undefined;

            // if directory is not set then try to open tsconfig and find default path there
            if (!directory) {
                try {
                    directory = connectionOptions.cli
                        ? connectionOptions.cli.migrationsDir || ''
                        : '';
                    // eslint-disable-next-line no-empty
                } catch (err) {}
            }

            if (directory && !directory.startsWith('/')) {
                directory = `${process.cwd()}/${directory}`;
            }
            const path = (directory ? `${directory}/` : '') + filename;
            await CommandUtils.createFile(path, fileContent);
            console.log(`Migration ${chalk.blue(path)} has been generated successfully.`);
        } catch (err) {
            console.log(chalk.black.bgRed('Error during migration creation:'));
            console.error(err);
            process.exit(1);
        }
    }

    // -------------------------------------------------------------------------
    // Protected Static Methods
    // -------------------------------------------------------------------------

    /**
     * Gets contents of the migration file.
     */
    protected static getTemplate(name: string, timestamp: number): string {
        return `import {MigrationInterface, QueryRunner} from "typeorm";

export class ${camelCase(name, true)}${timestamp} implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
`;
    }
}
