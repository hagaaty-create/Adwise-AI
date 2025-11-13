'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Gift, Copy, Loader2, AlertTriangle, ExternalLink, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { getBalance, getTransactions, addTransaction } from '@/lib/actions';
import type { Transaction } from '@/lib/db';

export default function FinancialsPage() {
  const referralLink = "https://hagaaty.com/ref/user123";
  const binancePayId = "771625769";
  const usdtAddress = "TDGLKJE5GVpH923kqR677r9xfrzVsGJP";
  const bnbAddress = "0x6806f6aad1043c06153896d88807a1ebd90fec77";
  const vodafoneCashNumber = "01015016267";
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const fetchFinancialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [dbBalance, dbTransactions] = await Promise.all([
          getBalance(),
          getTransactions(),
        ]);
        setBalance(dbBalance);
        setTransactions(dbTransactions as Transaction[]);
      } catch (e: any) {
        console.error("Failed to fetch financials:", e);
        setError("Failed to connect to the database. Please try again later.");
        setBalance(0);
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };
  
  useEffect(() => {
    fetchFinancialData();
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'newTransaction') {
        fetchFinancialData();
        sessionStorage.removeItem('newTransaction');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح.');
      return;
    }

    setIsProcessingPayment(true);
    toast.info('سيتم توجيهك إلى Binance Pay الآن...', {
      description: `جارٍ إنشاء معاملة لإضافة ${amount.toFixed(2)}$ إلى رصيدك.`,
    });

    try {
        await new Promise(resolve => setTimeout(resolve, 2000)); 
        const binancePayUrl = `https://pay.binance.com/en/checkout?id=${binancePayId}`; 

        const description = `Top-up via Binance: $${amount.toFixed(2)}`;
        await addTransaction('1c82831c-4b68-4e1a-9494-27a3c3b4a5f7', amount, description);
        
        sessionStorage.setItem('newTransaction', 'true');
        window.dispatchEvent(new Event('storage'));
        await fetchFinancialData();
        setTopUpAmount(''); 

        toast.success('تم إنشاء طلب الدفع بنجاح!', {
            description: 'لأغراض العرض، تم تحديث رصيدك. في التطبيق الحقيقي، سيتم تحديثه بعد تأكيد الدفع.',
            action: {
                label: 'اذهب إلى Binance Pay',
                onClick: () => window.open(binancePayUrl, '_blank')
            },
        });

    } catch (e) {
        console.error(e);
        toast.error('فشل إنشاء طلب الدفع.', {
            description: 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.'
        });
    } finally {
        setIsProcessingPayment(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>شحن الرصيد</CardTitle>
            <CardDescription>
              اختر طريقة الدفع التي تناسبك لإضافة الأموال إلى حسابك.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="binance-pay" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="binance-pay">Binance Pay</TabsTrigger>
                <TabsTrigger value="usdt">USDT (TRC20)</TabsTrigger>
                <TabsTrigger value="bnb">BNB (BEP20)</TabsTrigger>
                <TabsTrigger value="vodafone-cash"><Phone className="h-4 w-4 mr-2"/>فودافون كاش</TabsTrigger>
              </TabsList>
              <TabsContent value="binance-pay" className="pt-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    أدخل المبلغ الذي تريد إضافته عبر Binance Pay. معرف الدفع: 
                    <span 
                      className="font-mono bg-muted px-2 py-1 rounded-md mx-1 cursor-pointer"
                      onClick={() => copyToClipboard(binancePayId, 'تم نسخ معرف Binance Pay!')}
                    >
                      {binancePayId} <Copy className="inline h-3 w-3 ml-1" />
                    </span>
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="amount">المبلغ ($)</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      placeholder="50.00" 
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      disabled={isProcessingPayment}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">استمتع بخصم 20٪ على كل عملية شحن!</p>
                  <Button onClick={handleTopUp} disabled={isProcessingPayment}>
                      {isProcessingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                      متابعة إلى Binance Pay
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="usdt" className="pt-6">
                <div className="space-y-4">
                  <Label>عنوان إيداع USDT (شبكة TRC20)</Label>
                  <div className="flex items-center space-x-2">
                      <Input value={usdtAddress} readOnly dir="ltr" />
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(usdtAddress, 'تم نسخ عنوان USDT!')}>
                        <Copy className="h-4 w-4" />
                      </Button>
                  </div>
                  <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-1" />
                    <span className="text-xs text-muted-foreground">
                      تنبيه: أرسل فقط USDT على شبكة TRON (TRC20) إلى هذا العنوان. إرسال أي عملة أخرى أو على شبكة مختلفة قد يؤدي إلى فقدان أموالك.
                    </span>
                  </div>
                   <p className="text-sm text-muted-foreground pt-2">بعد إتمام التحويل، يرجى التواصل مع الدعم الفني لتأكيد الإيداع وإضافة الرصيد إلى حسابك.</p>
                </div>
              </TabsContent>
              <TabsContent value="bnb" className="pt-6">
                <div className="space-y-4">
                  <Label>عنوان إيداع BNB (شبكة BEP20)</Label>
                  <div className="flex items-center space-x-2">
                      <Input value={bnbAddress} readOnly dir="ltr" />
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(bnbAddress, 'تم نسخ عنوان BNB!')}>
                        <Copy className="h-4 w-4" />
                      </Button>
                  </div>
                  <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-1" />
                    <span className="text-xs text-muted-foreground">
                      تنبيه: أرسل فقط BNB على شبكة Smart Chain (BEP20) إلى هذا العنوان. إرسال أي عملة أخرى أو على شبكة مختلفة قد يؤدي إلى فقدان أموالك.
                    </span>
                   </div>
                   <p className="text-sm text-muted-foreground pt-2">بعد إتمام التحويل، يرجى التواصل مع الدعم الفني لتأكيد الإيداع وإضافة الرصيد إلى حسابك.</p>
                </div>
              </TabsContent>
              <TabsContent value="vodafone-cash" className="pt-6">
                <div className="space-y-4">
                  <Label>رقم فودافون كاش للتحويل</Label>
                  <div className="flex items-center space-x-2">
                      <Input value={vodafoneCashNumber} readOnly dir="ltr" />
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(vodafoneCashNumber, 'تم نسخ رقم فودافون كاش!')}>
                        <Copy className="h-4 w-4" />
                      </Button>
                  </div>
                  <div className="flex items-start gap-2 text-primary">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-1" />
                    <span className="text-xs text-muted-foreground">
                      هام: بعد إتمام التحويل، يرجى التواصل مع الدعم الفني عبر الدردشة الحية أو تذاكر الدعم لتأكيد الإيداع وإضافة الرصيد إلى حسابك يدويًا.
                    </span>
                   </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>سجل المعاملات</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
                <div className="text-center p-4 text-destructive-foreground bg-destructive/80 rounded-md">
                    <AlertTriangle className="mx-auto h-6 w-6 mb-2" />
                    <p className="font-semibold">خطأ في الاتصال</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : transactions.length > 0 ? (
                  transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.created_at).toLocaleDateString('ar-EG')}</TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell className={`text-right font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}${transaction.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                            لا توجد معاملات لعرضها.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="sticky top-20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد الحالي</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || balance === null ? (
                <div className="h-8 flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            ) : (
              <>
                <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">مزامنة من قاعدة البيانات</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gift /> برنامج الإحالة</CardTitle>
            <CardDescription>اربح عمولة 20٪ من كل عملية شحن يقوم بها المستخدمون الذين يسجلون من خلال الرابط الخاص بك.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input value={referralLink} readOnly />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralLink, "تم نسخ رابط الإحالة!")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
