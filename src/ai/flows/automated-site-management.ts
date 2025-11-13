
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
import { saveArticle } from '@/lib/actions';

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
    content: z.string().describe('The full, well-structured, and SEO-optimized article content, with a minimum of 500 words, formatted in Markdown.'),
  }).describe('A complete, ready-to-publish article generated for the best suggested topic.'),
  googleSitesHtml: z.string().describe('The full article content formatted as simple, clean HTML code, using <h1> for the title, <h2> for subheadings, and <p> for paragraphs, ready to be embedded in a Google Site or used in the blog.'),
});
export type AutomatedSiteManagementOutput = z.infer<typeof AutomatedSiteManagementOutputSchema>;


// --- MOCKED AI IMPLEMENTATION ---
async function runMockedSiteManagement(input: AutomatedSiteManagementInput): Promise<AutomatedSiteManagementOutput> {
    await new Promise(resolve => setTimeout(resolve, 2500));

    const topic = input.topicFocus || "The Rise of AI in Digital Marketing";
    
    const articleTitle = `Unlocking Growth: A Deep Dive into ${topic}`;
    const articleContent = `## The Landscape of Modern Advertising
In today's fast-paced digital world, leveraging technology is no longer optional—it's essential. This article explores how ${topic} is revolutionizing the industry.

### Key Strategies for Success
1.  **Data-Driven Decisions:** Use analytics to understand your audience.
2.  **Personalization at Scale:** Deliver tailored messages to every user.
3.  **Optimize for ROI:** Ensure every dollar spent is maximized for impact.

This is a mocked article demonstrating the AI's capability to generate content. In a real scenario, this would be a full, 500+ word article with deep insights into ${topic}.`;

    const htmlContent = `<h1>${articleTitle}</h1><h2>The Landscape of Modern Advertising</h2><p>In today's fast-paced digital world, leveraging technology is no longer optional—it's essential. This article explores how ${topic} is revolutionizing the industry.</p><h3>Key Strategies for Success</h3><ol><li><strong>Data-Driven Decisions:</strong> Use analytics to understand your audience.</li><li><strong>Personalization at Scale:</strong> Deliver tailored messages to every user.</li><li><strong>Optimize for ROI:</strong> Ensure every dollar spent is maximized for impact.</li></ol><p>This is a mocked article demonstrating the AI's capability to generate content. In a real scenario, this would be a full, 500+ word article with deep insights into ${topic}.</p>`;

    const output: AutomatedSiteManagementOutput = {
        suggestedTopics: [
            "Top 5 AI Tools for Marketers in 2025",
            `Advanced SEO Techniques for ${topic}`,
            "The Future of Programmatic Advertising"
        ],
        keywordSuggestions: [
            "AI marketing automation", "SEO content strategy", "digital advertising trends", "customer journey mapping"
        ],
        generatedArticle: {
            title: articleTitle,
            content: articleContent,
        },
        googleSitesHtml: htmlContent
    };

    // Save the mocked article to the database so it appears in the admin panel
    try {
        await saveArticle({
            title: output.generatedArticle.title,
            content: output.generatedArticle.content,
            html_content: output.googleSitesHtml,
            keywords: output.keywordSuggestions.join(', '),
        });
    } catch (dbError) {
        console.error("Mocked Mode: Failed to save article to DB, but continuing.", dbError);
    }
    
    return output;
}

export async function automatedSiteManagement(
  input: AutomatedSiteManagementInput
): Promise<AutomatedSiteManagementOutput> {
  // If the AI key is not present, run the mocked version.
  if (!process.env.GEMINI_API_KEY) {
      console.log("Running in mocked AI mode for site management.");
      return runMockedSiteManagement(input);
  }

  if (!ai) {
      console.error('AI service is not available. GEMINI_API_KEY might be missing.');
      throw new Error("The AI service is not configured. The GEMINI_API_KEY is missing. AI functionality is disabled.");
  }
  try {
    return await automatedSiteManagementFlow(input);
  } catch (error) {
     console.error(`Automated site management failed: ${error instanceof Error ? error.message : String(error)}`);
     throw new Error('The AI failed to generate the SEO plan. This might be due to a temporary issue with the AI service or an invalid API key. Please try again later.');
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
4.  **Write a Masterpiece:** Write a complete, comprehensive, and SEO-optimized article for your chosen topic. It must be at least 500 words and well-structured with headings and paragraphs. The content should be in plain text or Markdown, not HTML.
5.  **Format for Publishing:** Take the generated article and format it as a single block of clean, simple HTML. Use <h1> for the title, <h2> for subheadings, and <p> for paragraphs. This HTML will be used for embedding or for the site's blog.

Your final output must be a single JSON object matching the specified format.`,
});

const automatedSiteManagementFlow = ai.defineFlow(
  {
    name: 'automatedSiteManagementFlow',
    inputSchema: AutomatedSiteManagementInputSchema,
    outputSchema: AutomatedSiteManagementOutputSchema,
  },
  async input => {
    if (!prompt) {
        throw new GenkitError({
            status: 'UNAVAILABLE',
            message: 'AI prompt is not configured. The application may be starting up or the API key is missing.',
        });
    }

    const {output} = await prompt(input);
    if (!output) {
      throw new GenkitError({
        status: 'UNAVAILABLE',
        message: 'The AI model did not return a response. This may be due to an invalid API key, a billing issue, or a network problem.',
      });
    }

    // Save the generated article to the database
    try {
        await saveArticle({
            title: output.generatedArticle.title,
            content: output.generatedArticle.content,
            html_content: output.googleSitesHtml,
            keywords: output.keywordSuggestions.join(', '),
        });
    } catch (dbError) {
        // Log the error but don't block the response to the user
        console.error("Failed to save article to DB, but continuing to return result to user.", dbError);
    }
    
    return output;
  }
);
