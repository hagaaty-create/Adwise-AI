'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      // Simulate login by storing the user identifier
      sessionStorage.setItem('loggedInUserEmail', email);
    }
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tighter">Hagaaty</h1>
          </div>
          <CardTitle>مرحباً بعودتك</CardTitle>
          <CardDescription>سجل الدخول لإدارة حملاتك الإعلانية</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2 text-right">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2 text-right">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" required dir="ltr" />
            </div>
            <Button type="submit" className="w-full">
              تسجيل الدخول
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-center justify-center gap-2 pt-6">
          <p className="text-sm text-muted-foreground">
            ليس لديك حساب؟{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              أنشئ حساباً
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
