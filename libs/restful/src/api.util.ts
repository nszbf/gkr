import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RouterModule } from 'nest-router';
import { ApiDoc } from './doc';
import { ApiConfig } from './types';

export class ApiUtil extends ApiDoc {
    create(config: ApiConfig) {
        this.createConfig(config);
        this.createRoutes();
        this.createDocs();
    }

    registerImports() {
        return () => [...Object.values(this.modules), RouterModule.forRoutes(this._routes)];
    }

    registerMeta() {
        return {
            imports: () => [...Object.values(this.modules), RouterModule.forRoutes(this._routes)],
        };
    }

    registerDocs(app: INestApplication) {
        const docs = Object.values(this._docs)
            .map((vdoc) => [vdoc.default, ...Object.values(vdoc.routes ?? {})])
            .reduce((o, n) => [...o, ...n], [])
            .filter((i) => !!i);
        for (const voption of docs) {
            const { title, description, version, auth, include, tags } = voption!;
            const builder = new DocumentBuilder();
            if (title) builder.setTitle(title);
            if (description) builder.setDescription(description);
            if (auth) builder.addBearerAuth();
            if (tags) {
                tags.forEach((tag) => builder.addTag(tag));
            }
            builder.setVersion(version);
            const document = SwaggerModule.createDocument(app, builder.build(), {
                include: include.length > 0 ? include : [() => undefined],
            });
            SwaggerModule.setup(voption!.path, app, document);
        }
    }
}
