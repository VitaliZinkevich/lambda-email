import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import dotenv from 'dotenv';
dotenv.config();

// Mock SES client for local development
process.env.NODE_ENV === 'development'
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.USE_MOCK_SES === 'true';

let sesClient: SESClient;

if (isDevelopment) {
  console.log('🔧 Running in DEVELOPMENT mode - SES calls will be mocked');
  // Create a mock client that won't actually call AWS
  sesClient = new SESClient({ 
    region: process.env.AWS_REGION,
    // Use mock credentials for local dev
    credentials: {
      accessKeyId: 'mock-access-key',
      secretAccessKey: 'mock-secret-key'
    }
  });
} else {
  sesClient = new SESClient({ region: process.env.AWS_REGION });
}

interface EmailRequest {
  email: string;
  subject?: string;
  body?: string;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // Parse the request body
    const body: EmailRequest = JSON.parse(event.body || '{}');

    // Validate email address
    if (!body.email) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Email address is required',
          error: 'Missing email field in request body',
        }),
      };
    }

    // Email parameters
    const sourceEmail = process.env.SOURCE_EMAIL;
    const subject = body.subject || 'Test Email from Lambda';
    const bodyText = body.body || 'This is a test email sent from AWS Lambda using SES.';

    // In development mode, just mock the response
    if (isDevelopment) {
      console.log('📧 MOCK EMAIL SEND:');
      console.log('  From:', sourceEmail);
      console.log('  To:', body.email);
      console.log('  Subject:', subject);
      console.log('  Body:', bodyText);
      
      const mockMessageId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Email sent successfully (MOCKED)',
          messageId: mockMessageId,
          recipient: body.email,
          note: 'This is a mock response for local development. No actual email was sent.',
        }),
      };
    }

    // Send email using SES (only in production)
    const command = new SendEmailCommand({
      Source: sourceEmail,
      Destination: {
        ToAddresses: [body.email],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: bodyText,
            Charset: 'UTF-8',
          },
          Html: {
            Data: `<html><body><p>${bodyText}</p></body></html>`,
            Charset: 'UTF-8',
          },
        },
      },
    });

    const response = await sesClient.send(command);
    console.log('SES Response:', response);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Email sent successfully',
        messageId: response.MessageId,
        recipient: body.email,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Failed to send email',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
