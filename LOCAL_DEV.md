# Local Development Guide

## 🚀 Development Options

### Option 1: Local Dev Server (Recommended)
Run a local Express server that simulates API Gateway with **mocked SES**:

```bash
npm run dev
```

This starts a server at `http://localhost:3000` with hot reload. **No AWS credentials or SES permissions required** - all email sends are mocked for local development.

**Test it:**
```bash
curl -X POST http://localhost:3000/send-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "subject": "Hello", "body": "Test"}'
```

You'll see mock email details in the console output instead of actually sending emails.

### Option 2: Direct Lambda Invocation
Run the Lambda handler directly with test cases:

```bash
npx ts-node lambda/test-local.ts
```

This runs predefined test scenarios and shows results.

### Option 3: Unit Tests with Jest
Run automated tests with mocked AWS services:

```bash
npm test
```

**Watch mode (auto-run on changes):**
```bash
npm test -- --watch
```

## 🐛 Debugging

### VS Code Debugger

Three debug configurations are available (press F5 or use Debug panel):

1. **Debug Lambda Locally** - Run test-local.ts with breakpoints
2. **Debug Local Dev Server** - Debug the Express server
3. **Debug Jest Tests** - Debug unit tests

**To use:**
1. Open the file you want to debug
2. Set breakpoints (click left of line numbers)
3. Press F5 or go to Run & Debug panel
4. Select configuration and start debugging

### Manual Debugging with Node Inspector

```bash
# Debug test script
node --inspect-brk -r ts-node/register lambda/test-local.ts

# Debug dev server
node --inspect-brk -r ts-node/register lambda/send-email-local.ts
```

Then open `chrome://inspect` in Chrome.

## 📝 Development Workflow

### 1. Make Changes to Lambda Function
Edit `lambda/send-email.ts`:

```typescript
// Add your custom logic here
export const handler = async (event: APIGatewayProxyEvent) => {
  // Your code
};
```

### 2. Test Locally

**Quick test:**
```bash
npm run dev
# In another terminal:
curl -X POST http://localhost:3000/send-email \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com"}'
```

**With breakpoints:**
1. Set breakpoints in `lambda/send-email.ts`
2. Press F5 → Select "Debug Local Dev Server"
3. Make a curl request
4. Debugger stops at your breakpoints

### 3. Run Tests
```bash
npm test
```

### 4. Build & Deploy
```bash
npm run build
npm run deploy
```

## 🔧 Environment Variables

Set these in `.env` file or terminal:

```bash
export AWS_REGION=us-east-1
export SOURCE_EMAIL=noreply@example.com
export AWS_PROFILE=your-profile  # If using named profile
```

For local development, create `.env` file:

```bash
# .env
AWS_REGION=us-east-1
SOURCE_EMAIL=noreply@example.com
```

Then install dotenv:
```bash
npm install dotenv
```

And load it in your scripts:
```typescript
import 'dotenv/config';
```

## 📦 Using AWS SAM (Alternative)

For more advanced local development, use AWS SAM:

### Install SAM CLI
```bash
# Linux
curl -L https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip -o sam.zip
unzip sam.zip -d sam-installation
sudo ./sam-installation/install
```

### Create SAM Template
Create `template.yaml`:

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

### Build and Run with SAM
```bash
# Build
npm run build
sam build

# Start local API
sam local start-api

# Test
curl -X POST http://127.0.0.1:3000/send-email \
  -d '{"email": "test@example.com"}'
```

## 🧪 Testing Strategies

### 1. Unit Tests (Mocked)
Test business logic without AWS:

```typescript
// test/send-email.test.ts
jest.mock('@aws-sdk/client-ses');
// Test your handler
```

### 2. Integration Tests (Local)
Test with real AWS services:

```bash
# Uses real AWS SES (costs apply)
AWS_PROFILE=dev npm run dev
```

### 3. End-to-End Tests
Deploy to a dev stack and test:

```bash
cdk deploy EmailDevStack
# Run tests against real API
```

## 📊 Monitoring & Logs

### Local Development
Logs appear in your terminal automatically.

### Deployed Lambda
```bash
# Tail CloudWatch logs
aws logs tail /aws/lambda/YourFunctionName --follow

# Get recent logs
aws logs tail /aws/lambda/YourFunctionName --since 1h
```

## 🔥 Hot Tips

### 1. Fast Feedback Loop
```bash
# Terminal 1: Watch mode for TypeScript
npm run watch

# Terminal 2: Dev server with auto-reload
npm run dev

# Terminal 3: Make requests
curl -X POST http://localhost:3000/send-email -d '...'
```

### 2. Mock SES for Offline Development
Edit `lambda/send-email.ts`:

```typescript
// Add at top
const IS_LOCAL = process.env.IS_LOCAL === 'true';

// In handler
if (IS_LOCAL) {
  console.log('📧 MOCK: Would send email to:', body.email);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Email sent (mocked)',
      recipient: body.email
    })
  };
}
```

Then:
```bash
IS_LOCAL=true npm run dev
```

### 3. Debug Deployed Lambda
Enable verbose logging and check CloudWatch:

```typescript
console.log('Event:', JSON.stringify(event, null, 2));
console.log('Environment:', process.env);
```

## 🚫 Common Issues

### Port Already in Use
```bash
# Find process using port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)
```

### SES Sandbox Limitations
In SES sandbox mode, you can only send to verified emails. For local testing, either:
1. Verify test emails in SES
2. Use mock mode (see Hot Tips #2)
3. Request production access

### AWS Credentials
Ensure credentials are configured:
```bash
aws configure
# Or use environment variables
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

## 📚 Additional Resources

- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [SES Developer Guide](https://docs.aws.amazon.com/ses/)
- [CDK API Reference](https://docs.aws.amazon.com/cdk/api/v2/)
- [Jest Documentation](https://jestjs.io/)
