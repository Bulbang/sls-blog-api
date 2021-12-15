import { APIGatewayProxyHandler } from 'aws-lambda';
import AWS from 'aws-sdk';
import { ArticleDynamoController } from '../../common/controllers/DynamoDB/ArticleDynamoController';

const dynamodbClient = new AWS.DynamoDB.DocumentClient();

export const getArticles: APIGatewayProxyHandler = async (_event) => {
  const dbController = new ArticleDynamoController(
    dynamodbClient,
    process.env.TABLE_NAME!,
  );
  const res = await dbController.getMany(['id', 'title']);
  const items = res.Items;
  return {
    statusCode: 200,
    body: JSON.stringify({
      items,
    }),
  };
};
