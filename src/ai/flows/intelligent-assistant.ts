
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
        return { response: "أهلاً بك! أنا مساعدك الذكي من 'حاجاتي'. كيف يمكنني مساعدتك في استكشاف المنصة أو فهم ميزاتها اليوم؟" };
    }
    
    // Creating Ads
    if (query.includes('ad') || query.includes('campaign') || query.includes('create') || query.includes('إعلان') || query.includes('حملة')) {
        return { response: "يمكنك إنشاء حملة إعلانية جديدة على جوجل من صفحة 'إنشاء إعلان'. هناك، ستقوم بملء تفاصيل إعلانك مثل العنوان، الوصف، الكلمات المفتاحية، والميزانية. بعد ذلك، سيقوم الذكاء الاصطناعي بإنشاء نص الإعلان وإطلاقه. هل تود أن أنقلك إلى هناك الآن؟ [Link: /dashboard/create-ad]" };
    }

    // Checking Campaigns / Performance
    if (query.includes('my campaigns') || query.includes('performance') || query.includes('results') || query.includes('track') || query.includes('أداء') || query.includes('نتائج')) {
        return { response: "يمكنك متابعة جميع حملاتك النشطة والسابقة في صفحة 'حملاتي'. سترى هناك مقاييس مفصلة مثل مرات الظهور، النقرات، والمبلغ الذي تم إنفاقه لكل حملة. هل تود الذهاب إلى صفحة 'حملاتي'؟ [Link: /dashboard/campaigns]" };
    }

    // Financials / Balance / Top-up
    if (query.includes('money') || query.includes('balance') || query.includes('financials') || query.includes('top-up') || query.includes('deposit') || query.includes('رصيد') || query.includes('شحن') || query.includes('فلوس') || query.includes('ماليات')) {
        return { response: "صفحة 'الماليات' هي مركزك لكل الأنشطة المتعلقة بالأموال. يمكنك شحن رصيدك باستخدام طرق دفع متنوعة، تتبع جميع معاملاتك، وإدارة أرباح الإحالة الخاصة بك. هل تود أن أرشدك إلى صفحة 'الماليات'؟ [Link: /dashboard/financials]" };
    }
    
    // Referrals / Withdrawals
    if (query.includes('referral') || query.includes('withdraw') || query.includes('earnings') || query.includes('سحب') || query.includes('أرباح') || query.includes('إحالة')) {
        return { response: "يمكنك تتبع أرباح الإحالة وطلب سحبها من صفحة 'الماليات'. ببساطة، أدخل المبلغ الذي ترغب في سحبه ورقم فودافون كاش الخاص بك. هل تود الذهاب إلى صفحة 'الماليات' الآن؟ [Link: /dashboard/financials]" };
    }
    
    // Admin Panel
    if (query.includes('admin') || query.includes('users') || query.includes('manage') || query.includes('مسؤول')) {
        // This response assumes the check for admin role is done on the frontend or via routing.
        return { response: "لوحة تحكم المسؤول مخصصة لإدارة المستخدمين والحملات ومحتوى الموقع، وهي متاحة للمسؤولين فقط. يمكنك الوصول إليها من الشريط الجانبي إذا كانت لديك الصلاحيات اللازمة. هل تود محاولة الانتقال إلى لوحة تحكم المسؤول؟ [Link: /dashboard/admin]" };
    }

    // Blog / Articles
    if (query.includes('blog') || query.includes('articles') || query.includes('content') || query.includes('مقالات') || query.includes('مدونة')) {
        return { response: "يقوم الذكاء الاصطناعي لدينا بإنشاء مقالات محسّنة لمحركات البحث حول التسويق الرقمي. يمكنك قراءتها على مدونتنا العامة للاطلاع على أحدث الأفكار. هل تود أن أنقلك إلى المدونة؟ [Link: /blog]" };
    }
    
    // How it works / General help
    if (query.includes('how') || query.includes('help') || query.includes('work') || query.includes('كيف') || query.includes('مساعدة')) {
        return { response: "يمكنني مساعدتك في الكثير من الأمور! يمكنك أن تسألني عن كيفية إنشاء إعلان، أو التحقق من أداء حملتك، أو إدارة أموالك، أو فهم برنامج الإحالة. ما الذي تود معرفة المزيد عنه؟" };
    }
    
    // Default fallback response
    let response = "عذرًا، لست متأكدًا من كيفية الإجابة على ذلك. يرجى محاولة إعادة صياغة السؤال. يمكنك أن تسألني عن:\n- إنشاء إعلان\n- التحقق من أداء الحملة\n- إدارة رصيدك والسحوبات\n- كيف يعمل برنامج الإحالة";

    return { response };
}


export async function assistUser(input: AssistUserInput): Promise<AssistUserOutput> {
  // Always run the mocked version.
  return runMockedAssistant(input);
}
