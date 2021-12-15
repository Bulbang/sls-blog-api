import AWS from 'aws-sdk';
import middy from 'middy';
import { jsonBodyParser } from 'middy/middlewares';
import { ArticleDynamoController } from '../../common/controllers/DynamoDB/ArticleDynamoController';
import { ArticleReqBody } from '../../common/types/Article';
import { ValidatedEventAPIGatewayProxyEvent } from '../../common/types/aws';

const dynamodbClient = new AWS.DynamoDB.DocumentClient();

const rawHandler: ValidatedEventAPIGatewayProxyEvent<Partial<ArticleReqBody>> = async (event) => {
  const dataToUpdate = event.body;

  const idOfArticleToUpdate = event.pathParameters!.id!;
  const dbController = new ArticleDynamoController(
    dynamodbClient,
    process.env.TABLE_NAME!,
  );

  const res = await dbController.updateData(idOfArticleToUpdate, dataToUpdate);
  return {
    statusCode: 200,
    body: JSON.stringify({
      res,
    }),
  };
};

export const updateArticle = middy(rawHandler).use(jsonBodyParser());
