#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaEmailStack } from '../lib/lambda-email-stack';
import dotenv from 'dotenv';
dotenv.config();

const app = new cdk.App();
new LambdaEmailStack(app, 'LambdaEmailStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'Stack with Lambda function for sending emails via SES'
});
