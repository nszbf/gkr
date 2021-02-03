import { ClassSerializerInterceptor, PlainLiteralObject } from '@nestjs/common';
import { ClassTransformOptions } from '@nestjs/common/interfaces/external/class-transform-options.interface';
import { isObject } from 'lodash';

export class AppIntercepter extends ClassSerializerInterceptor {
    serialize(
        response: PlainLiteralObject | Array<PlainLiteralObject>,
        options: ClassTransformOptions,
    ): PlainLiteralObject | PlainLiteralObject[] {
        const isArray = Array.isArray(response);
        if (!isObject(response) && !isArray) {
            return response;
        }
        const data = isArray
            ? (response as PlainLiteralObject[]).map((item) => this.transformToPlain(item, options))
            : this.transformToPlain(response, options);
        if ('meta' in data && 'items' in data) {
            const { items, ...others } = data;
            return { ...others, data: items };
        }
        return { data };
    }
}
