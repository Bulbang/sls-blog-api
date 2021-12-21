import { APIGatewayProxyEvent } from 'aws-lambda';
import AWS from 'aws-sdk';
import middy from 'middy';
import { ArticleDynamoRepository } from '../../common/controllers/DynamoDB/ArticleDynamoRepository';
import { TrimmedArticle } from '../../common/types/article';
import { ResponseTypedAPIGatewayProxyHandler } from '../../common/types/aws';
import {

  OkResponse,
} from '../../common/types/Responce/baseResponses';
import { responseParser } from '../../middlewares/responseParser';

const dynamodbClient = new AWS.DynamoDB.DocumentClient();

const rawHandler: ResponseTypedAPIGatewayProxyHandler<
APIGatewayProxyEvent,
OkResponse<{ items: TrimmedArticle[] }>
> = async (_event) => {
  const dbController = new ArticleDynamoRepository(
    dynamodbClient,
    process.env.TABLE_NAME!,
  );
  const items = await dbController.getMany();
  return OkResponse({ items });
};

export const getAllArticles = middy(rawHandler).use(
  responseParser<APIGatewayProxyEvent>(),
);
