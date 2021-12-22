import { APIGatewayProxyEvent } from 'aws-lambda';
import AWS from 'aws-sdk';
import middy from 'middy';
import { v4 } from 'uuid';
import { ResponseTypedAPIGatewayProxyHandler } from '../../common/types/aws';
import {
    OkResponse,
} from '../../common/types/Responce/baseResponses';
import { responseParser } from '../../middlewares/responseParser';

const s3 = new AWS.S3();

const rawHandler: ResponseTypedAPIGatewayProxyHandler<
APIGatewayProxyEvent,
OkResponse<{ url: string; fields: { [key: string]: unknown } }>
> = async (event) => {
    const fileName = event.queryStringParameters?.fileId
        ? event.queryStringParameters.fileId
        : v4();
    const res = s3.createPresignedPost({
        Bucket: process.env.BUCKET_NAME,
        Fields: {
            acl: 'public-read',
            key: fileName,
        },
        Conditions: [
            ['starts-with', '$Content-Type', 'image/'],
            ['content-length-range', 0, 10000000],
        ],
    });
    return OkResponse(res);
};

export const getPresignUrl = middy(rawHandler).use(
    responseParser<APIGatewayProxyEvent>(),
);
