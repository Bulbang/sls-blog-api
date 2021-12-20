import { internal, isBoom } from "@hapi/boom";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { MiddlewareObject } from "middy";
import { cors } from "middy/middlewares";
import { TypedResponseBody } from "../common/types/aws";
import { APIGatewayResponseClass } from "../common/types/Responce/ResponseClass";

export const responseParser = <TEvent>(): MiddlewareObject<
  TEvent,
  TypedResponseBody<any>
> => {
  return {
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
  };
};
