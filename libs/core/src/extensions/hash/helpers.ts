import { getUtil } from '../../helpers';
import { HashUtil } from './hash.util';

const hasher = () => getUtil(HashUtil);
/**
 * 加密明文密码
 *
 * @export
 * @param {string} password
 * @returns
 */
export function encrypt(password: string) {
    return hasher().encry(password);
}

/**
 * 验证密码
 *
 * @export
 * @param {string} password
 * @param {string} hashed
 * @returns
 */
export function decrypt(password: string, hashed: string) {
    return hasher().check(password, hashed);
}
