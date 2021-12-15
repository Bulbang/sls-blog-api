import { AuthResponse, PolicyDocument } from 'aws-lambda';

export const generatePolicy = (principalId:string, effect:string, resource:string) => {
  const policyDocument: PolicyDocument = {
    Version: '2012-10-17',
    Statement: [],
  };
  policyDocument.Statement[0] = {
    Action: 'execute-api:Invoke',
    Effect: effect,
    Resource: resource,
  };
  const authResponse: AuthResponse = {
    principalId,
    policyDocument,
  };
  return authResponse;
};
