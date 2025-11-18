import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config();

export class LambdaEmailStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function for sending emails
    const emailLambda = new lambda.Function(this, 'EmailSenderFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'send-email.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambda')),
      environment: {
          SOURCE_EMAIL: process.env.SOURCE_EMAIL || 'vitalizinkevich@gmail.com',
          NODE_ENV: 'production',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      description: 'Lambda function to send emails via SES',
    });

    // Grant SES permissions to Lambda
    emailLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'ses:SendEmail',
          'ses:SendRawEmail',
        ],
        resources: ['*'],
      })
    );

    // Create API Gateway REST API (public access)
    const api = new apigateway.RestApi(this, 'EmailApi', {
      restApiName: 'Email Service API',
      description: 'Public API for sending emails via Lambda and SES',
      deployOptions: {
        stageName: 'prod',
        throttlingRateLimit: 10,
        throttlingBurstLimit: 20,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
      endpointConfiguration: {
        types: [apigateway.EndpointType.EDGE],
      },
    });

    // Create /send-email resource
    const sendEmailResource = api.root.addResource('send-email');

    // Integrate Lambda with API Gateway
    const emailIntegration = new apigateway.LambdaIntegration(emailLambda, {
      requestTemplates: {
        'application/json': '{ "statusCode": "200" }',
      },
    });

    // Add POST method to /send-email
    sendEmailResource.addMethod('POST', emailIntegration, {
      apiKeyRequired: false,
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apigateway.Model.EMPTY_MODEL,
          },
        },
        {
          statusCode: '400',
          responseModels: {
            'application/json': apigateway.Model.ERROR_MODEL,
          },
        },
        {
          statusCode: '500',
          responseModels: {
            'application/json': apigateway.Model.ERROR_MODEL,
          },
        },
      ],
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'URL of the API Gateway',
      exportName: 'EmailApiUrl',
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: `${api.url}send-email`,
      description: 'Full endpoint URL for sending emails',
      exportName: 'EmailApiEndpoint',
    });

    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: emailLambda.functionName,
      description: 'Name of the Lambda function',
      exportName: 'EmailLambdaFunctionName',
    });
  }
}
