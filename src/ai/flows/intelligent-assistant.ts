
'use server';
/**
 * @fileOverview An intelligent assistant for website accessibility and user support.
 *
 * - assistUser - A function that handles user queries.
 * - AssistUserInput - The input type for the assistUser function.
 * - AssistUserOutput - The return type for the assistUser function.
 */

import { z } from 'zod';

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


// --- MOCKED AI IMPLEMENTATION ---
async function runMockedAssistant(input: AssistUserInput): Promise<AssistUserOutput> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const query = input.query.toLowerCase();

    let response = "I'm sorry, I don't understand that. Can you please rephrase? You can ask me about creating ads, financials, or the agency subscription.";

    if (query.includes('create') || query.includes('ad') || query.includes('campaign')) {
        response = "You can create a new Google Ad campaign on the 'Create Ad' page. You can use your $4 welcome bonus to get started. Would you like me to take you to the Create Ad page? [Link: /dashboard/create-ad]";
    } else if (query.includes('money') || query.includes('balance') || query.includes('financials') || query.includes('top-up')) {
        response = "You can manage your balance, top-up your account, and see your referral earnings on the 'Financials' page. Would you like me to take you to the Financials page? [Link: /dashboard/financials]";
    } else if (query.includes('agency') || query.includes('subscription')) {
        response = "The Agency subscription offers unlimited ad accounts and priority support for $50/year. Would you like me to take you to the Agency page? [Link: /dashboard/subscription]";
    } else if (query.includes('hello') || query.includes('hi')) {
        response = "Hello! I am the Hagaaty AI Assistant. How can I help you today?";
    }

    return { response };
}

export async function assistUser(input: AssistUserInput): Promise<AssistUserOutput> {
  // Always run the mocked version.
  console.log("Running in forced mocked AI mode for assistant.");
  return runMockedAssistant(input);
}
