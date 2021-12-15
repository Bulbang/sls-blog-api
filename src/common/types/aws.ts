import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & {
  body: S;
};
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<
ValidatedAPIGatewayProxyEvent<S>,
APIGatewayProxyResult
>;
