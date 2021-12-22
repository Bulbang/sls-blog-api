export abstract class DynamoController {
    constructor(
        protected db: AWS.DynamoDB.DocumentClient,
        protected tableName: string,
    ) {}
}
