'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createAutomatedAdCampaign, AutomatedAdCampaignOutput } from '@/ai/flows/automated-ad-creation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, CheckCircle, Clock, BarChart2, DollarSign, Eye, MousePointerClick } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

export type CampaignStatus = 'pending' | 'review' | 'active' | 'finished';
export interface CampaignMetrics {
  adSpend: number;
  impressions: number;
  clicks: number;
  status: CampaignStatus;
}


const platformIcons: { [key: string]: React.ReactNode } = {
  Google: <svg role="img" viewBox="0 0 24 24" className="h-6 w-6"><path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.75 8.36,4.73 12.19,4.73C15.28,4.73 17.27,6.48 17.27,6.48L19.43,4.18C19.43,4.18 16.71,2.05 12.19,2.05C6.7,2.05 2.5,6.73 2.5,12C2.5,17.27 6.7,21.95 12.19,21.95C18.08,21.95 21.5,17.5 21.5,12.33C21.5,11.76 21.45,11.43 21.35,11.1Z"></path></svg>,
};

export default function CreateAdPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<AutomatedAdCampaignOutput | null>(null);
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus>('pending');
  const [adSpend, setAdSpend] = useState(0);
  const [impressions, setImpressions] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [campaignData, setCampaignData] = useState<FormData | null>(null);


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

  useEffect(() => {
    // Simulate loading existing campaign data
    const savedCampaignStatus = sessionStorage.getItem('campaignStatus') as CampaignStatus | null;
    if (savedCampaignStatus && savedCampaignStatus !== 'pending') {
      const savedResults = JSON.parse(sessionStorage.getItem('campaignResults') || 'null');
      const savedData = JSON.parse(sessionStorage.getItem('campaignData') || 'null');
      const savedMetrics = JSON.parse(sessionStorage.getItem('campaignMetrics') || 'null');

      setResults(savedResults);
      setCampaignData(savedData);
      setCampaignStatus(savedCampaignStatus);
      if (savedMetrics) {
        setAdSpend(savedMetrics.adSpend);
        setImpressions(savedMetrics.impressions);
        setClicks(savedMetrics.clicks);
      }
    }
    setIsLoading(false);
  }, []);
  
  const updateGlobalMetrics = (metrics: CampaignMetrics) => {
    sessionStorage.setItem('campaignMetrics', JSON.stringify(metrics));
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (campaignStatus === 'active' && results && campaignData) {
        const campaignSummary = results.campaignSummaries[0];
        const totalSpend = campaignSummary.estimatedCost;
        const totalImpressions = campaignSummary.predictedReach;
        const totalClicks = campaignSummary.predictedConversions;
        const totalDurationSeconds = campaignData.campaignDurationDays * 24 * 60 * 60;
        
        let elapsedSeconds = parseFloat(sessionStorage.getItem('elapsedSeconds') || '0');

        interval = setInterval(() => {
            elapsedSeconds += 2; 
            sessionStorage.setItem('elapsedSeconds', elapsedSeconds.toString());
            
            const progress = Math.min(elapsedSeconds / totalDurationSeconds, 1);
            
            const currentAdSpend = totalSpend * progress;
            const currentImpressions = Math.floor(totalImpressions * progress);
            const currentClicks = Math.floor(totalClicks * progress);

            setAdSpend(currentAdSpend);
            setImpressions(currentImpressions);
            setClicks(currentClicks);
            
            const metrics = { adSpend: currentAdSpend, impressions: currentImpressions, clicks: currentClicks, status: 'active' as CampaignStatus };
            updateGlobalMetrics(metrics);


            if (progress >= 1) {
                setCampaignStatus('finished');
                sessionStorage.setItem('campaignStatus', 'finished');
                updateGlobalMetrics({ adSpend: totalSpend, impressions: totalImpressions, clicks: totalClicks, status: 'finished' });
                toast.success('Your campaign has finished!');
                clearInterval(interval);
            }
        }, 2000);
    }
    
    return () => {
        if (interval) {
            clearInterval(interval);
        }
    };
  }, [campaignStatus, results, campaignData]);


  async function onSubmit(values: FormData) {
    setIsGenerating(true);
    setResults(null);
    setCampaignStatus('pending');
    setAdSpend(0);
    setImpressions(0);
    setClicks(0);
    sessionStorage.clear();
    updateGlobalMetrics({ adSpend: 0, impressions: 0, clicks: 0, status: 'pending' });


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
      setResults(result);
      setCampaignData(values);
      setCampaignStatus('review');
      
      sessionStorage.setItem('campaignResults', JSON.stringify(result));
      sessionStorage.setItem('campaignData', JSON.stringify(values));
      sessionStorage.setItem('campaignStatus', 'review');
      sessionStorage.setItem('elapsedSeconds', '0');
      // Set a transaction in session storage to be picked up by financials page
      const transaction = {
        id: `trx-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: `Ad Campaign: ${values.headline}`,
        amount: -values.budget,
        type: 'debit',
      };
      sessionStorage.setItem('newTransaction', JSON.stringify(transaction));


      toast.success('Google Ad campaign generated successfully!');
      
      setTimeout(() => {
        setCampaignStatus('active');
        sessionStorage.setItem('campaignStatus', 'active');
        updateGlobalMetrics({ adSpend: 0, impressions: 0, clicks: 0, status: 'active' });
        toast.success('Your campaign is now active and running!');
      }, 10000);

    } catch (error) {
      console.error('Failed to create ad campaign:', error);
      toast.error('Failed to create ad campaign', {
        description: 'An unexpected error occurred. Please try again later.',
      });
      setCampaignStatus('pending');
      updateGlobalMetrics({ adSpend: 0, impressions: 0, clicks: 0, status: 'pending' });
    } finally {
      setIsGenerating(false);
    }
  }
  
  function handleCreateNewCampaign() {
    setIsGenerating(false);
    setResults(null);
    setCampaignStatus('pending');
    setCampaignData(null);
    setAdSpend(0);
    setImpressions(0);
    setClicks(0);
    sessionStorage.clear();
    updateGlobalMetrics({ adSpend: 0, impressions: 0, clicks: 0, status: 'pending' });
    form.reset();
  }

  const renderStatusBadge = () => {
    switch (campaignStatus) {
      case 'review':
        return <Badge variant="secondary" className="animate-pulse"><Clock className="ml-2 h-4 w-4" />في المراجعة (تقريباً 10 ثوانٍ)</Badge>;
      case 'active':
        return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="ml-2 h-4 w-4" />نشطة</Badge>;
      case 'finished':
         return <Badge variant="outline">مكتملة</Badge>;
      default:
        return null;
    }
  };
  
  const hasCampaign = campaignStatus !== 'pending';

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
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
                          <Input placeholder="مثال: مستقبل الإعلان بالذكاء الاصطناعي هنا" {...field} disabled={hasCampaign} />
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
                          <Textarea placeholder="صف ما تعلن عنه بالتفصيل." className="resize-none" rows={4} {...field} disabled={hasCampaign} />
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
                          <Input placeholder="مثال: تسويق ذكاء اصطناعي, إعلانات جوجل, saas" {...field} disabled={hasCampaign} />
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
                          <Textarea placeholder="مثال: الشباب المحترفون الذين تتراوح أعمارهم بين 25-35 عامًا والمهتمون بالتكنولوجيا واللياقة البدنية." className="resize-none" rows={2} {...field} disabled={hasCampaign} />
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
                          <Input placeholder="مثال: مصر, القاهرة" {...field} disabled={hasCampaign} />
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
                            <Input type="number" {...field} disabled={hasCampaign} />
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
                            <Input type="number" {...field} disabled={hasCampaign} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-start pt-4">
                 {!hasCampaign ? (
                    <Button type="submit" disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Wand2 className="ml-2 h-4 w-4" />}
                        تفعيل الحملة بمكافأة 4$
                    </Button>
                  ) : (
                      <Button variant="destructive" onClick={handleCreateNewCampaign}>
                         <Wand2 className="ml-2 h-4 w-4" /> إنشاء حملة جديدة
                      </Button>
                  )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {hasCampaign && results && campaignData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <BarChart2 />
                    أداء الحملة المباشر
                </CardTitle>
                {renderStatusBadge()}
            </div>
            <CardDescription>{campaignData.headline}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium flex items-center justify-center gap-1"><DollarSign className="h-4 w-4"/> المنفق</p>
                      <p className="text-2xl font-bold">${adSpend.toFixed(2)}</p>
                  </div>
                   <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium flex items-center justify-center gap-1"><Eye className="h-4 w-4"/> مرات الظهور</p>
                      <p className="text-2xl font-bold">{impressions.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium flex items-center justify-center gap-1"><MousePointerClick className="h-4 w-4"/> النقرات</p>
                      <p className="text-2xl font-bold">{clicks.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium">تكلفة النقرة</p>
                      <p className="text-2xl font-bold">${clicks > 0 ? (adSpend / clicks).toFixed(2) : '0.00'}</p>
                  </div>
              </div>
            
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {platformIcons.Google}
                    تفاصيل الإعلان المُنشأة بواسطة AI
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">نص الإعلان</h4>
                    <p className="text-sm text-muted-foreground bg-slate-100 dark:bg-slate-800 p-3 rounded-md">{results.campaignSummaries[0].adCopy}</p>
                  </div>
                   <div>
                    <h4 className="font-semibold mb-1">الكلمات المفتاحية المستهدفة</h4>
                    <div className="flex flex-wrap gap-2">
                        {campaignData.keywords.split(',').map((kw, i) => <Badge key={i} variant="outline">{kw.trim()}</Badge>)}
                    </div>
                  </div>
                </CardContent>
              </Card>

          </CardContent>
        </Card>
      )}
    </div>
  );
}
