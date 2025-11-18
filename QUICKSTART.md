# Quick Development Commands

## 🎯 Quick Start (After Node.js 18+ is installed)

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server
npm run dev

# 3. Test the endpoint
curl -X POST http://localhost:3000/send-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 📋 All Available Commands

```bash
# Development
npm run dev          # Start local dev server with hot reload
npm run watch        # Watch TypeScript files for changes
npm test             # Run unit tests
npm test -- --watch  # Run tests in watch mode

# Testing Lambda directly
npx ts-node lambda/test-local.ts

# Building
npm run build        # Compile TypeScript to JavaScript

# CDK Commands
npm run synth        # Generate CloudFormation template
npm run deploy       # Deploy to AWS
npx cdk diff         # Compare local vs deployed
npx cdk destroy      # Remove all AWS resources

# Debugging
# Press F5 in VS Code and select:
# - "Debug Lambda Locally" 
# - "Debug Local Dev Server"
# - "Debug Jest Tests"
```

## 🧪 Test Examples

### Local Dev Server
```bash
# Basic email
curl -X POST http://localhost:3000/send-email \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# With subject and body
curl -X POST http://localhost:3000/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "subject": "My Subject",
    "body": "Email content here"
  }'

# Test error handling (missing email)
curl -X POST http://localhost:3000/send-email \
  -H "Content-Type: application/json" \
  -d '{"subject": "No email"}'
```

## 🐛 Debugging Tips

1. **Set breakpoints** in VS Code (click left of line numbers)
2. **Press F5** → Select "Debug Local Dev Server"
3. **Make a request** with curl
4. **Step through code** when debugger pauses

## 📁 Key Files

```
lambda/send-email.ts          # Main Lambda function (edit this!)
lambda/send-email-local.ts    # Local dev server
lambda/test-local.ts          # Direct test script
test/send-email.test.ts       # Unit tests
lib/lambda-email-stack.ts     # CDK infrastructure
```

## ⚡ Fast Development Loop

```bash
# Terminal 1
npm run watch

# Terminal 2  
npm run dev

# Terminal 3
# Make changes to lambda/send-email.ts
# Then test immediately:
curl -X POST http://localhost:3000/send-email -d '{"email":"test@test.com"}'
```

## 🔑 Environment Setup

```bash
# Set AWS credentials
export AWS_REGION=us-east-1
export SOURCE_EMAIL=noreply@example.com
export AWS_PROFILE=your-profile

# Or create .env file (requires dotenv package)
echo "AWS_REGION=us-east-1" > .env
echo "SOURCE_EMAIL=noreply@example.com" >> .env
```

## ✅ Before Deploying

```bash
# 1. Run tests
npm test

# 2. Build
npm run build

# 3. Preview changes
npx cdk diff

# 4. Deploy
npx cdk deploy --parameters SourceEmail=your-verified@email.com
```

## 🚨 Troubleshooting

```bash
# Port 3000 in use?
kill -9 $(lsof -ti:3000)

# TypeScript errors?
npm run build

# Check logs of deployed Lambda
aws logs tail /aws/lambda/YourFunctionName --follow

# CDK issues?
npx cdk doctor
```

## 📚 Documentation

- `README.md` - Project overview
- `LOCAL_DEV.md` - Detailed local development guide  
- `SETUP.md` - Deployment instructions (if exists)
- `NODE_VERSION_FIX.md` - Node.js upgrade guide (if exists)
