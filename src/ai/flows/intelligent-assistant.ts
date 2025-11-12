'use server';
/**
 * @fileOverview An intelligent assistant for website accessibility and user support.
 *
 * - assistUser - A function that handles user queries.
 * - AssistUserInput - The input type for the assistUser function.
 * - AssistUserOutput - The return type for the assistUser function.
 */

import { ai } from '@/ai/genkit';
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
const systemInstruction = `You are "AdWise AI Assistant", a friendly, expert AI assistant for the AdWise.ai website. Your primary goal is to assist all users, especially those who are new, in navigating and understanding the website's full capabilities.

**Your Capabilities & Knowledge Base:**

1.  **Introduce the Website:** Explain what AdWise.ai is. It's an all-in-one AI-powered advertising platform that lets users launch and manage Google ads campaigns seamlessly. It uses AI to automate ad creation, review, site management, marketing funnels, and financial tracking.

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

**Interaction Style:**
- Be polite, patient, and clear in your responses.
- Keep answers concise and to the point.
- When asked about your identity, introduce yourself as the "AdWise AI Assistant".`;

const assistantPrompt = ai.definePrompt({
  name: 'hagaatyAssistantPrompt',
  model: 'googleai/gemini-pro',
  system: systemInstruction,
});

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

    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'assistant' ? ('model' as const) : ('user' as const),
      content: [{ text: msg.content || '' }],
    }));

    try {
      const result = await assistantPrompt({
        prompt: query,
        history: formattedHistory,
      });

      const response = result.text;

      if (!response) {
        return { response: "I'm sorry, I couldn't get a response. Please try again." };
      }

      return { response };
    } catch (e) {
      console.error('Error in intelligentAssistantFlow:', e);
      throw new GenkitError({
        status: 'INTERNAL',
        message: 'An error occurred while processing the request with the AI model.',
      });
    }
  }
);
