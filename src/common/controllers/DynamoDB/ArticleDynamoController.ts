import { badData, forbidden, internal } from '@hapi/boom';
import CyrillicToTranslit from 'cyrillic-to-translit-js';
import { v4 } from 'uuid';
import { Article, ArticleReqBody } from '../../types/Article';
import { DynamoController } from '../../abstractions/DynamoController';

export class ArticleDynamoController extends DynamoController {
  public async putData(article: ArticleReqBody) {
    try {
      const newArticle: Article = {
        ...article,
        created: +new Date(),
        lastUpdate: +new Date(),
        id: v4(),
        slug: new CyrillicToTranslit().transform(
          article.title.toLowerCase(),
          '_',
        ),
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

  public async updateData(id: string, updateValues: Partial<ArticleReqBody>) {
    let updateEx = 'set ';
    const atrUpdate: { [key: string]: unknown } = { ':date': +new Date() };
    let index = 0;

    try {
      for (const [key, val] of Object.entries(updateValues)) {
        if (key === 'id' || key === 'slug') {
          throw forbidden(`Key: '${key}' unable to update`);
        }
        updateEx += `${key}=:atr${index}, `;
        atrUpdate[`:atr${index}`] = val;
        index += 1;
      }
      updateEx += 'lastUpdate=:date, ';
      atrUpdate[':date'] = +new Date();
    } catch (error) {
      throw badData(error);
    }

    updateEx = updateEx.substring(0, updateEx.length - 2);
    try {
      const res = await this.db
        .update({
          Key: { id },
          TableName: this.tableName,
          UpdateExpression: updateEx,
          ExpressionAttributeValues: atrUpdate,
          ReturnValues: 'ALL_NEW',
        })
        .promise();
      return res;
    } catch (error) {
      throw internal('DynamoDB update operation error: ', error);
    }
  }
}
