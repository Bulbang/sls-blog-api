import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Handler,
} from 'aws-lambda';

export type ValidatedEventBody<S> = Omit<APIGatewayProxyEvent, 'body'> & {
    body: S;
};
export type TypedResponseBody<T> = Omit<APIGatewayProxyResult, 'body'> & {
    body: T;
};

export type ResponseTypedAPIGatewayProxyHandler<E, R> = Handler<E, R>;
