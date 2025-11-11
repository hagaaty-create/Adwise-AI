'use client';

import { useState } from 'react';
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
import { Loader2, Wand2 } from 'lucide-react';

const formSchema = z.object({
  adName: z.string().min(3, { message: 'Ad name must be at least 3 characters.' }),
  productDescription: z.string().min(20, { message: 'Product description must be at least 20 characters.' }),
  targetAudience: z.string().min(10, { message: 'Target audience must be at least 10 characters.' }),
  budget: z.coerce.number().min(1, { message: 'Budget must be at least $1.' }),
  campaignDurationDays: z.coerce.number().int().min(1, { message: 'Duration must be at least 1 day.' }),
});

type FormData = z.infer<typeof formSchema>;

const platformIcons: { [key: string]: React.ReactNode } = {
  Google: <svg role="img" viewBox="0 0 24 24" className="h-6 w-6"><path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.75 8.36,4.73 12.19,4.73C15.28,4.73 17.27,6.48 17.27,6.48L19.43,4.18C19.43,4.18 16.71,2.05 12.19,2.05C6.7,2.05 2.5,6.73 2.5,12C2.5,17.27 6.7,21.95 12.19,21.95C18.08,21.95 21.5,17.5 21.5,12.33C21.5,11.76 21.45,11.43 21.35,11.1Z"></path></svg>,
};

export default function CreateAdPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AutomatedAdCampaignOutput | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adName: '',
      productDescription: '',
      targetAudience: '',
      budget: 100,
      campaignDurationDays: 7,
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setResults(null);
    toast.info('AI is generating your Google Ad campaign...', {
        description: 'This may take a moment. Please wait.',
    });
    try {
      const result = await createAutomatedAdCampaign({
        ...values,
        platforms: ['Google']
      });
      setResults(result);
      toast.success('Google Ad campaign generated successfully!');
    } catch (error) {
      console.error('Failed to create ad campaign:', error);
      toast.error('Failed to create ad campaign', {
        description: 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Google Ad Creation</CardTitle>
          <CardDescription>Fill in the details below and our AI will write and design your Google Ad campaign.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="adName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ad Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Summer Sale Campaign" {...field} />
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
                        <FormLabel>Product/Service Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe what you are advertising in detail." className="resize-none" rows={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Young professionals aged 25-35 interested in tech and fitness." className="resize-none" rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-4">
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Platform</FormLabel>
                      <FormDescription>Your ads will run exclusively on Google.</FormDescription>
                    </div>
                     <div className="flex items-center space-x-2 rounded-md border border-input p-2 bg-muted">
                        <div className="text-primary">{platformIcons['Google']}</div>
                        <span className="font-medium">Google</span>
                    </div>
                  </FormItem>

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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate Google Campaign
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && !results && (
        <div className="text-center p-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">AI is crafting your campaign...</p>
        </div>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Campaign Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-1">
            {results.campaignSummaries.map((summary, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {platformIcons[summary.platform]}
                    {summary.platform}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                  <div>
                    <h4 className="font-semibold mb-1">AI-Generated Ad Copy</h4>
                    <p className="text-sm text-muted-foreground bg-slate-100 dark:bg-slate-800 p-3 rounded-md">{summary.adCopy}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm font-medium">Predicted Reach</p>
                      <p className="text-lg font-bold">{summary.predictedReach.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Predicted Conversions</p>
                      <p className="text-lg font-bold">{summary.predictedConversions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Estimated Cost</p>
                      <p className="text-lg font-bold">${summary.estimatedCost.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
