import { APIGatewayProxyHandler } from 'aws-lambda';
import AWS from 'aws-sdk';
import { DynamoController } from '../../common/controllers/DynamoController';

export const getArticles: APIGatewayProxyHandler = async (event) => {
  try {
    const dbController = new DynamoController(
      new AWS.DynamoDB.DocumentClient({
        region: process.env.REGION!,
      }),
      process.env.TABLE_NAME!,
    );

    const res = await dbController.getArticles(['id', 'title']);
    const items = res.Items;
    return {
      statusCode: 200,
      body: JSON.stringify({
        items,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
      }),
    };
  }
};
