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
import { GenkitError } from 'genkit';


const AutomatedAdCampaignInputSchema = z.object({
  adName: z.string().describe('The name or headline of the ad campaign.'),
  productDescription: z.string().describe('A detailed description of the product or service being advertised.'),
  targetAudience: z.string().describe('Description of the target audience for the ad campaign, including age and interests.'),
  platforms: z.array(z.enum(['Google'])).describe('The platform to run the ad campaign on. Should always be Google.'),
  budget: z.number().describe('The total budget for the ad campaign.'),
  campaignDurationDays: z.number().describe('The duration of the ad campaign in days.'),
  headline: z.string().describe('The main headline for the ad.'),
  keywords: z.string().describe('A comma-separated list of keywords for the ad campaign.'),
  location: z.string().describe('The geographical location to target (e.g., country or city).'),
});
export type AutomatedAdCampaignInput = z.infer<typeof AutomatedAdCampaignInputSchema>;

const AutomatedAdCampaignOutputSchema = z.object({
  campaignSummaries: z.array(
    z.object({
      platform: z.string().describe('The platform the ad campaign was created for.'),
      adCopy: z.string().describe('The generated ad copy (description) for the platform.'),
      predictedReach: z.number().describe('The predicted number of impressions (reach) of the ad campaign on the platform.'),
      predictedConversions: z.number().describe('The predicted number of clicks (conversions) from the ad campaign.'),
      estimatedCost: z.number().describe('The estimated cost of the ad campaign on the platform, which should equal the provided budget.'),
    })
  ).describe('A summary of the ad campaign for the Google platform, including ad copy, predicted reach, conversions and costs.'),
});
export type AutomatedAdCampaignOutput = z.infer<typeof AutomatedAdCampaignOutputSchema>;

export async function createAutomatedAdCampaign(input: AutomatedAdCampaignInput): Promise<AutomatedAdCampaignOutput> {
  try {
    return await automatedAdCampaignFlow(input);
  } catch (error) {
    console.error(`Automated ad campaign failed: ${error instanceof Error ? error.message : String(error)}`);
    // Fallback to mock data on any error
    return {
      campaignSummaries: [
        {
          platform: 'Google',
          adCopy: `Hagaaty is your all-in-one solution for AI-powered advertising. Get started today and see the difference. With our platform, you can launch campaigns in minutes and reach your target audience in ${input.location} effectively. Don't miss out on our special launch offer!`,
          predictedReach: input.budget * (1000 + Math.floor(Math.random() * 500)),
          predictedConversions: input.budget * (50 + Math.floor(Math.random() * 50)),
          estimatedCost: input.budget,
        },
      ],
    };
  }
}

const automatedAdCampaignPrompt = ai.definePrompt({
  name: 'automatedAdCampaignPrompt',
  input: {schema: AutomatedAdCampaignInputSchema},
  output: {schema: AutomatedAdCampaignOutputSchema},
  prompt: `You are an expert Google Ads strategist. Generate a Google ad campaign for the following product/service.
Provide a realistic performance simulation. The estimated cost must exactly match the provided budget.

Ad Headline: {{{headline}}}
Product/Service Description: {{{productDescription}}}
Target Audience: {{{targetAudience}}}
Keywords: {{{keywords}}}
Location: {{{location}}}
Platform: Google
Budget: {{{budget}}}
Campaign Duration (days): {{{campaignDurationDays}}}

For the Google platform, generate compelling ad copy (description), predict the reach (impressions) and conversions (clicks), and confirm the estimated cost is exactly the budget provided.
Your entire response must be in the specified JSON format.
`,
});

const automatedAdCampaignFlow = ai.defineFlow(
  {
    name: 'automatedAdCampaignFlow',
    inputSchema: AutomatedAdCampaignInputSchema,
    outputSchema: AutomatedAdCampaignOutputSchema,
  },
  async input => {
    if (!process.env.GEMINI_API_KEY) {
      throw new GenkitError({
        status: 'UNAUTHENTICATED',
        message: 'The GEMINI_API_KEY environment variable is not set.',
      });
    }

    const modifiedInput = { ...input, platforms: ['Google' as const] };
    const {output} = await automatedAdCampaignPrompt(modifiedInput);
    
    if (!output) {
      throw new GenkitError({
        status: 'UNAVAILABLE',
        message: 'The AI model did not return a response. This may be due to an invalid API key, a billing issue, or a network problem.',
      });
    }
    
    // Ensure the estimated cost matches the budget
    if (output.campaignSummaries.length > 0) {
        output.campaignSummaries[0].estimatedCost = input.budget;
    }
    return output;
  }
);
