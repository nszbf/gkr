export type RePartial<T> = {
    [P in keyof T]?: T[P] extends Record<string, any> | Array<Record<string, any>>
        ? RePartial<T[P]>
        : T[P];
};
