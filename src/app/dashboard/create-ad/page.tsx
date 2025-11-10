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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Wand2, Facebook, Twitter } from 'lucide-react';

const platforms = [
  { id: 'Google', label: 'Google' },
  { id: 'TikTok', label: 'TikTok' },
  { id: 'Facebook', label: 'Facebook' },
  { id: 'Snapchat', label: 'Snapchat' },
] as const;

const formSchema = z.object({
  adName: z.string().min(3, { message: 'Ad name must be at least 3 characters.' }),
  productDescription: z.string().min(20, { message: 'Product description must be at least 20 characters.' }),
  targetAudience: z.string().min(10, { message: 'Target audience must be at least 10 characters.' }),
  platforms: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one platform.',
  }),
  budget: z.coerce.number().min(1, { message: 'Budget must be at least $1.' }),
  campaignDurationDays: z.coerce.number().int().min(1, { message: 'Duration must be at least 1 day.' }),
});

type FormData = z.infer<typeof formSchema>;

const platformIcons: { [key: string]: React.ReactNode } = {
  Google: <svg role="img" viewBox="0 0 24 24" className="h-6 w-6"><path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.75 8.36,4.73 12.19,4.73C15.28,4.73 17.27,6.48 17.27,6.48L19.43,4.18C19.43,4.18 16.71,2.05 12.19,2.05C6.7,2.05 2.5,6.73 2.5,12C2.5,17.27 6.7,21.95 12.19,21.95C18.08,21.95 21.5,17.5 21.5,12.33C21.5,11.76 21.45,11.43 21.35,11.1Z"></path></svg>,
  TikTok: <svg role="img" viewBox="0 0 24 24" className="h-6 w-6"><path fill="currentColor" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02c.08 1.53.63 3.09 1.75 4.17c1.12 1.11 2.7 1.65 4.24 1.76v3.4c-1.84.06-3.63-.43-5.1-1.61c-.56-.44-1.03-.99-1.4-1.61c-.02-.01-.03-.02-.05-.03v7.69c-1.33.02-2.65.01-3.98.02s-2.65.01-3.98-.01v-3.4c1.84-.06 3.63.43 5.1 1.61c.56.44 1.03.99 1.4 1.61c.02.01.03.02.05.03V.02Z"/></svg>,
  Facebook: <Facebook className="h-6 w-6" />,
  Snapchat: <svg role="img" viewBox="0 0 24 24" className="h-6 w-6"><path fill="currentColor" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c.594 0 1.173-.05 1.74-.132a.5.5 0 0 0 .4-.606c-.199-.687-.404-1.388-.582-2.193a.5.5 0 0 1 .48-.568c3.033-.112 5.92-1.286 7.903-3.692C23.46 14.88 24 12.75 24 10.5 24 4.701 18.627 0 12 0zm3.267 11.258c0 .27-.01.535-.028.794a.5.5 0 0 1-.58.483c-1.05-.1-2.12-.134-3.193-.067-1.109-.07-2.195-.035-3.24.067a.5.5 0 0 1-.58-.483c-.019-.26-.028-.525-.028-.794V9.65c0-1.264.93-2.3 2.066-2.3h2.57c1.137 0 2.066 1.036 2.066 2.3v1.608z"/></svg>,
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
      platforms: [],
      budget: 100,
      campaignDurationDays: 7,
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setResults(null);
    toast.info('Generating your ad campaigns...', {
        description: 'This may take a moment. Please wait.',
    });
    try {
      const result = await createAutomatedAdCampaign({
        ...values,
        platforms: values.platforms as Array<'Google' | 'TikTok' | 'Facebook' | 'Snapchat'>
      });
      setResults(result);
      toast.success('Campaigns generated successfully!');
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
          <CardTitle>Automated Ad Creation</CardTitle>
          <CardDescription>Fill in the details below and let our AI generate your ad campaigns.</CardDescription>
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
                  <FormField
                    control={form.control}
                    name="platforms"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Platforms</FormLabel>
                          <FormDescription>Select where you want to run your ads.</FormDescription>
                        </div>
                        {platforms.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="platforms"
                            render={({ field }) => {
                              return (
                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter((value) => value !== item.id));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{item.label}</FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate Campaigns
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && !results && (
        <div className="text-center p-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">AI is crafting your campaigns...</p>
        </div>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Campaign Summaries</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
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
                    <h4 className="font-semibold mb-1">Ad Copy</h4>
                    <p className="text-sm text-muted-foreground bg-slate-100 p-3 rounded-md">{summary.adCopy}</p>
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
