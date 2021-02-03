import { BaseSeeder, DbFactory } from '@gkr/database';
import { Connection } from 'typeorm';
import { UserEntity } from '../entities';
import { IUserFactoryOptions } from '../factories/user.factory';

export default class UserSeeder extends BaseSeeder {
    protected truncates = [UserEntity];

    protected factory!: DbFactory;

    public async run(_factory: DbFactory, _connection: Connection): Promise<any> {
        this.factory = _factory;
        await this.loadUsers();
    }

    private async loadUsers() {
        const userFactory = this.factory(UserEntity);
        await userFactory<IUserFactoryOptions>({
            username: 'nangongmo',
            nickname: '南宫墨',
            phone: '15157511637',
            password: '123456',
            actived: true,
        }).create();

        await userFactory<IUserFactoryOptions>({
            username: 'lishuai',
            nickname: '李帅',
            phone: '15178787788',
            password: '123456',
            actived: true,
        }).create();

        await userFactory<IUserFactoryOptions>().createMany(15);
    }
}
