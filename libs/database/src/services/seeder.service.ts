import { Gkr } from '@gkr/core';
import { Connection } from 'typeorm';
import { BaseSeeder } from '../base/seeder';
import { DatabaseUtil } from '../database.util';
import { DbFactory, SeederConstructor } from '../types';

export class SeederService extends BaseSeeder {
    public async run(_factory: DbFactory, _connection: Connection): Promise<any> {
        const db = () => Gkr.util.get(DatabaseUtil);
        let seeders: SeederConstructor[] = [];
        if (this.args.modules) {
            seeders = this.args.modules
                .map((module) => {
                    const options = db().seeders.find((option) => option.module.name === module);
                    if (!options) {
                        throw new Error(`Module named ${module} has none seeders!`);
                    }
                    return options.seeders;
                })
                .reduce((o, n) => [...o, ...n], []);
        } else {
            seeders = db()
                .seeders.map((option) => option.seeders)
                .reduce((o, n) => [...o, ...n], []);
        }
        for (const seeder of seeders) {
            await this.call(seeder);
        }
    }
}
