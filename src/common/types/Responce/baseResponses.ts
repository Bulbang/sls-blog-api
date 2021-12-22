export const OkResponse = <T>(
    body: T,
    headers: { [key in string]: string } = {},
    isBase64Encoded: boolean = false,
): OkResponse<T> => ({
    statusCode: 200,
    headers,
    isBase64Encoded,
    body,
});

export type OkResponse<T> = {
    statusCode: number;
    body: T;
    headers: { [key in string]: string };
    isBase64Encoded: boolean;
};

export const ErrorResponse = (
    code: number,
    errorLog: {
        [key in string]: unknown;
    },
    headers: { [key in string]: string } = {},
    isBase64Encoded: boolean = false,
): ErrorResponse => ({
    statusCode: code,
    headers,
    isBase64Encoded,
    body: errorLog,
});

export type ErrorResponse = {
    statusCode: number;
    headers: { [key in string]: string };
    isBase64Encoded: boolean;
    body: {
        [key in string]: unknown;
    };
};
