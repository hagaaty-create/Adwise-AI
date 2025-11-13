/**
 * @fileOverview This file configures the Genkit AI instance.
 * It conditionally initializes Genkit only if the GEMINI_API_KEY is present.
 */

import {genkit, GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

let aiInstance: any = null;

if (process.env.GEMINI_API_KEY) {
  aiInstance = genkit({
    plugins: [
      googleAI(),
    ],
  });
} else {
  console.warn("GEMINI_API_KEY is not set. AI functionality will be disabled.");
  // In a non-dev environment, you might want to throw an error
  if (process.env.NODE_ENV === 'production') {
      console.error("CRITICAL: GEMINI_API_KEY is not set in production. AI features will fail.");
  }
}

export const ai = aiInstance;
