import { SmsConnectionConfig, SmsDriverType } from './types';

/**
 * 创建短信连接配置
 *
 * @export
 * @template T
 * @param {SmsConnectionConfig<T>} option
 * @returns
 */
export function createSmsConection<T extends SmsDriverType>(option: SmsConnectionConfig<T>) {
    return option;
}

/**
 * 转义传入的手机号码
 * 如果不是数组则删除前缀`+86`
 * 如果是数组并且前缀是`+86`则删除前缀
 *
 * @export
 * @param {string} phone
 * @returns
 */
export function transPhone(phone: string) {
    const phoneArr: string[] = phone.split('.');
    if (phoneArr instanceof Array && phoneArr.length >= 2) {
        const area = phoneArr[0];
        const phoneNumber = phoneArr[1];
        return area === '+86' ? phoneNumber : phone;
    }
    return phone.replace('+86', '');
}
