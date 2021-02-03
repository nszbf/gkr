import { Type } from '@nestjs/common';

export interface ApiConfig extends ApiDocSource {
    prefix?: {
        route?: string;
        doc?: string;
    };
    default: string;
    enabled: string[];
    versions: VersionOption[];
}

export interface VersionOption extends Partial<ApiDocSource> {
    name: string;
    depends: Type<any>[];
    routes: RouteOption[];
}

export interface RouteOption {
    name: string;
    path: string;
    controllers: Type<any>[];
    tags?: string[];
    depends?: Type<any>[];
    children?: RouteOption[];
    doc?: ApiDocSource;
}

export type SwaggerOption = ApiDocSource & {
    version: string;
    path: string;
    include: Type<any>[];
};

export type APIDocOption = {
    default?: SwaggerOption;
    routes?: { [key: string]: SwaggerOption };
};

interface ApiDocSource {
    title: string;
    description?: string;
    auth?: boolean;
    tags?: string[];
}
