import { APIGatewayProxyEvent } from 'aws-lambda';
import AWS from 'aws-sdk';
import middy from 'middy';
import { ArticleDynamoRepository } from '../../common/controllers/DynamoDB/ArticleDynamoRepository';
import { Article } from '../../common/types/article';
import { ResponseTypedAPIGatewayProxyHandler } from '../../common/types/aws';
import {

  OkResponse,
} from '../../common/types/Responce/baseResponses';
import { responseParser } from '../../middlewares/responseParser';

const dynamodbClient = new AWS.DynamoDB.DocumentClient();

const rawHandler: ResponseTypedAPIGatewayProxyHandler<
APIGatewayProxyEvent,
OkResponse<Article>
> = async (event) => {
  const id = event.pathParameters!.id!;
  const dbController = new ArticleDynamoRepository(
    dynamodbClient,
    process.env.TABLE_NAME!,
  );

  const res = await dbController.getById(id);

  return OkResponse<Article>(res);
};

export const getArticle = middy(rawHandler).use(
  responseParser<APIGatewayProxyEvent>(),
);
