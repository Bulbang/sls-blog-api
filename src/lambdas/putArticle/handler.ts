import AWS from "aws-sdk";
import middy from "middy";
import { jsonBodyParser } from "middy/middlewares";
import { ArticleDynamoRepository } from "../../common/controllers/DynamoDB/ArticleDynamoRepository";
import { Article, ArticleReqBody, Response } from "../../common/types/article";
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
const s3 = new AWS.S3();

const rawHandler: ResponseTypedAPIGatewayProxyHandler<
  ValidatedEventBody<ArticleReqBody>,
  okResponse<Response>
> = async (event) => {
  const { content, title, meta_description, meta_title, mime_type } =
    event.body;

  const article = { title, meta_title, meta_description, content, mime_type };
  const dbController = new ArticleDynamoRepository(
    dynamodbClient,
    process.env.TABLE_NAME!
  );
  const dbRes = await dbController.putData(article);

  const fileName = `${dbRes.id}.${mime_type.split("/")[1]}`;
  const contentType = dbRes.mime_type;

  const uploadS3Url = await s3.getSignedUrlPromise("putObject", {
    Bucket: process.env.BUCKET_NAME!,
    Key: fileName,
    ContentType: contentType,
  });
  const res: Response = { ...dbRes, url: uploadS3Url, file_name: fileName };
  return okResponse(res);
};

export const putArticle = middy(rawHandler)
  .use(jsonBodyParser())
  .use(responseParser<ValidatedEventBody<ArticleReqBody>>());
