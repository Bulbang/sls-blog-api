import AWS from 'aws-sdk';
import middy from 'middy';
import { jsonBodyParser } from 'middy/middlewares';
import { ArticleDynamoRepository } from '../../common/controllers/DynamoDB/ArticleDynamoRepository';
import { Article, ArticleReqBody } from '../../common/types/article';
import {
  ResponseTypedAPIGatewayProxyHandler,
  ValidatedEventBody,
} from '../../common/types/aws';
import { OkResponse } from '../../common/types/Responce/baseResponses';
import { responseParser } from '../../middlewares/responseParser';

const dynamodbClient = new AWS.DynamoDB.DocumentClient();

const rawHandler: ResponseTypedAPIGatewayProxyHandler<
ValidatedEventBody<ArticleReqBody>,
OkResponse<Article>
> = async (event) => {
  const {
    content, title, meta_description, meta_title, file_id,
  } = event.body;

  const url = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${file_id}`

  const article = {
    title,
    meta_title,
    meta_description,
    content,
    url,
    file_id,
  };
  const dbController = new ArticleDynamoRepository(
    dynamodbClient,
    process.env.TABLE_NAME!,
  );

  const dbRes = await dbController.putData(article);

  return OkResponse(dbRes);
};

export const putArticle = middy(rawHandler)
  .use(jsonBodyParser())
  .use(responseParser<ValidatedEventBody<ArticleReqBody>>());
