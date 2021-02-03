import dayjs from 'dayjs';

/**
 * 时间生成器参数接口
 */
export interface TimeOptions {
    date?: dayjs.ConfigType;
    format?: dayjs.OptionType;
    locale?: string;
    strict?: boolean;
    zonetime?: string;
}
