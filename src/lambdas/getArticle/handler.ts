import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import AWS from "aws-sdk";
import middy from "middy";
import { ArticleDynamoRepository } from "../../common/controllers/DynamoDB/ArticleDynamoRepository";
import { Article } from "../../common/types/article";
import { ResponseTypedAPIGatewayProxyHandler } from "../../common/types/aws";
import {
  errorResponse,
  okResponse,
} from "../../common/types/Responce/baseResponses";
import { responseParser } from "../../middlewares/responseParser";

const dynamodbClient = new AWS.DynamoDB.DocumentClient();

const rawHandler: ResponseTypedAPIGatewayProxyHandler<
  APIGatewayProxyEvent,
  okResponse<Article>
> = async (event) => {
  const id = event.pathParameters!.id!;
  const dbController = new ArticleDynamoRepository(
    dynamodbClient,
    process.env.TABLE_NAME!
  );

  const res = await dbController.getById(id);

  return okResponse<Article>(res);
};

export const getArticle = middy(rawHandler).use(
  responseParser<APIGatewayProxyEvent>()
);
