'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { automatedSiteManagement, AutomatedSiteManagementOutput } from '@/ai/flows/automated-site-management';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, FileText, Key, Network, FilePlus, Lightbulb } from 'lucide-react';

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

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Automated Site Management AI</CardTitle>
          <CardDescription>Let our AI autonomously develop your website. It analyzes competitors, finds keywords, and generates content outlines to get you to the top of search results.</CardDescription>
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
                Generate SEO Plan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center p-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">AI is analyzing the web for you...</p>
        </div>
      )}

      {result && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lightbulb className="text-primary" /> AI-Generated Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2"><FilePlus /> New Page/Article Ideas</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {result.newPages.map((page, index) => <li key={index}>{page}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2"><Key /> Keyword Suggestions</h3>
                <div className="flex flex-wrap gap-2">
                  {result.keywordSuggestions.map((keyword, index) => (
                    <span key={index} className="bg-primary/10 text-primary text-sm font-medium px-2.5 py-0.5 rounded-full">{keyword}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2"><FileText /> SEO Content Outline</h3>
                <div className="text-sm text-muted-foreground bg-slate-100 p-4 rounded-md whitespace-pre-wrap font-mono">
                  {result.contentOutline}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
