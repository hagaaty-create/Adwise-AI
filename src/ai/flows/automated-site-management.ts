'use server';

/**
 * @fileOverview This file defines the automated site management flow, which autonomously develops the website.
 *
 * It includes functionalities such as creating new pages and articles, analyzing competitor SEO, and generating top-ranking content.
 * - `automatedSiteManagement` - The main function to trigger the site management flow.
 * - `AutomatedSiteManagementInput` - The input type for the automatedSiteManagement function.
 * - `AutomatedSiteManagementOutput` - The output type for the automatedSiteManagement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AutomatedSiteManagementInputSchema = z.object({
  websiteGoal: z
    .string()
    .describe(
      'The primary goal of the website, such as increasing user engagement or driving sales.'
    ),
  currentKeywords: z
    .string()
    .describe('A comma-separated list of the website’s current target keywords.'),
  competitorUrls: z
    .string()
    .describe(
      'A comma-separated list of competitor website URLs to analyze for SEO.'
    ),
});
export type AutomatedSiteManagementInput = z.infer<typeof AutomatedSiteManagementInputSchema>;

const AutomatedSiteManagementOutputSchema = z.object({
  newPages: z
    .array(z.string())
    .describe('A list of suggested new pages or articles to create.'),
  keywordSuggestions: z
    .array(z.string())
    .describe('A list of keyword suggestions based on competitor analysis.'),
  contentOutline: z.string().describe('An outline for content to improve SEO ranking.'),
});
export type AutomatedSiteManagementOutput = z.infer<typeof AutomatedSiteManagementOutputSchema>;

export async function automatedSiteManagement(
  input: AutomatedSiteManagementInput
): Promise<AutomatedSiteManagementOutput> {
  return automatedSiteManagementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedSiteManagementPrompt',
  input: {schema: AutomatedSiteManagementInputSchema},
  output: {schema: AutomatedSiteManagementOutputSchema},
  prompt: `You are an AI website manager tasked with autonomously developing a website to improve its visibility and attract more users.

  Based on the website's goals, current keywords, and competitor analysis, suggest new pages, keywords, and content outlines to improve SEO.

  Website Goal: {{{websiteGoal}}}
  Current Keywords: {{{currentKeywords}}}
  Competitor URLs: {{{competitorUrls}}}

  Suggest at least 3 new pages or articles, keyword suggestions, and a content outline.`,
});

const automatedSiteManagementFlow = ai.defineFlow(
  {
    name: 'automatedSiteManagementFlow',
    inputSchema: AutomatedSiteManagementInputSchema,
    outputSchema: AutomatedSiteManagementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
