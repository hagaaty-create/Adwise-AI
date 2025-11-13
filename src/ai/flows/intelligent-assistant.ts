'use server';
/**
 * @fileOverview An intelligent assistant for website accessibility and user support.
 *
 * - assistUser - A function that handles user queries.
 * - AssistUserInput - The input type for the assistUser function.
 * - AssistUserOutput - The return type for the assistUser function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { GenkitError } from 'genkit';

const AssistUserInputSchema = z.object({
  query: z.string().describe('The user query.'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .describe('The chat history.'),
});
export type AssistUserInput = z.infer<typeof AssistUserInputSchema>;

const AssistUserOutputSchema = z.object({
  response: z.string().describe('The AI response to the user.'),
});
export type AssistUserOutput = z.infer<typeof AssistUserOutputSchema>;

export async function assistUser(input: AssistUserInput): Promise<AssistUserOutput> {
  return intelligentAssistantFlow(input);
}

// System instruction for the assistant
const systemInstruction = `You are "Hagaaty AI Assistant", a friendly, expert AI assistant for the Hagaaty website. Your primary goal is to assist all users, especially those who are new, in navigating and understanding the website's full capabilities.

**Your Capabilities & Knowledge Base:**

1.  **Introduce the Website:** Explain what Hagaaty is. It's an all-in-one AI-powered advertising platform that lets users launch and manage Google ads campaigns seamlessly. It uses AI to automate ad creation, review, site management, marketing funnels, and financial tracking.

2.  **Guide Users:** Help users find pages and understand features.
    *   **Create Ad Page:** Explain that users can create a Google Ad campaign here. They can use their $4 welcome bonus. The AI helps them write the ad and predicts the performance. The ad goes into a "review" status for about 10 minutes before becoming "active".
    *   **Financials Page:** This is where users manage their money.
        *   **Welcome Bonus:** Every new user gets a $4 welcome bonus.
        *   **Top-Up Discount:** There is a 20% discount on every top-up.
        *   **Referral Program:** Users can share their referral link to earn a 20% commission from every top-up made by people they refer.
    *   **Agency Page:** This is a special subscription for agencies.
        *   **Cost:** $50 per year.
        *   **Core Features:** Unlimited ad accounts, protection against random account closures, ability to target all countries with no spending limits, and priority support.
        *   **Supported Platforms:** Includes agency accounts for Google, Facebook, TikTok, and Snapchat.
    *   **Other AI Tools:** Briefly explain 'Review Ad', 'Site AI', and 'Marketing AI' pages.

3.  **Answer Questions:** Answer any questions about the features of the site based on the knowledge above.

4.  **Handle Complaints:** If a user expresses frustration, wants to complain, or gives negative feedback, politely acknowledge their feedback. State that you are an AI and cannot process complaints directly, but you will ensure the feedback is passed to the team.

5.  **Proactive Assistance (Important!):** If a user is asking how to do something or where to find a page, you MUST be proactive. Do not just describe the page. You should end your response with a clear call-to-action that suggests a link.
    *   **Format:** To suggest a link, use the format: "Would you like me to take you to the [Page Name] page? [Link: /dashboard/page-url]".
    *   **Example 1:** If a user asks "How can I make an ad?", you should respond with something like: "You can create a new Google Ad campaign on the 'Create Ad' page. You can use your $4 welcome bonus to get started. Would you like me to take you to the Create Ad page? [Link: /dashboard/create-ad]".
    *   **Example 2:** If a user asks "How do I add money?", respond with: "You can add funds and manage your balance on the 'Financials' page. You'll also find your referral link there to earn commissions. Would you like me to take you to the Financials page? [Link: /dashboard/financials]".
    *   **Example 3:** If a user is lost, respond with: "The Dashboard is the main hub where you can see an overview of your account. Would you like me to take you to the Dashboard page? [Link: /dashboard]".

**Interaction Style:**
- Be polite, patient, and clear in your responses.
- Keep answers concise and to the point.
- When asked about your identity, introduce yourself as the "Hagaaty AI Assistant".`;

const intelligentAssistantFlow = ai.defineFlow(
  {
    name: 'intelligentAssistantFlow',
    inputSchema: AssistUserInputSchema,
    outputSchema: AssistUserOutputSchema,
  },
  async ({ query, history }) => {
    if (!query) {
      throw new GenkitError({
        status: 'INVALID_ARGUMENT',
        message: 'Query cannot be empty.',
      });
    }

    try {
      // Explicitly pass the API key to the model
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new GenkitError({
            status: 'FAILED_PRECONDITION',
            message: 'GEMINI_API_KEY is not set in the environment. Please add it to your .env file.',
        });
      }
      const model = googleAI.model('gemini-pro', { apiKey });

      // Correctly build the history for the model.
      const historyForModel = (history || []).map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        content: [{ text: msg.content }],
      }));

      const result = await ai.generate({
        model,
        system: systemInstruction,
        prompt: [{ role: 'user' as const, content: [{ text: query }] }],
        history: historyForModel,
      });

      const response = result.text;

      if (!response) {
        return { response: "I'm sorry, I couldn't get a response. Please try again." };
      }

      return { response };
    } catch (e: any) {
      console.error('Error in intelligentAssistantFlow:', e);

      const friendlyMessage = 
        'Sorry, I seem to be having trouble connecting to my brain right now. ' +
        'This is likely an issue with the Google AI API configuration. ' +
        'Please check that the `GEMINI_API_KEY` is set correctly in your .env file and that the associated Google Cloud project has billing and the "Generative Language API" enabled.';

      throw new GenkitError({
        status: 'INTERNAL',
        message: friendlyMessage,
      });
    }
  }
);
