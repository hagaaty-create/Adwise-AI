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
import { GenkitError } from 'genkit';

const AutomatedSiteManagementInputSchema = z.object({
  topicFocus: z
    .string()
    .optional()
    .describe(
      'An optional topic for the AI to focus on. If left blank, the AI will decide the best topic to pursue for maximum SEO impact.'
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


function getFallbackData(): AutomatedSiteManagementOutput {
    const article = {
        title: 'The Future of AI in Advertising (Fallback)',
        content: `The world of advertising is undergoing a seismic shift, and artificial intelligence is the driving force. From hyper-personalized ad copy to predictive analytics, AI is no longer a futuristic concept but a present-day reality for marketers.\n\nOur platform, Hagaaty, leverages this power to provide an all-in-one solution for creating, managing, and optimizing ad campaigns. This article, generated as a fallback due to an API connection issue, demonstrates the quality of content our AI can produce. We explore how AI helps in identifying target audiences with greater precision, automating A/B testing, and dynamically allocating budgets for maximum return on investment.`
    };
    return {
        suggestedTopics: [
            'How AI is Revolutionizing E-commerce Ads',
            'Top 5 AI Tools for Marketers in 2024',
            'Maximizing ROI with AI-Powered PPC Campaigns'
        ],
        keywordSuggestions: [
            'AI advertising platform',
            'automated ad creation',
            'marketing AI',
            'PPC optimization',
            'digital marketing trends'
        ],
        generatedArticle: article,
        googleSitesHtml: `<h1>${article.title}</h1>\n<p>${article.content.replace(/\n\n/g, '</p>\n<p>')}</p>`
    };
}


export async function automatedSiteManagement(
  input: AutomatedSiteManagementInput
): Promise<AutomatedSiteManagementOutput> {
  return automatedSiteManagementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedSiteManagementPrompt',
  input: {schema: AutomatedSiteManagementInputSchema},
  output: {schema: AutomatedSiteManagementOutputSchema},
  prompt: `You are an expert AI SEO strategist and content writer, and your sole mission is to make the "Hagaaty" website dominate search engine rankings. "Hagaaty" is an all-in-one AI-powered advertising platform.

Your task is to act autonomously. You will perform a continuous cycle of analysis and content creation to grow the site's organic traffic.

1.  **Analyze the Landscape:** Research current trends in AI advertising, digital marketing, and platforms like Google Ads. Identify high-potential, low-competition keywords.
2.  **Suggest Growth Areas:** Based on your analysis, propose at least 3 new article topics that will attract our target audience (advertisers, marketers, agencies). Also suggest a list of new keywords to target.
3.  **Choose and Execute:** From your suggested topics, choose the SINGLE most promising one. If a specific "Topic Focus" was provided ({{{topicFocus}}}), prioritize that. Otherwise, make your own decision for maximum impact.
4.  **Write a Masterpiece:** Write a complete, comprehensive, and SEO-optimized article for your chosen topic. It must be at least 500 words, well-structured with headings, and ready for immediate publication. It should be written to establish Hagaaty as a thought leader.
5.  **Format for Publishing:** Take the generated article (title and content) and format it as a single block of clean, simple HTML. Use <h1> for the title, <h2> for subheadings, and <p> for paragraphs. This HTML must be ready to be pasted directly into an "Embed Code" block on a Google Site.

Your final output must be a single JSON object matching the specified format.`,
});

const automatedSiteManagementFlow = ai.defineFlow(
  {
    name: 'automatedSiteManagementFlow',
    inputSchema: AutomatedSiteManagementInputSchema,
    outputSchema: AutomatedSiteManagementOutputSchema,
  },
  async input => {
    try {
      // If the API key is missing, go directly to fallback.
      if (!process.env.GEMINI_API_KEY) {
        console.log('GEMINI_API_KEY is missing. Using fallback data for automatedSiteManagementFlow.');
        return getFallbackData();
      }

      const {output} = await prompt(input);
      if (!output) {
        throw new Error('AI model did not return any output.');
      }
      return output;
    } catch (error) {
        console.error('Error in automatedSiteManagementFlow. Returning fallback data.', error);
        return getFallbackData();
    }
  }
);
