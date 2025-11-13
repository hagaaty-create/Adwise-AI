
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

import {z} from 'zod';

const AutomatedAdCampaignInputSchema = z.object({
  adName: z.string().describe('The name or headline of the ad campaign.'),
  productDescription: z.string().describe('A detailed description of the product or service being advertised.'),
  websiteUrl: z.string().url().describe('The destination website URL for the ad campaign.'),
  phoneNumber: z.string().optional().describe('An optional phone number to create a call-specific ad.'),
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

// --- MOCKED AI IMPLEMENTATION ---
async function runMockedAdCampaign(input: AutomatedAdCampaignInput): Promise<AutomatedAdCampaignOutput> {
    // Simulate a delay as if the AI is working
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate a plausible, mocked response
    const { budget, headline, productDescription } = input;
    const predictedReach = budget * (1500 + Math.floor(Math.random() * 500)); // e.g., 1500-2000 impressions per dollar
    const predictedConversions = Math.floor(predictedReach * (0.02 + Math.random() * 0.03)); // 2-5% CTR

    const generatedAdCopy = `Boost your success with "${headline}"! ${productDescription.substring(0, 80)}... Discover the difference today and see real results. Act now for a special offer!`;
    
    return {
        campaignSummaries: [
            {
                platform: 'Google',
                adCopy: generatedAdCopy,
                predictedReach,
                predictedConversions,
                estimatedCost: budget,
            }
        ]
    };
}


export async function createAutomatedAdCampaign(input: AutomatedAdCampaignInput): Promise<AutomatedAdCampaignOutput> {
  // Always run the mocked version.
  console.log("Running in forced mocked AI mode for ad creation.");
  return runMockedAdCampaign(input);
}
