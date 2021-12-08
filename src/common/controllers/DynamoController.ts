import { DBObjAttributes } from '../types/DBObjAttributes';

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
      throw new Error('Internal Server Error');
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
      throw new Error('Internal Server Error');
    }
  }
}
