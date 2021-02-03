import dayjs from 'dayjs';
import { getUtil } from '../../helpers';
import { TimeUtil } from './time.util';
import { TimeOptions } from './types';

const timer = () => getUtil(TimeUtil);
export function time(options?: TimeOptions): dayjs.Dayjs {
    return timer().getTime(options);
}
