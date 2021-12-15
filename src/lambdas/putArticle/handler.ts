import AWS from 'aws-sdk';
import middy from 'middy';
import { jsonBodyParser } from 'middy/middlewares';
import { ArticleDynamoController } from '../../common/controllers/DynamoDB/ArticleDynamoController';
import { ArticleReqBody } from '../../common/types/Article';
import { ValidatedEventAPIGatewayProxyEvent } from '../../common/types/aws';

const dynamodbClient = new AWS.DynamoDB.DocumentClient();

const rawHandler: ValidatedEventAPIGatewayProxyEvent<ArticleReqBody> = async (event) => {
  const article = event.body;

  const dbController = new ArticleDynamoController(
    dynamodbClient,
    process.env.TABLE_NAME!,
  );
  const res = await dbController.putData(article);
  return {
    statusCode: 200,
    body: JSON.stringify({
      res,
    }),
  };
};

export const putArticle = middy(rawHandler).use(jsonBodyParser());
