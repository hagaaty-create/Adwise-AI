import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// This configuration uses the Google AI plugin to connect to DeepSeek's API
// by specifying a custom API endpoint and API key.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.DEEPSEEK_API_KEY, // This now reads your DeepSeek key
      baseUrl: 'https://api.deepseek.com/v1',
    }),
  ],
});
