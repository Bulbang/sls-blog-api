export class APIGatewayResponseClass<TBody> {
    statusCode: number;

    body: TBody;

    headers: { [header: string]: string | number | boolean; } | undefined;

    isBase64Encoded: boolean;

    constructor({
        statusCode = 200,
        body,
        headers = {},
        isBase64Encoded = false,
    }: {
        body: TBody;
        statusCode?: number;
        headers?: { [header: string]: string | number | boolean; } | undefined;
        isBase64Encoded?: boolean;
    }) {
        this.statusCode = statusCode;
        this.body = body;
        this.headers = headers;
        this.isBase64Encoded = isBase64Encoded;
    }

    props() {
        return {
            statusCode: this.statusCode,
            body: this.body,
            headers: this.headers,
            isBase64Encoded: this.isBase64Encoded,
        };
    }

    toJSON() {
        return {
            statusCode: this.statusCode,
            body:
                typeof this.body === 'string'
                    ? this.body
                    : JSON.stringify(this.body),
            headers: this.headers,
            isBase64Encoded: this.isBase64Encoded,
        };
    }
}
