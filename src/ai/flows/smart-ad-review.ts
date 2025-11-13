
'use server';

/**
 * @fileOverview A smart ad review AI agent (simulated).
 *
 * - smartAdReview - A function that handles the ad review process.
 * - SmartAdReviewInput - The input type for the smartAdreview function.
 * - SmartAdReviewOutput - The return type for the smartAdReview function.
 */

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


async function runMockedAdReview(input: SmartAdReviewInput): Promise<SmartAdReviewOutput> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple logic: always approve for the simulation.
    return {
        isApproved: true,
        reason: 'The ad meets all our community guidelines and is relevant to the target audience. Approved for launch.'
    };
}


export async function smartAdReview(input: SmartAdReviewInput): Promise<SmartAdReviewOutput> {
   console.log("Running in forced mocked AI mode for ad review.");
   return runMockedAdReview(input);
}
