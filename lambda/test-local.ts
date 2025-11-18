import { handler } from './send-email';
import { APIGatewayProxyEvent } from 'aws-lambda';

// Simple test script to invoke Lambda handler directly
async function testHandler() {
  console.log('🧪 Testing Lambda handler locally...\n');

  const testCases = [
    {
      name: 'Valid email request',
      body: {
        email: 'test@example.com',
        subject: 'Test Email',
        body: 'This is a test email from local development'
      }
    },
    {
      name: 'Minimal request (only email)',
      body: {
        email: 'minimal@example.com'
      }
    },
    {
      name: 'Invalid request (missing email)',
      body: {
        subject: 'No email provided'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log('Request:', JSON.stringify(testCase.body, null, 2));

    const mockEvent: APIGatewayProxyEvent = {
      body: JSON.stringify(testCase.body),
      headers: { 'Content-Type': 'application/json' },
      multiValueHeaders: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      path: '/send-email',
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
    };

    try {
      const result = await handler(mockEvent);
      console.log(`Status: ${result.statusCode}`);
      console.log('Response:', JSON.parse(result.body));
    } catch (error) {
      console.error('Error:', error);
    }
    
    console.log('─'.repeat(60));
  }
}

// Run tests
testHandler().catch(console.error);
