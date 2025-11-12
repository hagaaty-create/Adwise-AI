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

type CampaignStatus = 'pending' | 'review' | 'active' | 'finished';

const platformIcons: { [key: string]: React.ReactNode } = {
  Google: <svg role="img" viewBox="0 0 24 24" className="h-6 w-6"><path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.75 8.36,4.73 12.19,4.73C15.28,4.73 17.27,6.48 17.27,6.48L19.43,4.18C19.43,4.18 16.71,2.05 12.19,2.05C6.7,2.05 2.5,6.73 2.5,12C2.5,17.27 6.7,21.95 12.19,21.95C18.08,21.95 21.5,17.5 21.5,12.33C21.5,11.76 21.45,11.43 21.35,11.1Z"></path></svg>,
};

export default function CreateAdPage() {
  const [isLoading, setIsLoading] = useState(false);
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
    let interval: NodeJS.Timeout | undefined;

    if (campaignStatus === 'active' && results && campaignData) {
        const campaignSummary = results.campaignSummaries[0];
        const totalSpend = campaignSummary.estimatedCost;
        const totalImpressions = campaignSummary.predictedReach;
        const totalClicks = campaignSummary.predictedConversions;
        // Total duration in seconds for the whole campaign
        const totalDurationSeconds = campaignData.campaignDurationDays * 24 * 60 * 60;
        
        let elapsedSeconds = 0;

        interval = setInterval(() => {
            elapsedSeconds += 2; // Simulating time passing every 2 seconds
            
            const progress = Math.min(elapsedSeconds / totalDurationSeconds, 1);
            
            setAdSpend(totalSpend * progress);
            setImpressions(Math.floor(totalImpressions * progress));
            setClicks(Math.floor(totalClicks * progress));

            if (progress >= 1) {
                setCampaignStatus('finished');
                toast.success('Your campaign has finished!');
                clearInterval(interval);
            }
        }, 2000); // Update every 2 seconds
    }
    
    // Cleanup
    return () => {
        if (interval) {
            clearInterval(interval);
        }
    };
  }, [campaignStatus, results, campaignData]);


  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setResults(null);
    setCampaignStatus('pending');
    setCampaignData(values);
    setAdSpend(0);
    setImpressions(0);
    setClicks(0);

    toast.info('AI is generating your Google Ad campaign...', {
        description: 'This may take a moment. Please wait.',
    });
    try {
      const result = await createAutomatedAdCampaign({
        adName: values.headline, // Use headline as adName
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
      toast.success('Google Ad campaign generated successfully!');
      setCampaignStatus('review');
      
      // Simulate review period (10 seconds)
      setTimeout(() => {
        setCampaignStatus('active');
        toast.success('Your campaign is now active and running!');
      }, 10000);

    } catch (error) {
      console.error('Failed to create ad campaign:', error);
      toast.error('Failed to create ad campaign', {
        description: 'An unexpected error occurred. Please try again later.',
      });
      setCampaignStatus('pending');
    } finally {
      setIsLoading(false);
    }
  }

  const renderStatusBadge = () => {
    switch (campaignStatus) {
      case 'review':
        return <Badge variant="secondary" className="animate-pulse"><Clock className="mr-2 h-4 w-4" />In Review (Approx. 10 min)</Badge>;
      case 'active':
        return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-2 h-4 w-4" />Active</Badge>;
      case 'finished':
         return <Badge variant="outline">Finished</Badge>;
      default:
        return null;
    }
  };
  
  const hasCampaign = campaignStatus !== 'pending';


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Google Ad Creation</CardTitle>
          <CardDescription>Fill in the details below. Our AI will launch your ad campaign using your $4 welcome bonus.</CardDescription>
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
                        <FormLabel>Ad Headline</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., The Future of AI Advertising is Here" {...field} />
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
                        <FormLabel>Ad Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe what you are advertising in detail." className="resize-none" rows={4} {...field} />
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
                        <FormLabel>Keywords</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., AI marketing, google ads, saas" {...field} />
                        </FormControl>
                        <FormDescription>Comma-separated keywords for targeting.</FormDescription>
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
                        <FormLabel>Target Audience</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Young professionals aged 25-35 interested in tech and fitness." className="resize-none" rows={2} {...field} />
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
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Egypt, Cairo" {...field} />
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
                          <FormLabel>Budget ($)</FormLabel>
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
                          <FormLabel>Duration (Days)</FormLabel>
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
              <Button type="submit" disabled={isLoading || hasCampaign}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                {hasCampaign ? 'Create a New Campaign' : 'Activate Campaign with $4 Bonus'}
              </Button>
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
                    Live Campaign Performance
                </CardTitle>
                {renderStatusBadge()}
            </div>
            <CardDescription>{campaignData.headline}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium flex items-center justify-center gap-1"><DollarSign className="h-4 w-4"/> Ad Spend</p>
                      <p className="text-2xl font-bold">${adSpend.toFixed(2)}</p>
                  </div>
                   <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium flex items-center justify-center gap-1"><Eye className="h-4 w-4"/> Impressions</p>
                      <p className="text-2xl font-bold">{impressions.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium flex items-center justify-center gap-1"><MousePointerClick className="h-4 w-4"/> Clicks</p>
                      <p className="text-2xl font-bold">{clicks.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium">Cost Per Click</p>
                      <p className="text-2xl font-bold">${clicks > 0 ? (adSpend / clicks).toFixed(2) : '0.00'}</p>
                  </div>
              </div>
            
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {platformIcons.Google}
                    AI-Generated Ad Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">Ad Copy</h4>
                    <p className="text-sm text-muted-foreground bg-slate-100 dark:bg-slate-800 p-3 rounded-md">{results.campaignSummaries[0].adCopy}</p>
                  </div>
                   <div>
                    <h4 className="font-semibold mb-1">Targeted Keywords</h4>
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
