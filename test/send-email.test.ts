import { handler } from '../lambda/send-email';
import { APIGatewayProxyEvent } from 'aws-lambda';

// Mock AWS SES
jest.mock('@aws-sdk/client-ses', () => {
  return {
    SESClient: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({
        MessageId: 'mock-message-id-12345'
      })
    })),
    SendEmailCommand: jest.fn()
  };
});

describe('Lambda Email Handler', () => {
  const createMockEvent = (body: any): APIGatewayProxyEvent => ({
    body: JSON.stringify(body),
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
  });

  beforeEach(() => {
    process.env.SOURCE_EMAIL = 'test@example.com';
    process.env.AWS_REGION = 'us-east-1';
  });

  it('should send email successfully with valid request', async () => {
    const event = createMockEvent({
      email: 'recipient@example.com',
      subject: 'Test Subject',
      body: 'Test Body'
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.message).toBe('Email sent successfully');
    expect(responseBody.messageId).toBe('mock-message-id-12345');
    expect(responseBody.recipient).toBe('recipient@example.com');
  });

  it('should send email with default subject and body', async () => {
    const event = createMockEvent({
      email: 'recipient@example.com'
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.message).toBe('Email sent successfully');
  });

  it('should return 400 when email is missing', async () => {
    const event = createMockEvent({
      subject: 'Test Subject'
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.message).toBe('Email address is required');
  });

  it('should return 400 when body is empty', async () => {
    const event = createMockEvent({});

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
  });

  it('should handle invalid JSON gracefully', async () => {
    const event: APIGatewayProxyEvent = {
      body: null,
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

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
  });
});
