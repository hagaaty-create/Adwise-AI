'use server';
/**
 * @fileOverview A flow that automates lead generation, client communication, payment process management, and campaign monitoring.
 *
 * - automatedMarketing - A function that initiates the automated marketing process.
 * - AutomatedMarketingInput - The input type for the automatedMarketing function.
 * - AutomatedMarketingOutput - The return type for the automatedMarketing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedMarketingInputSchema = z.object({
  businessDescription: z
    .string()
    .describe('A description of the business or service being marketed.'),
  targetAudience: z.string().describe('The target audience for the marketing efforts.'),
  marketingGoals: z.string().describe('Specific goals for the marketing campaign.'),
});
export type AutomatedMarketingInput = z.infer<typeof AutomatedMarketingInputSchema>;

const AutomatedMarketingOutputSchema = z.object({
  leadGenerationStrategy: z
    .string()
    .describe('A detailed strategy for generating leads, including specific channels and tactics.'),
  clientCommunicationPlan: z
    .string()

    .describe(
      'A plan for communicating with clients at all stages, including initial contact, follow-up, and ongoing engagement.'
    ),
  paymentProcessManagement: z
    .string()
    .describe(
      'A description of how the payment process will be managed, including methods, timing, and handling of issues.'
    ),
  campaignMonitoringStrategy: z
    .string()
    .describe('A strategy for monitoring campaign performance, including key metrics and reporting frequency.'),
});
export type AutomatedMarketingOutput = z.infer<typeof AutomatedMarketingOutputSchema>;

export async function automatedMarketing(input: AutomatedMarketingInput): Promise<AutomatedMarketingOutput> {
  return automatedMarketingFlow(input);
}

const automatedMarketingPrompt = ai.definePrompt({
  name: 'automatedMarketingPrompt',
  input: {schema: AutomatedMarketingInputSchema},
  output: {schema: AutomatedMarketingOutputSchema},
  prompt: `You are an expert marketing automation specialist. Your task is to develop a comprehensive automated marketing plan based on the provided business description, target audience, and marketing goals.

Consider the following aspects:

*   Lead Generation: Strategies to automatically attract potential clients.
*   Client Communication: Methods to maintain consistent and engaging communication with clients.
*   Payment Process: How to streamline and automate payment procedures.
*   Campaign Monitoring: Techniques to track and optimize campaign performance.

Business Description: {{{businessDescription}}}
Target Audience: {{{targetAudience}}}
Marketing Goals: {{{marketingGoals}}}

Provide a detailed output that covers each of these areas, ensuring that the strategies are practical and scalable.
`,
});

const automatedMarketingFlow = ai.defineFlow(
  {
    name: 'automatedMarketingFlow',
    inputSchema: AutomatedMarketingInputSchema,
    outputSchema: AutomatedMarketingOutputSchema,
  },
  async input => {
    const {output} = await automatedMarketingPrompt(input);
    return output!;
  }
);
