'use server';

/**
 * @fileOverview This file defines the automated site management flow, which autonomously develops the website.
 *
 * It includes functionalities such as analyzing competitor SEO, and generating top-ranking, complete articles.
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
  suggestedTopics: z
    .array(z.string())
    .describe('A list of at least 3 suggested topics for new articles based on the analysis.'),
  keywordSuggestions: z
    .array(z.string())
    .describe('A list of new keyword suggestions based on competitor analysis.'),
  generatedArticle: z.object({
    title: z.string().describe('The compelling, SEO-optimized title for the generated article.'),
    content: z.string().describe('The full, well-structured, and SEO-optimized article content, with a minimum of 500 words.'),
  }).describe('A complete, ready-to-publish article generated for the best suggested topic.'),
  googleSitesHtml: z.string().describe('The full article content formatted as simple, clean HTML code, ready to be embedded in a Google Site.'),
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
  prompt: `You are an expert AI SEO strategist and content writer tasked with autonomously developing a website to improve its visibility and attract more users.

  Based on the website's goals, current keywords, and competitor analysis, your task is to:
  1.  Suggest at least 3 new, highly relevant article topics that can rank well.
  2.  Provide a list of new keyword suggestions to target.
  3.  From your suggested topics, choose the SINGLE most promising topic.
  4.  Write a complete, comprehensive, and SEO-optimized article for that chosen topic. The article must be at least 500 words long, well-structured with headings and paragraphs, and ready for publication.
  5.  Finally, take the generated article (title and content) and format it as a single block of clean, simple HTML code. Use basic tags like <h1> for the title, <h2> for subheadings, and <p> for paragraphs. This HTML should be ready to be pasted directly into an "Embed Code" block on a Google Site.

  Website Goal: {{{websiteGoal}}}
  Current Keywords: {{{currentKeywords}}}
  Competitor URLs: {{{competitorUrls}}}

  Your final output must be a single JSON object matching the specified format.`,
});

const automatedSiteManagementFlow = ai.defineFlow(
  {
    name: 'automatedSiteManagementFlow',
    inputSchema: AutomatedSiteManagementInputSchema,
    outputSchema: AutomatedSiteManagementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate site management plan. The AI model did not return any output.');
    }
    return output;
  }
);
