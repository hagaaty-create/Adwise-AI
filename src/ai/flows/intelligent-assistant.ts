
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
    await new Promise(resolve => setTimeout(resolve, 800)); // Increased delay for more realism
    const query = input.query.toLowerCase().trim();

    // Greeting
    if (query.includes('hello') || query.includes('hi') || query.includes('welcome') || query.includes('مرحبا') || query.includes('أهلا')) {
        return { response: "Hello! I am your Hagaaty AI assistant. How can I help you navigate the platform or understand its features today?" };
    }
    
    // Creating Ads
    if (query.includes('ad') || query.includes('campaign') || query.includes('create') || query.includes('إعلان') || query.includes('حملة')) {
        return { response: "You can create a new Google Ad campaign from the 'Create Ad' page. There, you'll fill in your ad details like headline, description, keywords, and budget. Our AI will then generate the ad copy and launch it. Would you like me to take you there now? [Link: /dashboard/create-ad]" };
    }

    // Checking Campaigns / Performance
    if (query.includes('my campaigns') || query.includes('performance') || query.includes('results') || query.includes('track') || query.includes('أداء') || query.includes('نتائج')) {
        return { response: "You can monitor all your active and past campaigns on the 'My Campaigns' page. You can see detailed metrics like impressions, clicks, and ad spend for each one. Would you like me to take you to the My Campaigns page? [Link: /dashboard/campaigns]" };
    }

    // Financials / Balance / Top-up
    if (query.includes('money') || query.includes('balance') || query.includes('financials') || query.includes('top-up') || query.includes('deposit') || query.includes('رصيد') || query.includes('شحن') || query.includes('فلوس') || query.includes('ماليات')) {
        return { response: "The 'Financials' page is your hub for all money-related activities. You can top-up your balance using various methods, track all your transactions, and manage your referral earnings. Would you like me to guide you to the Financials page? [Link: /dashboard/financials]" };
    }
    
    // Referrals / Withdrawals
    if (query.includes('referral') || query.includes('withdraw') || query.includes('earnings') || query.includes('سحب') || query.includes('أرباح') || query.includes('إحالة')) {
        return { response: "You can track your referral earnings and request a withdrawal from the 'Financials' page. Simply enter the amount you wish to withdraw and your Vodafone Cash number. Would you like to go to the Financials page now? [Link: /dashboard/financials]" };
    }
    
    // Admin Panel
    if (query.includes('admin') || query.includes('users') || query.includes('manage') || query.includes('مسؤول')) {
        // This response assumes the check for admin role is done on the frontend or via routing.
        return { response: "The Admin Panel is for managing users, campaigns, and site content. It is restricted to administrators only. You can access it via the sidebar if you have the correct permissions. Would you like to try navigating to the Admin Panel? [Link: /dashboard/admin]" };
    }

    // Blog / Articles
    if (query.includes('blog') || query.includes('articles') || query.includes('content') || query.includes('مقالات') || query.includes('مدونة')) {
        return { response: "Our AI generates SEO-optimized articles about digital marketing. You can read them on our public blog to get the latest insights. Would you like me to take you to the Blog? [Link: /blog]" };
    }
    
    // How it works / General help
    if (query.includes('how') || query.includes('help') || query.includes('work') || query.includes('كيف') || query.includes('مساعدة')) {
        return { response: "I can help you with many things! You can ask me how to create an ad, check your campaign performance, manage your financials, or understand our referral program. What would you like to know more about?" };
    }
    
    // Default fallback response
    let response = "I'm sorry, I'm not sure how to answer that. Please try rephrasing. You can ask me about:\n- Creating an ad\n- Checking campaign performance\n- Managing your balance and withdrawals\n- How the referral program works";

    return { response };
}


export async function assistUser(input: AssistUserInput): Promise<AssistUserOutput> {
  // Always run the mocked version.
  return runMockedAssistant(input);
}
