'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { automatedMarketing, AutomatedMarketingOutput } from '@/ai/flows/automated-marketing';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, UserPlus, MessageCircle, CreditCard, BarChart2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  businessDescription: z.string().min(10, { message: 'Please describe your business in more detail.' }),
  targetAudience: z.string().min(10, { message: 'Please describe your target audience.' }),
  marketingGoals: z.string().min(10, { message: 'Please specify your marketing goals.' }),
});

type FormData = z.infer<typeof formSchema>;

export default function MarketingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AutomatedMarketingOutput | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessDescription: '',
      targetAudience: '',
      marketingGoals: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setResult(null);
    try {
      const marketingResult = await automatedMarketing(values);
      setResult(marketingResult);
    } catch (error) {
      console.error('Failed to get marketing plan:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Automated Marketing AI</CardTitle>
          <CardDescription>Describe your business, and our AI will generate a complete marketing automation plan for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="businessDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., A subscription service for eco-friendly coffee beans." {...field} />
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
                      <Input placeholder="e.g., Environmentally conscious millennials" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="marketingGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marketing Goals</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Acquire 1,000 new subscribers in 3 months" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate Marketing Plan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="text-center p-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">AI is building your marketing strategy...</p>
        </div>
      )}

      {result && (
        <Card>
            <CardHeader>
                <CardTitle>Your Automated Marketing Plan</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            <div className="flex items-center gap-2"><UserPlus className="text-primary"/>Lead Generation Strategy</div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pl-2">
                           {result.leadGenerationStrategy}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>
                            <div className="flex items-center gap-2"><MessageCircle className="text-primary"/>Client Communication Plan</div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pl-2">
                            {result.clientCommunicationPlan}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>
                            <div className="flex items-center gap-2"><CreditCard className="text-primary"/>Payment Process Management</div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pl-2">
                           {result.paymentProcessManagement}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>
                            <div className="flex items-center gap-2"><BarChart2 className="text-primary"/>Campaign Monitoring Strategy</div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pl-2">
                            {result.campaignMonitoringStrategy}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
