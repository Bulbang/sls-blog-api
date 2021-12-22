import { badData, forbidden, internal, notFound } from '@hapi/boom';
import CyrillicToTranslit from 'cyrillic-to-translit-js';
import { v4 } from 'uuid';
import { Article, ArticleReqBody, TrimmedArticle } from '../../types/article';
import { DynamoController as DynamoRepository } from '../../abstractions/DynamoRepository';

export class ArticleDynamoRepository extends DynamoRepository {
    private createArticleObj(obj: any): Article {
        const article: Article = {
            id: obj.id,
            slug: obj.slug,
            title: obj.title,
            meta_title: obj.meta_title,
            meta_description: obj.meta_description,
            content: obj.content,
            created_at: obj.created_at,
            updated_at: obj.updated_at,
            file_id: obj.file_id,
            url: obj.url,
        };
        return article;
    }

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

        if (!data.Items) throw notFound('Items not found');

        const articles: TrimmedArticle[] = data.Items.map((item: Article) => {
            const { id, slug, title, url } = item;
            return {
                id,
                slug,
                title,
                url,
            };
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

        if (!data.Item) throw notFound(`Item by id:${id} not found`);

        const article: Article = this.createArticleObj(data.Item);
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
                    key === 'id' ||
          key === 'slug' ||
          key === 'updated_at' ||
          key === 'created_at' ||
          key === 'url' ||
          key === 'file_id'
                )
                    throw forbidden(`Key: '${key}' unable to update`);
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

        if (!res.Attributes) throw internal('Atributes empty');

        const article: Article = this.createArticleObj(res.Attributes);

        return article;
    }
}
