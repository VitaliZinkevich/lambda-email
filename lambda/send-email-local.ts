import express from 'express';
import { handler } from './send-email-dev';
import { APIGatewayProxyEvent } from 'aws-lambda';
import dotenv from 'dotenv';

dotenv.config();
// Set development mode

const app = express();
const PORT = 3000;

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Lambda local development server running' });
});

// Mock Lambda endpoint
app.post('/send-email', async (req, res) => {
  console.log('📨 Received request:', JSON.stringify(req.body, null, 2));

  // Create a mock API Gateway event
  const mockEvent: APIGatewayProxyEvent = {
    body: JSON.stringify(req.body),
    headers: req.headers as any,
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
    console.log('✅ Response:', result);
    
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  🚀 Lambda Local Development Server                    ║
╠════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}            ║
║  Endpoint: POST http://localhost:${PORT}/send-email     ║
╠════════════════════════════════════════════════════════╣
║  Test with:                                            ║
║  curl -X POST http://localhost:${PORT}/send-email \\     ║
║    -H "Content-Type: application/json" \\               ║
║    -d '{"email": "test@example.com"}'                  ║
╚════════════════════════════════════════════════════════╝
  `);
});
