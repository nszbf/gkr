import { Gkr } from '@gkr/core';
import { BullModuleOptions } from '@nestjs/bull';
import { QueueUtil } from './queue.util';

const queue = () => Gkr.util.get(QueueUtil);
export function addQueue(params: BullModuleOptions = {}) {
    return queue().addProducers(params);
}
