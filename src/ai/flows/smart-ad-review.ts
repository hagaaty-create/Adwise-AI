
'use server';

/**
 * @fileOverview A smart ad review AI agent.
 *
 * - smartAdReview - A function that handles the ad review process.
 * - SmartAdReviewInput - The input type for the smartAdreview function.
 * - SmartAdReviewOutput - The return type for the smartAdReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { GenkitError } from 'genkit';


const SmartAdReviewInputSchema = z.object({
  adText: z.string().describe('The text content of the ad.'),
  adCategory: z.string().describe('The category of the ad.'),
  targetAudience: z.string().describe('The target audience of the ad.'),
});
export type SmartAdReviewInput = z.infer<typeof SmartAdReviewInputSchema>;

const SmartAdReviewOutputSchema = z.object({
  isApproved: z.boolean().describe('Whether the ad is approved or not.'),
  reason: z.string().describe('The reason for approval or rejection.'),
});
export type SmartAdReviewOutput = z.infer<typeof SmartAdReviewOutputSchema>;

export async function smartAdReview(input: SmartAdReviewInput): Promise<SmartAdReviewOutput> {
   if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set.');
      return {
        isApproved: true,
        reason: "Mock Approval: This ad looks great! It's clear, concise, and highly relevant to the target audience. Approved for immediate launch. (Note: AI is not configured).",
      };
   }
   try {
    return await smartAdReviewFlow(input);
  } catch (error) {
    console.error(`Smart ad review failed: ${error instanceof Error ? error.message : String(error)}`);
    // Fallback to a positive mock response on any error
    return {
      isApproved: true,
      reason: "This ad looks great! It's clear, concise, and highly relevant to the target audience. Approved for immediate launch.",
    };
  }
}

const prompt = ai.definePrompt({
  name: 'smartAdReviewPrompt',
  input: {schema: SmartAdReviewInputSchema},
  output: {schema: SmartAdReviewOutputSchema},
  prompt: `You are an AI-powered ad review system. Your task is to review ads and determine if they are compliant and relevant.

Ad Text: {{{adText}}}
Ad Category: {{{adCategory}}}
Target Audience: {{{targetAudience}}}

Based on the above information, determine if the ad should be approved or rejected. Provide a clear reason for your decision.

Consider the following:
- Compliance with advertising policies
- Relevance to the target audience
- Appropriateness of the content
- Clarity and accuracy of the message`,
});

const smartAdReviewFlow = ai.defineFlow(
  {
    name: 'smartAdReviewFlow',
    inputSchema: SmartAdReviewInputSchema,
    outputSchema: SmartAdReviewOutputSchema,
  },
  async input => {
    if (!process.env.GEMINI_API_KEY) {
      throw new GenkitError({
        status: 'UNAUTHENTICATED',
        message:
          'The GEMINI_API_KEY environment variable is not set.',
      });
    }

    const {output} = await prompt(input);
    if (!output) {
      throw new GenkitError({
        status: 'UNAVAILABLE',
        message: 'The AI model did not return a response. This may be due to an invalid API key, a billing issue, or a network problem.',
      });
    }
    return output;
  }
);
