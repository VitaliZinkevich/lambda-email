# Lambda Email Service with AWS CDK

This project deploys a serverless email service using AWS CDK with Lambda, API Gateway, and SES.

## Architecture

- **Lambda Function**: Handles email sending requests
- **API Gateway**: Provides REST API endpoint for Lambda invocation
- **SES (Simple Email Service)**: Sends emails

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Node.js 18+ and npm installed
3. AWS CDK CLI installed: `npm install -g aws-cdk`
4. Verified email address in AWS SES (or domain verification)

## Project Structure

```
.
├── bin/
│   └── lambda-email.ts        # CDK app entry point
├── lib/
│   └── lambda-email-stack.ts  # CDK stack definition
├── lambda/
│   └── send-email.ts          # Lambda function handler
├── cdk.json                   # CDK configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. **Important**: Verify your email address in AWS SES:
   - Go to AWS SES Console
   - Navigate to "Verified identities"
   - Click "Create identity"
   - Verify an email address or domain
   - Check your email for verification link

3. Build the project:
```bash
npm run build
```

4. Bootstrap CDK (first time only):
```bash
cdk bootstrap
```

## Deployment

Deploy the stack with your verified email:

```bash
cdk deploy --parameters SourceEmail=your-verified-email@example.com
```

Or use the default and update it later in Lambda environment variables.

After deployment, note the API endpoint URL from the output.

## Usage

Send a POST request to the API endpoint with JSON body:

```bash
curl -X POST https://your-api-id.execute-api.region.amazonaws.com/prod/send-email \
  -H "Content-Type: application/json" \
  -d '{"email": "recipient@example.com"}'
```

### Request Format

```json
{
  "email": "recipient@example.com",
  "subject": "Optional subject",
  "body": "Optional email body text"
}
```

### Response Format

Success (200):
```json
{
  "message": "Email sent successfully",
  "messageId": "...",
  "recipient": "recipient@example.com"
}
```

Error (400/500):
```json
{
  "message": "Error description",
  "error": "Error details"
}
```

## Development

Watch for changes:
```bash
npm run watch
```

View CloudFormation template:
```bash
npm run synth
```

## Testing Locally

You can test the Lambda function locally by invoking it directly:

```bash
aws lambda invoke \
  --function-name LambdaEmailStack-EmailSenderFunction... \
  --payload '{"body": "{\"email\":\"test@example.com\"}"}' \
  response.json
```

## Important Notes

1. **SES Sandbox**: New AWS accounts are in SES sandbox mode
   - You can only send to verified email addresses
   - Request production access to send to any email
   
2. **Source Email**: Must be verified in SES before sending

3. **IAM Permissions**: Lambda function has permissions to:
   - ses:SendEmail
   - ses:SendRawEmail

## Clean Up

To avoid charges, destroy the stack when done:

```bash
cdk destroy
```

## CDK Commands

- `npm run build`   compile typescript to js
- `npm run watch`   watch for changes and compile
- `npm run test`    perform the jest unit tests
- `cdk deploy`      deploy this stack to your default AWS account/region
- `cdk diff`        compare deployed stack with current state
- `cdk synth`       emits the synthesized CloudFormation template
- `cdk destroy`     remove the stack from AWS

## License

ISC
