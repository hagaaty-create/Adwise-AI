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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, FileText, Key, FilePlus, Lightbulb, Copy, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  websiteGoal: z.string().min(10, { message: 'Please describe your website goal in more detail.' }),
  currentKeywords: z.string().min(3, { message: 'Please provide at least one keyword.' }),
  competitorUrls: z.string().min(10, { message: 'Please provide at least one competitor URL.' }),
});

type FormData = z.infer<typeof formSchema>;

export default function SiteManagementPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AutomatedSiteManagementOutput | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      websiteGoal: '',
      currentKeywords: '',
      competitorUrls: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setResult(null);
    try {
      const siteManagementResult = await automatedSiteManagement(values);
      setResult(siteManagementResult);
    } catch (error) {
      console.error('Failed to get site management suggestions:', error);
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
          <CardTitle>Automated Site Management AI</CardTitle>
          <CardDescription>Let our AI autonomously develop your website. It analyzes competitors, finds keywords, and generates complete, ready-to-publish articles to get you to the top of search results.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="websiteGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Website Goal</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Increase user engagement for a new SaaS product." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Target Keywords</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., AI advertising, automated marketing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="competitorUrls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Competitor URLs</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., google.com, facebook.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate SEO Plan & Article
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center p-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">AI is writing a full article for you... this may take a minute.</p>
        </div>
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
              <CardTitle className="flex items-center gap-2"><FileText /> Your Generated Article</CardTitle>
              <CardDescription>This article is SEO-optimized and ready to be published on your site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">{result.generatedArticle.title}</h2>
                <Separator />
                <div 
                    className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: result.generatedArticle.content.replace(/\n/g, '<br />') }}
                />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2"><Code /> Google Sites Embed Code</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(result.googleSitesHtml)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
              <CardDescription>Copy this code and paste it into an "Embed" block in your Google Site to publish the article instantly.</CardDescription>
            </CardHeader>
            <CardContent>
                <pre className="p-4 bg-muted rounded-lg text-sm text-foreground overflow-x-auto">
                    <code>{result.googleSitesHtml}</code>
                </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
