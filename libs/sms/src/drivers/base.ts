import { SendParams } from '../types';

/**
 * 基础短信驱动
 *
 * @export
 * @abstract
 * @class BaseSms
 * @template CT
 * @template SPT
 */
export abstract class BaseSms<CT, SPT> {
    constructor(protected readonly config: CT) {
        this.create();
    }

    /**
     * 根据配置创建SDK实例
     *
     * @abstract
     * @memberof BaseSms
     */
    abstract create(): void;

    /**
     * 发送短信
     *
     * @param {SendParams} options
     * @returns {Promise<any>}
     * @memberof BaseSms
     */
    async send(options: SendParams): Promise<any> {
        const params = this.transSendParams(options);
        return await this.sendAction(params);
    }

    /**
     * 子类发送短信处理
     *
     * @abstract
     * @param {SPT} params
     * @returns {Promise<any>}
     * @memberof BaseSms
     */
    abstract sendAction(params: SPT): Promise<any>;

    /**
     * 转义标准配置参数为SDK发送方法参数
     *
     * @abstract
     * @param {SendParams} options
     * @returns {SPT}
     * @memberof BaseSms
     */
    abstract transSendParams(options: SendParams): SPT;
}
