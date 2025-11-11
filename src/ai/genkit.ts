import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// This configuration uses the Google AI plugin to connect to DeepSeek's API
// by specifying a custom API endpoint.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.DEEPSEEK_API_KEY, // You will need to create this environment variable
      baseUrl: 'https://api.deepseek.com/v1',
    }),
  ],
});
