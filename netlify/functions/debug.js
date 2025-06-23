const { OpenAI } = require('openai');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      httpMethod: event.httpMethod,
      headers: event.headers,
      environment: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 7)}...` : 'MISSING',
        ASSISTANT_ID: process.env.ASSISTANT_ID || 'MISSING',
        NODE_ENV: process.env.NODE_ENV || 'undefined'
      }
    };

    // Test OpenAI initialization
    if (!process.env.OPENAI_API_KEY) {
      debugInfo.error = 'OPENAI_API_KEY is missing';
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(debugInfo),
      };
    }

    if (!process.env.ASSISTANT_ID) {
      debugInfo.error = 'ASSISTANT_ID is missing';
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(debugInfo),
      };
    }

    // Test OpenAI client initialization
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      debugInfo.openaiClientCreated = true;

      // Test API connection
      const thread = await openai.beta.threads.create();
      debugInfo.threadCreated = true;
      debugInfo.threadId = thread.id;

      // Test assistant
      const assistant = await openai.beta.assistants.retrieve(process.env.ASSISTANT_ID);
      debugInfo.assistantFound = true;
      debugInfo.assistantName = assistant.name || 'Unnamed';

    } catch (openaiError) {
      debugInfo.openaiError = {
        message: openaiError.message,
        status: openaiError.status,
        code: openaiError.code,
        type: openaiError.type
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(debugInfo, null, 2),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Debug function failed',
        message: error.message,
        stack: error.stack
      }),
    };
  }
};