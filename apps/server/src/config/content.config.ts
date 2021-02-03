import type { ContentConfig } from '@gkr/content';
import type { ConfigRegister } from '@gkr/core';
import { categories, posts } from '../fixture/content';

export const content: ConfigRegister<ContentConfig> = () => ({
    fixture: { categories, posts },
});
