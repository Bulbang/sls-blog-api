import AWS from 'aws-sdk';
import middy from 'middy';
import { jsonBodyParser } from 'middy/middlewares';
import { ArticleDynamoRepository } from '../../common/controllers/DynamoDB/ArticleDynamoRepository';
import { Article, ArticleReqBody } from '../../common/types/article';
import {
    ResponseTypedAPIGatewayProxyHandler,
    ValidatedEventBody,
} from '../../common/types/aws';
import {

    OkResponse,
} from '../../common/types/Responce/baseResponses';
import { responseParser } from '../../middlewares/responseParser';

const dynamodbClient = new AWS.DynamoDB.DocumentClient();

const rawHandler: ResponseTypedAPIGatewayProxyHandler<
ValidatedEventBody<Partial<ArticleReqBody>>,
OkResponse<Article>
> = async (event) => {
    const dataToUpdate = event.body;

    const idOfArticleToUpdate = event.pathParameters!.id!;
    const dbController = new ArticleDynamoRepository(
        dynamodbClient,
        process.env.TABLE_NAME!,
    );

    const res = await dbController.updateData(idOfArticleToUpdate, dataToUpdate);
    return OkResponse(res);
};

export const updateArticle = middy(rawHandler)
    .use(jsonBodyParser())
    .use(responseParser<ValidatedEventBody<Partial<ArticleReqBody>>>());
