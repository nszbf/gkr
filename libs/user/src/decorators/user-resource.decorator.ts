import { SetMetadata } from '@nestjs/common';
import { ObjectType } from 'typeorm';
import { UserEntity } from '../database/entities';
import { OwnerResourceMeta } from '../types';

/**
 * 用户直属资源检测装饰器
 * 通过此装饰器会判断传入的数据(比如根据一个post的id)是否属于当前的登录用户
 *
 * @export
 * @param {ObjectType<{ [key: string]: any }>} resource // 与用户关联的模型,譬如 Post
 * @param {string} [queryField] // 与Request的传入数据(params,body,query)对应查询的键, 譬如 id(Post的id)
 * @param {string} [ownerQueryField] // 与Request中的'user'值组成查询添加的字段名,譬如 id
 * @param {string} [relationName] // 所属模型与用户模型关联的字段,譬如 author
 * @returns
 */
export function UserResource(
    resource: ObjectType<{ [key: string]: any }>,
    queryField?: string,
    ownerQueryField?: string,
    relationName?: string,
) {
    return SetMetadata<string, OwnerResourceMeta>('owner-resource', {
        resource: {
            model: resource,
            queryColumn: queryField,
            ownerResourceName: relationName ?? 'user',
        },
        owner: {
            model: UserEntity,
            requestKey: 'user',
            queryColumn: ownerQueryField,
        },
    });
}

/**
 * 判断多个资源
 *
 * @export
 * @param {{
 *         resource: ObjectType<{ [key: string]: any }>;
 *         queryField?: string;
 *     }[]} meta
 * @param {string} [ownerQueryField]
 * @param {string} [relationName]
 * @returns
 */
export function UserResources(
    meta: {
        resource: ObjectType<{ [key: string]: any }>;
        queryField?: string;
    }[],
    ownerQueryField?: string,
    relationName?: string,
) {
    return SetMetadata<string, OwnerResourceMeta>('ownerShip', {
        resource: meta.map((item) => ({
            model: item.resource,
            queryColumn: item.queryField,
            ownerResourceName: relationName ?? 'user',
        })),
        owner: {
            model: UserEntity,
            requestKey: 'user',
            queryColumn: ownerQueryField,
        },
    });
}
