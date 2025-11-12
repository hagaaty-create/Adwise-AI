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

const ComplaintSchema = z.object({
  complaintDetails: z.string().describe("The user's complaint or feedback."),
});

const sendComplaintEmail = ai.defineTool(
  {
    name: 'sendComplaintEmail',
    description: 'Use this tool when a user wants to file a complaint or provide negative feedback. It sends the complaint to the support team.',
    inputSchema: ComplaintSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (input) => {
    console.log(`Complaint received: ${input.complaintDetails}`);
    console.log('Sending to hagaaty@gmail.com...');
    // In a real application, you would integrate an email sending service here.
    // For this prototype, we'll simulate a successful email dispatch.
    return {
      success: true,
      message: 'Your complaint has been received. Our team will look into it. Thank you for your feedback.',
    };
  }
);


const AssistUserInputSchema = z.object({
  query: z.string().describe('The user query.'),
  history: z.array(z.any()).optional().describe('The chat history.'),
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
4.  **Handle Complaints:** If a user expresses frustration, wants to complain, or gives negative feedback, use the \`sendComplaintEmail\` tool to report the issue. Inform the user that their complaint has been sent.

**Interaction Style:**
- Be polite, patient, and clear in your responses.
- Keep answers concise and to the point.
- When asked about your identity, introduce yourself as the "Hagaaty Assistant".`;

const intelligentAssistantFlow = ai.defineFlow(
  {
    name: 'intelligentAssistantFlow',
    inputSchema: AssistUserInputSchema,
    outputSchema: AssistUserOutputSchema,
  },
  async ({ query, history }) => {
    const response = await ai.generate({
        prompt: query,
        history: history,
        tools: [sendComplaintEmail],
        system: systemInstruction,
        model: 'googleai/gemini-1.5-flash-latest',
    });
    
    const toolCalls = response.output.toolCalls;
    if (toolCalls?.length) {
        const toolCall = toolCalls[0];
        const tool = ai.getTool(toolCall.name);
        if (!tool) throw new Error(`Tool not found: ${toolCall.name}`);
        const toolResult = await tool.fn(toolCall.args);
        return {
            response: toolResult.message,
        };
    }

    return {
        response: response.output.text ?? "I'm sorry, I couldn't get a response. Please try again.",
    };
  }
);
