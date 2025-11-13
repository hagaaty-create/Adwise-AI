'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, LifeBuoy, Send } from 'lucide-react';
import { sendSupportTicket } from '@/lib/actions';
import { useLanguage } from '@/context/language-context';

const formSchema = z.object({
  subject: z.string().min(5, { message: 'يجب أن يكون الموضوع 5 أحرف على الأقل.' }),
  message: z.string().min(20, { message: 'يجب أن تكون الرسالة 20 حرفًا على الأقل.' }),
});

type FormData = z.infer<typeof formSchema>;

export default function SupportPage() {
  const { translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      message: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    toast.info('جاري إرسال تذكرة الدعم...');

    try {
      // In a real app, user details would come from the session. We'll use mock data.
      const user = {
        name: 'Hagaaty User', // Replace with actual user name from session/auth
        email: 'customer@example.com' // Replace with actual user email
      };

      await sendSupportTicket({
        ...values,
        userName: user.name,
        userEmail: user.email
      });

      toast.success('تم إرسال تذكرة الدعم بنجاح!', {
        description: 'سيقوم فريقنا بالرد عليك عبر البريد الإلكتروني في أقرب وقت ممكن.',
      });
      form.reset();
    } catch (error) {
      console.error('Failed to send support ticket:', error);
      toast.error('فشل إرسال تذكرة الدعم.', {
        description: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card className="max-w-3xl mx-auto w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-primary" />
            الدعم الفني
          </CardTitle>
          <CardDescription>
            هل تواجه مشكلة؟ املأ النموذج أدناه لفتح تذكرة دعم جديدة. سنرد عليك عبر البريد الإلكتروني.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الموضوع</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: مشكلة في شحن الرصيد" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف المشكلة</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="يرجى وصف المشكلة التي تواجهها بالتفصيل..."
                        className="resize-y min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  إرسال التذكرة
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
