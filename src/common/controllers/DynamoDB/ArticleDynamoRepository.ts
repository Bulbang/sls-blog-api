import {
    badData, forbidden, internal, notFound,
} from '@hapi/boom';
import CyrillicToTranslit from 'cyrillic-to-translit-js';
import { v4 } from 'uuid';
import { Article, ArticleReqBody, TrimmedArticle } from '../../types/article';
import { DynamoController as DynamoRepository } from '../../abstractions/DynamoRepository';

export class ArticleDynamoRepository extends DynamoRepository {
    public async getMany(): Promise<TrimmedArticle[]> {
        let data;
        try {
            data = await this.db
                .scan({
                    TableName: this.tableName,
                })
                .promise();
        } catch (error) {
            throw internal('DynamoDB scan operation error: ', error);
        }

        if (!data.Items) {
            throw notFound('Items not found');
        }
        const articles: TrimmedArticle[] = data.Items.map((item: Article) => {
            const {
                id, slug, title, url,
            } = item;
            if (id || slug || title || url) {
                return {
                    id,
                    slug,
                    title,
                    url,
                };
            }
            throw internal('One of properties is invalid');
        });
        return articles;
    }

    public async getById(id: string): Promise<Article> {
        let data;
        try {
            data = await this.db
                .get({
                    TableName: this.tableName,
                    Key: { id },
                })
                .promise();
        } catch (error) {
            throw internal('DynamoDB get operation error: ', error);
        }

        if (!data.Item) {
            throw notFound(`Item by id:${id} not found`);
        }
        const article: Article = {
            id: data.Item.id,
            slug: data.Item.slug,
            title: data.Item.title,
            meta_title: data.Item.meta_title,
            meta_description: data.Item.meta_description,
            content: data.Item.content,
            created_at: data.Item.created_at,
            updated_at: data.Item.updated_at,
            file_id: data.Item.file_id,
            url: data.Item.url,
        };
        return article;
    }

    public async putData(
        article: ArticleReqBody & { url: string },
    ): Promise<Article> {
        try {
            const newArticle: Article = {
                id: v4(),
                slug: new CyrillicToTranslit().transform(
                    article.title.toLowerCase(),
                    '_',
                ),
                ...article,
                created_at: +new Date(),
                updated_at: +new Date(),
            };
            await this.db
                .put({
                    TableName: this.tableName,
                    Item: newArticle,
                })
                .promise();

            return newArticle;
        } catch (error) {
            throw internal('DynamoDB put operation error: ', error);
        }
    }

    public async updateData(
        id: string,
        updateValues: Partial<ArticleReqBody>,
    ): Promise<Article> {
        let updateEx = 'set ';
        const atrUpdate: { [key: string]: unknown } = { ':date': +new Date() };
        let index = 0;

        try {
            for (const [key, val] of Object.entries(updateValues)) {
                if (
                    key === 'id'
          || key === 'slug'
          || key === 'updated_at'
          || key === 'created_at'
          || key === 'url' || key === 'file_id'
                ) {
                    throw forbidden(`Key: '${key}' unable to update`);
                } 
                updateEx += `${key}=:atr${index}, `;
                atrUpdate[`:atr${index}`] = val;
                index += 1;
            }
            updateEx += 'updated_at=:date, ';
            atrUpdate[':date'] = +new Date();
        } catch (error) {
            throw badData(error);
        }

        updateEx = updateEx.substring(0, updateEx.length - 2);
        let res;
        try {
            res = await this.db
                .update({
                    Key: { id },
                    TableName: this.tableName,
                    UpdateExpression: updateEx,
                    ExpressionAttributeValues: atrUpdate,
                    ReturnValues: 'ALL_NEW',
                })
                .promise();
        } catch (error) {
            throw internal('DynamoDB update operation error: ', error);
        }

        if (!res.Attributes) {
            throw internal('Atributes empty');
        }

        const article: Article = {
            id: res.Attributes!.id,
            slug: res.Attributes!.slug,
            title: res.Attributes!.title,
            meta_title: res.Attributes!.meta_title,
            meta_description: res.Attributes!.meta_description,
            content: res.Attributes!.content,
            created_at: res.Attributes!.created_at,
            updated_at: res.Attributes!.updated_at,
            file_id: res.Attributes!.file_id,
            url: res.Attributes!.url,
        };
        return article;
    }
}
