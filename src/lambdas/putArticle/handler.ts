import AWS from "aws-sdk";
import middy from "middy";
import { jsonBodyParser } from "middy/middlewares";
import { ArticleDynamoRepository } from "../../common/controllers/DynamoDB/ArticleDynamoRepository";
import { Article, ArticleReqBody } from "../../common/types/article";
import {
  ResponseTypedAPIGatewayProxyHandler,
  ValidatedEventBody,
} from "../../common/types/aws";
import {
  errorResponse,
  okResponse,
} from "../../common/types/Responce/baseResponses";
import { responseParser } from "../../middlewares/responseParser";

const dynamodbClient = new AWS.DynamoDB.DocumentClient();

const rawHandler: ResponseTypedAPIGatewayProxyHandler<
  ValidatedEventBody<ArticleReqBody>,
  okResponse<Article> | errorResponse
> = async (event) => {
  try {
    const { content, title, meta_description, meta_title } = event.body;

    const article = { title, meta_title, meta_description, content };
    const dbController = new ArticleDynamoRepository(
      dynamodbClient,
      process.env.TABLE_NAME!
    );
    const res = await dbController.putData(article);
    return okResponse(res);
  } catch (e) {
    return errorResponse(e.statusCode, {
      error: {
        type: e.type,
        status: e.output.payload.error,
        message: e.output.statusCode === 500 ? undefined : e.message,
      },
    });
  }
};

export const putArticle = middy(rawHandler)
  .use(jsonBodyParser())
  .use(responseParser<ValidatedEventBody<ArticleReqBody>>());
