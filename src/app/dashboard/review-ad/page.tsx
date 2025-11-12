'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { smartAdReview, SmartAdReviewOutput } from '@/ai/flows/smart-ad-review';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Wand2, CheckCircle, XCircle } from 'lucide-react';

const formSchema = z.object({
  adText: z.string().min(10, { message: 'Ad text must be at least 10 characters.' }),
  adCategory: z.string().min(3, { message: 'Ad category is required.' }),
  targetAudience: z.string().min(10, { message: 'Target audience must be at least 10 characters.' }),
});

type FormData = z.infer<typeof formSchema>;

export default function ReviewAdPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SmartAdReviewOutput | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adText: '',
      adCategory: '',
      targetAudience: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setResult(null);
    try {
      const reviewResult = await smartAdReview(values);
      setResult(reviewResult);
    } catch (error) {
      console.error('Failed to review ad:', error);
      setResult({ isApproved: false, reason: 'An unexpected error occurred during the review process.' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Smart Ad Review</CardTitle>
          <CardDescription>Submit your ad for an instant AI-powered compliance and relevance check. Get activated in minutes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="adText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Text</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter the full text of your ad here." className="resize-none" rows={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="adCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., E-commerce, SaaS, Local Business" {...field} />
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
                        <Input placeholder="e.g., Gamers in North America" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Review Ad
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center p-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">AI is reviewing your ad...</p>
        </div>
      )}

      {result && (
        <Alert variant={result.isApproved ? 'default' : 'destructive'} className={result.isApproved ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}>
          {result.isApproved ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4" />}
          <AlertTitle className={cn("font-bold", result.isApproved ? 'text-green-700 dark:text-green-400' : 'text-destructive')}>
            {result.isApproved ? 'Ad Approved' : 'Ad Rejected'}
          </AlertTitle>
          <AlertDescription>{result.reason}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
