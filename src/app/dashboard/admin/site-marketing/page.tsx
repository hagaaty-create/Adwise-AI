'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { automatedSiteManagement, AutomatedSiteManagementOutput } from '@/ai/flows/automated-site-management';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Wand2, FileText, Key, FilePlus, Lightbulb, Copy, Code, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  topicFocus: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function SiteMarketingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AutomatedSiteManagementOutput | null>(null);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topicFocus: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setResult(null);
    toast.info("Autonomous SEO agent activated...", {
        description: "The AI is analyzing the market and writing a full article. This may take a minute."
    });
    try {
      const siteManagementResult = await automatedSiteManagement(values);
      setResult(siteManagementResult);
      toast.success("AI has generated a new SEO plan and a complete article!", {
        description: 'The article is now a draft. Go to "Manage Articles" to publish it.'
      });
    } catch (error) {
      console.error('Failed to get site management suggestions:', error);
      toast.error("An error occurred while generating the SEO plan.");
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("HTML code copied to clipboard!");
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Autonomous Site Marketing AI</CardTitle>
          <CardDescription>
            Delegate your content strategy to our AI. It will analyze the market, find valuable keywords, and write complete articles. Generated articles will appear as drafts in "Manage Articles" for you to review and publish.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="topicFocus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic Focus (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'Google Ads for e-commerce' or leave blank for full autonomy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Activate Autonomous SEO Agent
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
            <CardContent className="pt-6">
                <div className="text-center p-8">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-muted-foreground">AI is analyzing, strategizing, and writing... please wait.</p>
                </div>
            </CardContent>
        </Card>
      )}

      {result && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lightbulb className="text-primary" /> AI-Generated SEO Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2"><FilePlus /> Suggested Article Topics</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {result.suggestedTopics.map((topic, index) => <li key={index}>{topic}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2"><Key /> New Keyword Suggestions</h3>
                <div className="flex flex-wrap gap-2">
                  {result.keywordSuggestions.map((keyword, index) => (
                     <Badge key={index} variant="outline">{keyword}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                 <CardTitle className="flex items-center gap-2"><FileText /> Article Draft Created</CardTitle>
                  <Button variant="secondary" onClick={() => router.push('/dashboard/admin/articles')}>
                    Go to Articles <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
              </div>
              <CardDescription>This article has been saved as a draft. Review and publish it from the "Manage Articles" page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">{result.generatedArticle.title}</h2>
                <Separator />
                <div 
                    className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap max-h-60 overflow-y-auto p-2 border rounded-md"
                >
                    {result.generatedArticle.content.replace(/\\n/g, '\n')}
                </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
