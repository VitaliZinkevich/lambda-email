# Lambda Email Service (AWS CDK + Lambda + API Gateway + SES)

Serverless email sending service implemented with AWS CDK. Includes rich local development workflow, quickstart commands, testing strategies, and deployment guidance consolidated here.

---
## Table of Contents
1. Overview & Architecture
2. Prerequisites
3. Quick Start
4. Project Structure
5. Development Commands
6. Local Development Guide
7. Environment Variables
8. Testing Strategies
9. Debugging (VS Code & Manual)
10. Deployment
11. Usage (API)
12. Monitoring & Logs
13. Troubleshooting & Common Issues
14. Advanced: AWS SAM (Optional)
15. Clean Up
16. Additional Resources
17. License

---
## 1. Overview & Architecture

Components:
- **Lambda Function**: Handles email send requests.
- **API Gateway**: REST endpoint proxying to Lambda.
- **Amazon SES**: Sends emails (real in deployed env, mock locally if desired).

---
## 2. Prerequisites
1. Node.js 18+ and npm.
2. AWS CLI configured (`aws configure`) with credentials that can use SES & deploy CDK.
3. AWS CDK CLI: `npm install -g aws-cdk`.
4. Verified SES identity (email or domain) for sending.

Optional (local mocking does not require AWS credentials): local dev server uses mock SES behavior.

---
## 3. Quick Start
```bash
# Install dependencies
npm install

# Start local dev server (mock SES by default)
npm run dev

# Test endpoint locally
curl -X POST http://localhost:3000/send-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---
## 4. Project Structure
```
bin/                    CDK app entry point
lib/                    CDK stack definition
lambda/                 Lambda handlers & local server scripts
  send-email.ts         Main Lambda handler
  send-email-local.ts   Express-based local dev server
  send-email-dev.ts     (If present) Variant for dev
  test-local.ts         Direct invocation test script
test/                   Jest tests
cdk.json                CDK configuration
tsconfig.json           TypeScript config
package.json            Dependencies & scripts
```

---
## 5. Development Commands
```bash
npm run dev          # Local dev Express server (mock SES)
npm run watch        # Recompile TS on change
npm test             # Run unit tests
npm test -- --watch  # Tests in watch mode
npm run build        # Compile TypeScript -> dist
npm run synth        # CDK synthesize CloudFormation template
npm run deploy       # Wrapper for cdk deploy (if defined)
npx cdk diff         # Compare local vs deployed
npx cdk destroy      # Tear down stack
npx ts-node lambda/test-local.ts  # Direct Lambda tests
```

Debug (VS Code F5 configurations):
- Debug Lambda Locally
- Debug Local Dev Server
- Debug Jest Tests

---
## 6. Local Development Guide

### Option 1: Local Dev Server (Recommended)
```bash
npm run dev
```
Starts Express server at `http://localhost:3000` simulating API Gateway. Emails are mocked (no AWS creds needed).
Test:
```bash
curl -X POST http://localhost:3000/send-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "subject": "Hello", "body": "Test"}'
```

### Option 2: Direct Lambda Invocation (Local)
```bash
npx ts-node lambda/test-local.ts
```
Runs predefined scenarios against handler logic.

### Option 3: Unit Tests
```bash
npm test
```
Mocked AWS services for isolated logic tests.

### Fast Feedback Loop
```bash
# Terminal 1
npm run watch
# Terminal 2
npm run dev
# Terminal 3
curl -X POST http://localhost:3000/send-email -d '{"email":"loop@test.com"}'
```

### Optional Mock Flag Inside Handler
Add to `lambda/send-email.ts`:
```typescript
const IS_LOCAL = process.env.IS_LOCAL === 'true';
if (IS_LOCAL) {
  console.log('📧 MOCK: Would send email to:', body.email);
  return { statusCode: 200, body: JSON.stringify({ message: 'Email sent (mocked)', recipient: body.email }) };
}
```
Run:
```bash
IS_LOCAL=true npm run dev
```

---
## 7. Environment Variables
Minimum:
```bash
export AWS_REGION=us-east-1
export SOURCE_EMAIL=noreply@example.com
```
Optional:
```bash
export AWS_PROFILE=your-profile
```
`.env` example (requires `dotenv`):
```bash
AWS_REGION=us-east-1
SOURCE_EMAIL=noreply@example.com
```
Load with:
```typescript
import 'dotenv/config';
```

---
## 8. Testing Strategies
1. **Unit Tests (Mocked)**: Jest with `jest.mock('@aws-sdk/client-ses')`.
2. **Integration (Local)**: Run dev server with real AWS creds to use live SES (sandbox limits apply).
3. **End-to-End (Deployed)**: Deploy stack and test deployed API.

Invoke deployed Lambda directly (example payload shape depends on wrapper mapping):
```bash
aws lambda invoke \
  --function-name <YourLambdaName> \
  --payload '{"body": "{\"email\":\"test@example.com\"}"}' \
  response.json
```

---
## 9. Debugging
### VS Code
1. Set breakpoints in `lambda/send-email.ts`.
2. Press F5 → choose configuration.
3. Trigger request (curl or test script).

### Manual (Node Inspector)
```bash
node --inspect-brk -r ts-node/register lambda/test-local.ts
node --inspect-brk -r ts-node/register lambda/send-email-local.ts
```
Open `chrome://inspect` in Chrome.

Verbose logging tips:
```typescript
console.log('Event:', JSON.stringify(event, null, 2));
console.log('Env:', process.env);
```

---
## 10. Deployment
### Build & Bootstrap
```bash
npm run build
cdk bootstrap   # first time per account/region
```
### Deploy
```bash
cdk deploy --parameters SourceEmail=your-verified@example.com
```
Record API Gateway endpoint from output.

---
## 11. Usage (API)
POST JSON to deployed endpoint:
```bash
curl -X POST https://<api-id>.execute-api.<region>.amazonaws.com/prod/send-email \
  -H "Content-Type: application/json" \
  -d '{"email": "recipient@example.com", "subject":"Hi", "body":"Content"}'
```
Request body:
```json
{
  "email": "recipient@example.com",
  "subject": "Optional subject",
  "body": "Optional body text"
}
```
Success response:
```json
{
  "message": "Email sent successfully",
  "messageId": "...",
  "recipient": "recipient@example.com"
}
```
Error response:
```json
{ "message": "Error description", "error": "Details" }
```

---
## 12. Monitoring & Logs
Local: logs appear in terminal.
CloudWatch (deployed):
```bash
aws logs tail /aws/lambda/<YourFunctionName> --follow
aws logs tail /aws/lambda/<YourFunctionName> --since 1h
```

---
## 13. Troubleshooting & Common Issues
### Port 3000 In Use
```bash
lsof -ti:3000
kill -9 $(lsof -ti:3000)
```
### SES Sandbox
- Only verified identities allowed.
- Options: verify test emails, request production access, or use mock mode.
### AWS Credentials
Ensure `aws configure` or env vars:
```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```
### TypeScript Errors
```bash
npm run build
```
### CDK Diagnostics
```bash
npx cdk doctor
```

---
## 14. Advanced: AWS SAM (Optional)
Install SAM CLI (Linux example):
```bash
curl -L https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip -o sam.zip
unzip sam.zip -d sam-installation
sudo ./sam-installation/install
```
Minimal `template.yaml` example:
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Globals:
  Function:
    Timeout: 30
    Runtime: nodejs20.x
    Environment:
      Variables:
        SOURCE_EMAIL: noreply@example.com
Resources:
  EmailFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: dist/lambda/
      Handler: send-email.handler
      Events:
        SendEmail:
          Type: Api
          Properties:
            Path: /send-email
            Method: post
```
Run with SAM:
```bash
npm run build
sam build
sam local start-api
curl -X POST http://127.0.0.1:3000/send-email -d '{"email":"test@example.com"}'
```

---
## 15. Clean Up
Destroy stack to avoid charges:
```bash
cdk destroy
```

---
## 16. Additional Resources
- AWS Lambda Docs: https://docs.aws.amazon.com/lambda/
- SES Developer Guide: https://docs.aws.amazon.com/ses/
- CDK API Reference: https://docs.aws.amazon.com/cdk/api/v2/
- Jest Docs: https://jestjs.io/

---
## 17. License
ISC
