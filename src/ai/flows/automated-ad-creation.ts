'use server';

/**
 * @fileOverview This file defines a Genkit flow for automated ad creation for Google Ads.
 *
 * The flow takes user input for ad details and generates an ad campaign with realistic performance simulations.
 * It exports:
 * - createAutomatedAdCampaign: The function to trigger the ad creation flow.
 * - AutomatedAdCampaignInput: The input type for the ad creation flow.
 * - AutomatedAdCampaignOutput: The output type for the ad creation flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AutomatedAdCampaignInputSchema = z.object({
  adName: z.string().describe('The name of the ad campaign.'),
  productDescription: z.string().describe('A detailed description of the product or service being advertised.'),
  targetAudience: z.string().describe('Description of the target audience for the ad campaign.'),
  platforms: z.array(z.enum(['Google'])).describe('The platform to run the ad campaign on. Should always be Google.'),
  budget: z.number().describe('The total budget for the ad campaign.'),
  campaignDurationDays: z.number().describe('The duration of the ad campaign in days.'),
});
export type AutomatedAdCampaignInput = z.infer<typeof AutomatedAdCampaignInputSchema>;

const AutomatedAdCampaignOutputSchema = z.object({
  campaignSummaries: z.array(
    z.object({
      platform: z.string().describe('The platform the ad campaign was created for.'),
      adCopy: z.string().describe('The generated ad copy for the platform.'),
      predictedReach: z.number().describe('The predicted reach of the ad campaign on the platform.'),
      predictedConversions: z.number().describe('The predicted number of conversions from the ad campaign.'),
      estimatedCost: z.number().describe('The estimated cost of the ad campaign on the platform.'),
    })
  ).describe('A summary of the ad campaign for the Google platform, including ad copy, predicted reach, conversions and costs.'),
});
export type AutomatedAdCampaignOutput = z.infer<typeof AutomatedAdCampaignOutputSchema>;

export async function createAutomatedAdCampaign(input: AutomatedAdCampaignInput): Promise<AutomatedAdCampaignOutput> {
  return automatedAdCampaignFlow(input);
}

const automatedAdCampaignPrompt = ai.definePrompt({
  name: 'automatedAdCampaignPrompt',
  input: {schema: AutomatedAdCampaignInputSchema},
  output: {schema: AutomatedAdCampaignOutputSchema},
  prompt: `You are an expert Google Ads strategist. Generate a Google ad campaign for the following product/service. Provide a realistic performance simulation.

Product/Service Description: {{{productDescription}}}
Target Audience: {{{targetAudience}}}
Platform: Google
Budget: {{{budget}}}
Campaign Duration (days): {{{campaignDurationDays}}}

For the Google platform, generate compelling ad copy, predict the reach and conversions, and estimate the cost. The response should be a JSON array containing one object for Google.

Output should follow this schema:
${JSON.stringify(AutomatedAdCampaignOutputSchema.shape, null, 2)}`,
});

const automatedAdCampaignFlow = ai.defineFlow(
  {
    name: 'automatedAdCampaignFlow',
    inputSchema: AutomatedAdCampaignInputSchema,
    outputSchema: AutomatedAdCampaignOutputSchema,
  },
  async input => {
    // Force platform to be Google
    const modifiedInput = { ...input, platforms: ['Google' as const] };
    const {output} = await automatedAdCampaignPrompt(modifiedInput);
    return output!;
  }
);
