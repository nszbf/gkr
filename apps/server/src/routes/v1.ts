import {
    CategoryController,
    CategoryManageController,
    CommentManageController,
    ContentModule,
    PostController,
    PostManageController,
} from '@gkr/content';
import { VersionOption } from '@gkr/restful';
import { AccountController, AuthController, UserModule } from '@gkr/user';

export const v1: VersionOption = {
    name: 'v1',
    depends: [UserModule, ContentModule],
    routes: [
        {
            name: 'app',
            path: '/app',
            controllers: [],
            doc: {
                title: '应用接口',
                description: '前端APP应用接口',
            },
            children: [
                {
                    tags: ['用户'],
                    name: 'user',
                    path: '/user',
                    controllers: [AuthController, AccountController],
                },
                {
                    tags: ['内容'],
                    name: 'content',
                    path: '/content',
                    controllers: [PostController, CategoryController],
                },
            ],
        },
        {
            name: 'manage',
            path: '/manage',
            controllers: [],
            doc: {
                title: '管理接口',
                description: '后端管理接口',
            },
            children: [
                {
                    tags: ['内容管理'],
                    name: 'content',
                    path: '/content',
                    controllers: [
                        CategoryManageController,
                        PostManageController,
                        CommentManageController,
                    ],
                },
            ],
        },
    ],
};
