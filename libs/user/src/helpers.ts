/**
 * 生成随机验证码
 *
 * @export
 * @returns
 */
export function generateValidateCode() {
    return Math.random().toFixed(6).slice(-6);
}
