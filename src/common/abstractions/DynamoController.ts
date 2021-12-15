import { internal } from '@hapi/boom';

export abstract class DynamoController {
  constructor(
    protected db: AWS.DynamoDB.DocumentClient,
    protected tableName: string,
  ) {}

  public async getMany(attributes: string[]) {
    try {
      const data = await this.db
        .scan({
          TableName: this.tableName,
          AttributesToGet: attributes,
        })
        .promise();

      return data;
    } catch (error) {
      throw internal('DynamoDB scan operation error: ', error);
    }
  }

  public async getById(id: string) {
    try {
      const data = await this.db
        .get({
          TableName: this.tableName,
          Key: { id },

        })
        .promise();
      return data;
    } catch (error) {
      throw internal('DynamoDB get operation error: ', error);
    }
  }
}
