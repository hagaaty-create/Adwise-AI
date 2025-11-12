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
  return smartAdReviewFlow(input);
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
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to review ad. The AI model did not return any output.');
    }
    return output;
  }
);
