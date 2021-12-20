export const okResponse = <T>(
  body: T,
  headers: { [key in string]: string } = {},
  isBase64Encoded: boolean = false
): okResponse<T> => {
  return {
    statusCode: 200,
    headers,
    isBase64Encoded,
    body,
  };
};

export type okResponse<T> = {
  statusCode: number;
  body: T;
  headers: { [key in string]: string };
  isBase64Encoded: boolean;
};

export const errorResponse = (
  code: number,
  errorLog: {
    [key in string]: unknown;
  },
  headers: { [key in string]: string } = {},
  isBase64Encoded: boolean = false
): errorResponse => {
  return {
    statusCode: code,
    headers,
    isBase64Encoded,
    body: errorLog,
  };
};

export type errorResponse = {
  statusCode: number;
  headers: { [key in string]: string };
  isBase64Encoded: boolean;
  body: {
    [key in string]: unknown;
  };
};
