/**
 * 排序方式
 *
 * @export
 * @enum {number}
 */
export enum UserOrderType {
    CREATED = 'createdAt',
    UPDATED = 'updatedAt',
}

/**
 * 发送用户验证码类型
 *
 * @export
 * @enum {number}
 */
export enum ValidateCodeType {
    REGISTRATION = 'registration',
    RESETPASSWORD = 'reset-password',
}

/**
 * 判断资源所属的装饰器常量
 */
export const OWNER_RESOURCE = 'onwer-resource';
