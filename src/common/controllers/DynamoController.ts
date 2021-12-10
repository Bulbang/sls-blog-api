import { forbidden, internal } from '@hapi/boom';
import CyrillicToTranslit from 'cyrillic-to-translit-js';
import { v4 } from 'uuid';
import { DBObjAttributes } from '../types/DBObjAttributes';
import { Article } from '../types/Article';

export class DynamoController {
  constructor(
    private db: AWS.DynamoDB.DocumentClient,
    private tableName: string,
  ) {}

  public async getArticles(attributes: DBObjAttributes[]) {
    try {
      const data = await this.db
        .scan({
          TableName: this.tableName,
          AttributesToGet: attributes,
        })
        .promise();

      return data;
    } catch (error) {
      throw internal(
        JSON.stringify({
          message: 'Internal Server Error',
          err: error,
        }),
      );
    }
  }

  public async getArticle(id: string) {
    try {
      const data = await this.db
        .get({
          TableName: this.tableName,
          Key: { id },
        })
        .promise();
      return data;
    } catch (error) {
      throw internal(
        JSON.stringify({
          message: 'Internal Server Error',
          err: error,
        }),
      );
    }
  }

  public async putArticle(article: Omit<Article, 'id' | 'slug'>) {
    try {

      const newArticle: Article = {
        title: article.title,
        meta_title: article.meta_title,
        meta_description: article.meta_description,
        content:article.content,
        id: v4(),
        slug: new CyrillicToTranslit().transform(
          article.title.toLowerCase(),
          '_',
        ),
      };

      const res = await this.db
        .put({
          TableName: this.tableName,
          Item: newArticle,
          ReturnValues: 'UPDATED_NEW',
        })
        .promise();

      return res;
    } catch (error) {
      throw internal(
        JSON.stringify({
          message: 'Internal Server Error',
          err: error,
        }),
      );
    }
  }

  public async updateArticle(
    id: string,
    updateValues: Partial<Omit<Article, 'id' | 'slug'>>,
  ) {
    try {
      let updateEx = 'set ';
      const atrUpdate: { [key: string]: unknown } = {};
      let index = 0;

      for (const [key, val] of Object.entries(updateValues)) {
        if (key === 'id' || key === 'slug') {
          throw forbidden(`Key: '${key}' unable to update`);
        }
        updateEx += `${key}=:atr${index}, `;
        atrUpdate[`:atr${index}`] = val;
        index += 1;
      }
      updateEx = updateEx.substring(0, updateEx.length - 2);
      const res = await this.db
        .update({
          Key: { id },
          TableName: this.tableName,
          UpdateExpression: updateEx,
          ExpressionAttributeValues: atrUpdate,
          ReturnValues: 'UPDATED_NEW',
        })
        .promise();
      return res;
    } catch (error) {
      throw internal(
        JSON.stringify({
          message: 'Internal Server Error',
          err: error,
        }),
      );
    }
  }
}
