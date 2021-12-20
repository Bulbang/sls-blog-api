import { internal } from '@hapi/boom';
import { ArticleDynamoRepository } from '../controllers/DynamoDB/ArticleDynamoRepository';
import { Article } from '../types/article';

export abstract class DynamoController {
  constructor(
    protected db: AWS.DynamoDB.DocumentClient,
    protected tableName: string,
  ) {}
}
