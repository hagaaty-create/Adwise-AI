
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

export async function createAutomatedAdCampaign(input: AutomatedAdCampaignInput): Promise<AutomatedAdCampaignOutput> {
  if (!ai) {
      console.error('AI service is not available. GEMINI_API_KEY might be missing.');
      throw new Error("The AI service is not configured. The GEMINI_API_KEY is missing. Please contact support.");
  }
  try {
    return await automatedAdCampaignFlow(input);
  } catch (error) {
    console.error(`Automated ad campaign failed: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error('The AI failed to generate the ad campaign. This might be due to a temporary issue with the AI service or an invalid API key. Please try again later.');
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
Website URL: {{{websiteUrl}}}
{{#if phoneNumber}}
Phone Number for Call Ad: {{{phoneNumber}}}
**Instruction**: A phone number is provided. Prioritize creating a "Call Ad" or make the phone number a primary call-to-action in the ad copy.
{{/if}}
Target Audience: {{{targetAudience}}}
Keywords: {{{keywords}}}
Location: {{{location}}}
Platform: Google
Budget: {{{budget}}}
Campaign Duration (days): {{{campaignDurationDays}}}

For the Google platform, generate compelling ad copy (description), predict the reach (impressions) and conversions (clicks), and confirm the estimated cost is exactly the budget provided.
The ad copy should be relevant to the website and product description.
If a phone number is provided, craft the ad to encourage phone calls.
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
    if (!automatedAdCampaignPrompt) {
        throw new GenkitError({
            status: 'UNAVAILABLE',
            message: 'AI prompt is not configured. The application may be starting up or the API key is missing.',
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
