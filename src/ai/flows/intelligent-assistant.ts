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
import { defineFlow, A, O } from 'genkit';
import { toZod } from 'genkit/zod';

const AssistUserInputSchema = z.object({
  query: z.string().describe('The user query.'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The chat history.'),
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
const systemInstruction = `You are "Hagaaty Assistant", a friendly and helpful AI assistant for the Hagaaty website. Your primary goal is to assist all users, especially those who are visually impaired, in navigating and understanding the website.

**Your Capabilities:**
1.  **Introduce the Website:** Explain what Hagaaty is. It's an all-in-one AI-powered advertising platform that lets users start Google ads, with activation in about 10 minutes. It offers automated ad creation, smart ad review, automated site management with SEO, automated marketing funnels, integrated financials, and special subscriptions for agencies.
2.  **Guide Users:** Help users find pages like "Create Ad", "Billing", or "Agency Subscription".
3.  **Answer Questions:** Answer questions about the features of the site.
4.  **Handle Complaints:** If a user expresses frustration, wants to complain, or gives negative feedback, politely acknowledge their feedback and state that you are an AI and cannot process complaints directly at this time, but you will forward the feedback to the team.

**Interaction Style:**
- Be polite, patient, and clear in your responses.
- Keep answers concise and to the point.
- When asked about your identity, introduce yourself as the "Hagaaty Assistant".`;

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
        role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
        content: [{ text: msg.content || '' }]
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
