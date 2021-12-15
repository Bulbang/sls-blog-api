import { APIGatewayProxyHandler } from 'aws-lambda';
import AWS from 'aws-sdk';
import { ArticleDynamoController } from '../../common/controllers/DynamoDB/ArticleDynamoController';

const dynamodbClient = new AWS.DynamoDB.DocumentClient();

export const getArticle: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters!.id!;
  const dbController = new ArticleDynamoController(
    dynamodbClient,
    process.env.TABLE_NAME!,
  );

  const res = await dbController.getById(id);
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
