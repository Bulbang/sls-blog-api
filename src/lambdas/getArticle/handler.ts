import { APIGatewayProxyHandler } from 'aws-lambda';
import AWS from 'aws-sdk';
import { DynamoController } from '../../common/controllers/DynamoController';

export const getArticle: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters!.id!;
  const dbController = new DynamoController(
    new AWS.DynamoDB.DocumentClient({
      region: process.env.REGION!,
    }),
    process.env.TABLE_NAME!,
  );

  const res = await dbController.getArticle(id);
  const item = res.Item;

  if (!item) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: `Data by id:${id} not found`,
      }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      item,
    }),
  };
};
