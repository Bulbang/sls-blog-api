import { APIGatewayTokenAuthorizerHandler } from 'aws-lambda';
import { generatePolicy } from './generatePolicy';

export const auth: APIGatewayTokenAuthorizerHandler = (
    event,
    _context,
    callback,
) => {
    const encodedAuthData = Buffer.from(event.authorizationToken.split(' ')[1], 'base64');
    const [login, password] = encodedAuthData.toString('utf-8').split(':');

    if (login === process.env.LOGIN! && password === process.env.PASSWORD!) {
        callback(null, generatePolicy('user', 'Allow', event.methodArn));
    } else if (
        login !== process.env.LOGIN!
    || password !== process.env.PASSWORD!
    ) {
        callback('Unauthorized');
    } else {
        callback('Error: Invalid token');
    }
};
