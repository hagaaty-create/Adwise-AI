import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// This is the correct configuration for Vercel.
// It directly uses the environment variable you set.
export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
  model: 'googleai/gemini-2.5-flash',
});
