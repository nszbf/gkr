import { ConfigRegister } from '@gkr/core';
import { QueueConfig } from '@gkr/queue';

export const queue: ConfigRegister<QueueConfig> = () => ({
    default: 'main',
    enabled: [],
    connections: [
        {
            name: 'main',
            // redis: 'local'
        },
    ],
});
