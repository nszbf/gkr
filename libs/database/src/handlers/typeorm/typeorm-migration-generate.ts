import { format } from '@sqltools/formatter/lib/sqlFormatter';
import chalk from 'chalk';
import { Connection } from 'typeorm';
import { CommandUtils } from 'typeorm/commands/CommandUtils';
import { AuroraDataApiDriver } from 'typeorm/driver/aurora-data-api/AuroraDataApiDriver';
import { MysqlDriver } from 'typeorm/driver/mysql/MysqlDriver';
import { camelCase } from 'typeorm/util/StringUtils';

/**
 * Generates a new migration file with sql needs to be executed to update schema.
 */
export class TypeormMigrationGenerate {
    async handler(args: { name: string; dir: string; pretty?: boolean }, connection: Connection) {
        const timestamp = new Date().getTime();
        const filename = `${timestamp}-${args.name}.ts`;
        const directory = args.dir;

        // if directory is not set then try to open tsconfig and find default path there

        // try {
        const upSqls: string[] = [];
        const downSqls: string[] = [];
        try {
            const sqlInMemory = await connection.driver.createSchemaBuilder().log();

            if (args.pretty) {
                sqlInMemory.upQueries.forEach((upQuery) => {
                    upQuery.query = TypeormMigrationGenerate.prettifyQuery(upQuery.query);
                });
                sqlInMemory.downQueries.forEach((downQuery) => {
                    downQuery.query = TypeormMigrationGenerate.prettifyQuery(downQuery.query);
                });
            }

            // mysql is exceptional here because it uses ` character in to escape names in queries, that's why for mysql
            // we are using simple quoted string instead of template string syntax
            if (
                connection.driver instanceof MysqlDriver ||
                connection.driver instanceof AuroraDataApiDriver
            ) {
                sqlInMemory.upQueries.forEach((upQuery) => {
                    upSqls.push(
                        `        await queryRunner.query("${upQuery.query.replace(
                            new RegExp(`"`, 'g'),
                            `\\"`,
                        )}"${TypeormMigrationGenerate.queryParams(upQuery.parameters)});`,
                    );
                });
                sqlInMemory.downQueries.forEach((downQuery) => {
                    downSqls.push(
                        `        await queryRunner.query("${downQuery.query.replace(
                            new RegExp(`"`, 'g'),
                            `\\"`,
                        )}"${TypeormMigrationGenerate.queryParams(downQuery.parameters)});`,
                    );
                });
            } else {
                sqlInMemory.upQueries.forEach((upQuery) => {
                    upSqls.push(
                        `        await queryRunner.query(\`${upQuery.query.replace(
                            new RegExp('`', 'g'),
                            '\\`',
                        )}\`${TypeormMigrationGenerate.queryParams(upQuery.parameters)});`,
                    );
                });
                sqlInMemory.downQueries.forEach((downQuery) => {
                    downSqls.push(
                        `        await queryRunner.query(\`${downQuery.query.replace(
                            new RegExp('`', 'g'),
                            '\\`',
                        )}\`${TypeormMigrationGenerate.queryParams(downQuery.parameters)});`,
                    );
                });
            }
        } finally {
            await connection.close();
        }

        if (upSqls.length) {
            if (args.name) {
                const fileContent = TypeormMigrationGenerate.getTemplate(
                    args.name as any,
                    timestamp,
                    upSqls,
                    downSqls.reverse(),
                );
                const path = `${process.cwd()}/${directory ? `${directory}/` : ''}${filename}`;
                await CommandUtils.createFile(path, fileContent);

                console.log(
                    chalk.green(`Migration ${chalk.blue(path)} has been generated successfully.`),
                );
            } else {
                console.log(
                    chalk.yellow('Please specify a migration name using the `-n` argument'),
                );
            }
        } else {
            console.log(
                chalk.yellow(
                    `No changes in database schema were found - cannot generate a migration. To create a new empty migration use "typeorm migration:create" command`,
                ),
            );
        }
    }

    // -------------------------------------------------------------------------
    // Protected Static Methods
    // -------------------------------------------------------------------------

    /**
     * Formats query parameters for migration queries if parameters actually exist
     */
    protected static queryParams(parameters: any[] | undefined): string {
        if (!parameters || !parameters.length) {
            return '';
        }

        return `, ${JSON.stringify(parameters)}`;
    }

    /**
     * Gets contents of the migration file.
     */
    protected static getTemplate(
        name: string,
        timestamp: number,
        upSqls: string[],
        downSqls: string[],
    ): string {
        const migrationName = `${camelCase(name, true)}${timestamp}`;

        return `import {MigrationInterface, QueryRunner} from "typeorm";

export class ${migrationName} implements MigrationInterface {
    name = '${migrationName}'

    public async up(queryRunner: QueryRunner): Promise<void> {
${upSqls.join(`
`)}
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
${downSqls.join(`
`)}
    }

}
`;
    }

    /**
     *
     */
    protected static prettifyQuery(query: string) {
        const formattedQuery = format(query, { indent: '    ' });
        return `\n${formattedQuery.replace(/^/gm, '            ')}\n        `;
    }
}
