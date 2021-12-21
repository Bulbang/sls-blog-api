import { internal, isBoom } from '@hapi/boom';
import { MiddlewareObject } from 'middy';
import { cors } from 'middy/middlewares';
import { TypedResponseBody } from '../common/types/aws';
import { ErrorResponse } from '../common/types/Responce/baseResponses';
import { APIGatewayResponseClass } from '../common/types/Responce/ResponseClass';

export const responseParser = <TEvent>(): MiddlewareObject<
TEvent,
TypedResponseBody<any>
> => ({
    after: (handler, next) => {
      if (!(handler.response instanceof APIGatewayResponseClass)) {
        handler.response = new APIGatewayResponseClass<any>({
          statusCode: handler.response.statusCode,
          headers: handler.response.headers,
          isBase64Encoded: handler.response.isBase64Encoded,
          body: handler.response.body,
        }).toJSON();
      } else handler.response.toJSON();

      cors().after?.(handler, next);
    },
    onError: (handler, next) => {
      console.error(handler.error);

      let error: any;
      if (isBoom(handler.error)) {
        error = handler.error;
      } else {
        error = internal(handler.error.message);
        error.name = 'InternalError';
      }

      handler.response = new APIGatewayResponseClass(ErrorResponse(error.output.statusCode, {
        err: {
          status: error.output.payload.error,
          message: error.output.statusCode === 500 ? undefined : error.message,
        },
      }));

      delete handler.error;

      cors().after?.(handler, next);
    },
  });
