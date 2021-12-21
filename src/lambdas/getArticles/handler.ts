import { APIGatewayProxyEvent } from "aws-lambda";
import AWS from "aws-sdk";
import middy from "middy";
import { ArticleDynamoRepository } from "../../common/controllers/DynamoDB/ArticleDynamoRepository";
import { TrimmedArticle } from "../../common/types/article";
import { ResponseTypedAPIGatewayProxyHandler } from "../../common/types/aws";
import {
  errorResponse,
  okResponse,
} from "../../common/types/Responce/baseResponses";
import { responseParser } from "../../middlewares/responseParser";

const dynamodbClient = new AWS.DynamoDB.DocumentClient();

const rawHandler: ResponseTypedAPIGatewayProxyHandler<
  APIGatewayProxyEvent,
  okResponse<{ items: TrimmedArticle[] }>
> = async (_event) => {
  const dbController = new ArticleDynamoRepository(
    dynamodbClient,
    process.env.TABLE_NAME!
  );
  const items = await dbController.getMany();
  return okResponse({ items });
};

export const getAllArticles = middy(rawHandler).use(
  responseParser<APIGatewayProxyEvent>()
);
