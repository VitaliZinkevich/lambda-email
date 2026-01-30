import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: process.env.AWS_REGION });

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
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'OPTIONS,POST',
        },
        body: JSON.stringify({
          message: 'Email address is required',
          error: 'Missing email field in request body',
        }),
      };
    }

    // Email parameters
    const sourceEmail = process.env.SOURCE_EMAIL || 'vitalizinkevich@gmail.com';
    const subject = body.subject || 'Test Email from Lambda';
    
    // Handle circular references in JSON.stringify
    const seen = new WeakSet();
    const bodyText = body.body || `Automated notification from Smart IT Services:\n\n
      ${JSON.stringify(body, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      }, 2)}`;

    // Send email using SES
    const command = new SendEmailCommand({
      Source: sourceEmail,
      Destination: {
        ToAddresses: [process.env.SOURCE_EMAIL as string],
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
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
      },
      body: JSON.stringify({
        code: 200,
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
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
      },
      body: JSON.stringify({
        message: 'Failed to send email',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
