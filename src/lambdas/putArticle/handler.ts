import { APIGatewayProxyHandler } from 'aws-lambda';
import AWS from 'aws-sdk';
import { DynamoController } from '../../common/controllers/DynamoController';
import { Article } from '../../common/types/Article';

export const putArticle: APIGatewayProxyHandler = async (event) => {
  try {

    const article: Omit<Article, 'id' | 'slug'> = JSON.parse(
        event.body!,
      );
    const dbController = new DynamoController(
      new AWS.DynamoDB.DocumentClient({
        region: process.env.REGION!,
      }),
      process.env.TABLE_NAME!,
    );

    const res = await dbController.putArticle(article);
    return {
      statusCode: 200,
      body: JSON.stringify({
        res,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        err: error,
      }),
    };
  }
};
