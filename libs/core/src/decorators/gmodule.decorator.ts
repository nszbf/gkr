import { GMODULE_REGISTER } from '../constants';
import { GModuleMeta } from '../types';

export function GModule<T extends Record<string, any>>(
    register: () => GModuleMeta<T>,
    // mount?: GModuleMount,
) {
    return <M extends new (...args: any[]) => any>(target: M) => {
        Reflect.defineMetadata(GMODULE_REGISTER, register, target);
        // Reflect.defineMetadata(GMODULE_MOUNT, mount, target);
        return target;
    };
}
