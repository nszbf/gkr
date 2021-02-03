import {
    Connection,
    EntityManager,
    EntitySubscriberInterface,
    EventSubscriber,
    getConnection,
    ObjectType,
    UpdateEvent,
} from 'typeorm';

@EventSubscriber()
export abstract class BaseSubscriber<T> implements EntitySubscriberInterface<T> {
    private cname!: string;

    protected connection!: Connection;

    protected em!: EntityManager;

    /**
     * 如果有自动注入的连接实例则属于Nestjs运行时否则处于cli状态
     * @memberof BaseSubscriber
     */
    constructor() {
        this.connection = this.getConnection();
        this.em = this.connection.manager;
    }

    private getConnection(): Connection {
        return getConnection(this.cname);
    }

    abstract listenTo(): ObjectType<T>;

    protected isUpdated<E>(cloumn: keyof E, event: UpdateEvent<E>) {
        return event.updatedColumns.find((item) => item.propertyName === cloumn);
    }
}
