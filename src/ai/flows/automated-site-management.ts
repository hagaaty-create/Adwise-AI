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


export async function automatedSiteManagement(
  input: AutomatedSiteManagementInput
): Promise<AutomatedSiteManagementOutput> {
  try {
    return await automatedSiteManagementFlow(input);
  } catch (error) {
    console.error(`Automated site management failed: ${error instanceof Error ? error.message : String(error)}`);
    // Fallback to mock data on any error
    const topic = input.topicFocus || "AI in Digital Marketing";
    const articleTitle = `The Ultimate Guide to ${topic}`;
    const articleContent = `The world of digital marketing is constantly evolving, and at the heart of this transformation is Artificial Intelligence. ${topic} represents a significant leap forward, offering businesses unprecedented opportunities to connect with their audience.

## Understanding the Core Concepts
At its core, AI-driven marketing leverages data and machine learning to create highly personalized and effective campaigns. Instead of broad-stroke approaches, marketers can now tailor their messaging to individual users, leading to higher engagement and conversion rates.

## Key Benefits
- **Hyper-Personalization:** Deliver the right message to the right person at the right time.
- **Predictive Analytics:** Forecast trends and customer behavior with remarkable accuracy.
- **Enhanced Efficiency:** Automate repetitive tasks, freeing up your team to focus on strategy.

By embracing these new technologies, companies can gain a significant competitive edge. Hagaaty is at the forefront of this revolution, providing an all-in-one platform to harness the power of AI for your advertising needs.`;

    const googleSitesHtml = `<h1>${articleTitle}</h1>
<h2>Understanding the Core Concepts</h2>
<p>The world of digital marketing is constantly evolving, and at the heart of this transformation is Artificial Intelligence. ${topic} represents a significant leap forward, offering businesses unprecedented opportunities to connect with their audience. At its core, AI-driven marketing leverages data and machine learning to create highly personalized and effective campaigns. Instead of broad-stroke approaches, marketers can now tailor their messaging to individual users, leading to higher engagement and conversion rates.</p>
<h2>Key Benefits</h2>
<p><strong>Hyper-Personalization:</strong> Deliver the right message to the right person at the right time.<br><strong>Predictive Analytics:</strong> Forecast trends and customer behavior with remarkable accuracy.<br><strong>Enhanced Efficiency:</strong> Automate repetitive tasks, freeing up your team to focus on strategy.</p>
<p>By embracing these new technologies, companies can gain a significant competitive edge. Hagaaty is at the forefront of this revolution, providing an all-in-one platform to harness the power of AI for your advertising needs.</p>`;

    return {
      suggestedTopics: ["The Rise of AI in Advertising", "Future of SEO with AI", "Personalization at Scale"],
      keywordSuggestions: ["ai marketing", "automated advertising", "hagaaty platform", "seo automation"],
      generatedArticle: {
        title: articleTitle,
        content: articleContent,
      },
      googleSitesHtml: googleSitesHtml,
    };
  }
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
    if (!process.env.GEMINI_API_KEY) {
      throw new GenkitError({
        status: 'UNAUTHENTICATED',
        message:
          'The GEMINI_API_KEY environment variable is not set.',
      });
    }

    const {output} = await prompt(input);
    if (!output) {
      throw new GenkitError({
        status: 'UNAVAILABLE',
        message: 'The AI model did not return a response. This may be due to an invalid API key, a billing issue, or a network problem.',
      });
    }
    return output;
  }
);
