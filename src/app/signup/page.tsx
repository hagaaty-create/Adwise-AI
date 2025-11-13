'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tighter">Hagaaty</h1>
          </div>
          <CardTitle>إنشاء حساب جديد</CardTitle>
          <CardDescription>ابدأ الآن واحصل على 4 دولارات مكافأة ترحيبية!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2 text-right">
              <Label htmlFor="fullname">الاسم الكامل</Label>
              <Input id="fullname" type="text" placeholder="مثال: أحمد علي" required />
            </div>
            <div className="space-y-2 text-right">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" placeholder="name@example.com" required dir="ltr"/>
            </div>
             <div className="space-y-2 text-right">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input id="phone" type="tel" placeholder="+20 123 456 7890" required dir="ltr"/>
            </div>
            <div className="space-y-2 text-right">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" required dir="ltr"/>
            </div>
            <Button type="submit" className="w-full">
              التسجيل والحصول على المكافأة
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-center justify-center gap-2 pt-6">
          <p className="text-sm text-muted-foreground">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
