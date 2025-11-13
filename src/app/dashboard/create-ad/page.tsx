'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createAutomatedAdCampaign } from '@/ai/flows/automated-ad-creation';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2 } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { addTransaction } from '@/lib/actions'; // Use addTransaction instead of addUserBalance for consistency

const formSchema = z.object({
  headline: z.string().min(10, { message: 'Headline must be at least 10 characters.' }),
  productDescription: z.string().min(20, { message: 'Product description must be at least 20 characters.' }),
  keywords: z.string().min(3, { message: 'Please enter at least one keyword.' }),
  targetAudience: z.string().min(10, { message: 'Target audience must be at least 10 characters.' }),
  location: z.string().min(2, { message: 'Location is required.' }),
  budget: z.coerce.number().min(1, { message: 'Budget must be at least $1.' }).max(4, { message: 'You can only use your $4 welcome bonus for now.' }),
  campaignDurationDays: z.coerce.number().int().min(1, { message: 'Duration must be at least 1 day.' }),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateAdPage() {
  const router = useRouter();
  const { translations } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      headline: '',
      productDescription: '',
      keywords: '',
      targetAudience: 'Professionals aged 25-45 interested in marketing technology.',
      location: 'Egypt',
      budget: 4,
      campaignDurationDays: 1,
    },
  });

  async function onSubmit(values: FormData) {
    setIsGenerating(true);
    toast.info('AI is generating your Google Ad campaign...', {
        description: 'This may take a moment. Please wait.',
    });

    try {
      const result = await createAutomatedAdCampaign({
        adName: values.headline,
        productDescription: values.productDescription,
        targetAudience: values.targetAudience,
        budget: values.budget,
        campaignDurationDays: values.campaignDurationDays,
        platforms: ['Google'],
        headline: values.headline,
        keywords: values.keywords,
        location: values.location,
      });
      
      const newCampaign = {
        id: `camp_${Date.now()}`,
        headline: values.headline,
        status: 'review', // Starts in review
        adCopy: result.campaignSummaries[0].adCopy,
        predictedReach: result.campaignSummaries[0].predictedReach,
        predictedConversions: result.campaignSummaries[0].predictedConversions,
        budget: values.budget,
        duration: values.campaignDurationDays,
        adSpend: 0,
        impressions: 0,
        clicks: 0,
        startDate: new Date().toISOString(),
      };

      const existingCampaigns = JSON.parse(sessionStorage.getItem('userCampaigns') || '[]');
      existingCampaigns.push(newCampaign);
      sessionStorage.setItem('userCampaigns', JSON.stringify(existingCampaigns));

      // Deduct budget by creating a negative transaction
      const userId = '1c82831c-4b68-4e1a-9494-27a3c3b4a5f7'; // Hardcoded user ID for demo
      const transactionDescription = `Ad Campaign: ${values.headline}`;
      await addTransaction(userId, -values.budget, transactionDescription);

      // Notify other tabs/components of the balance change
      sessionStorage.setItem('newTransaction', 'true');
      window.dispatchEvent(new Event('storage'));
      sessionStorage.removeItem('newTransaction');


      toast.success('Google Ad campaign generated successfully!', {
        description: 'Your campaign is now under review and can be tracked on the My Campaigns page.'
      });
      
      router.push('/dashboard/campaigns');

    } catch (error) {
      console.error('Failed to create ad campaign:', error);
      toast.error('Failed to create ad campaign', {
        description: 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>إنشاء إعلان Google باستخدام الذكاء الاصطناعي</CardTitle>
          <CardDescription>املأ التفاصيل أدناه. سيقوم الذكاء الاصطناعي بإطلاق حملتك الإعلانية باستخدام مكافأة الترحيب البالغة 4 دولارات.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="headline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان الإعلان</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: مستقبل الإعلان بالذكاء الاصطناعي هنا" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="productDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف الإعلان</FormLabel>
                        <FormControl>
                          <Textarea placeholder="صف ما تعلن عنه بالتفصيل." className="resize-none" rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="keywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الكلمات المفتاحية</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: تسويق ذكاء اصطناعي, إعلانات جوجل, saas" {...field} />
                        </FormControl>
                        <FormDescription>كلمات مفتاحية مفصولة بفواصل للاستهداف.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-6">
                   <FormField
                    control={form.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الجمهور المستهدف</FormLabel>
                        <FormControl>
                          <Textarea placeholder="مثال: الشباب المحترفون الذين تتراوح أعمارهم بين 25-35 عامًا والمهتمون بالتكنولوجيا واللياقة البدنية." className="resize-none" rows={2} {...field} />
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الموقع</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: مصر, القاهرة" {...field} />
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الميزانية ($)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="campaignDurationDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المدة (بالأيام)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-start pt-4">
                <Button type="submit" disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    تفعيل الحملة بمكافأة 4$
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
