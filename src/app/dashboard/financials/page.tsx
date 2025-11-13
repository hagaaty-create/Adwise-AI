'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, Gift, Copy, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// This is a placeholder for the API logic.
// In a real project, this logic would live in `src/app/api/user-financials/route.ts`
// For this prototype, we're mocking the server response within the component fetch.

const initialTransactionsData = [
  { id: 'trx-001', date: new Date().toISOString().split('T')[0], description: 'Welcome Bonus', amount: 4.00, type: 'credit' as const },
];

type Transaction = typeof initialTransactionsData[0];

export default function FinancialsPage() {
  const referralLink = "https://hagaaty.com/ref/user123";
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactionsData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');

  const processSessionTransaction = (currentBalance: number | null, currentTransactions: Transaction[]): { newBalance: number | null, newTransactions: Transaction[] } => {
      const newTransactionStr = sessionStorage.getItem('newTransaction');
      if (newTransactionStr) {
          const newTransaction: Transaction = JSON.parse(newTransactionStr);
          if (!currentTransactions.some(t => t.id === newTransaction.id)) {
              const updatedTransactions = [...currentTransactions, newTransaction];
              const updatedBalance = currentBalance !== null ? currentBalance + newTransaction.amount : newTransaction.amount;
              // We should not remove the item here, otherwise a page refresh will lose the transaction.
              // Instead, this should ideally be written to and read from the database.
              // sessionStorage.removeItem('newTransaction'); 
              return { newBalance: updatedBalance, newTransactions: updatedTransactions };
          }
      }
      return { newBalance: currentBalance, newTransactions: currentTransactions };
  };
  
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, this fetch would go to an actual API endpoint.
        // For now, we simulate a failure to demonstrate the error handling.
        // To simulate success, you would need to implement the API route.
        const shouldSimulateError = true;
        if (shouldSimulateError) {
          throw new Error('فشل الاتصال بقاعدة البيانات. يرجى التحقق من إعدادات Vercel Postgres.');
        }

        // const response = await fetch(`/api/user-financials?email=ahmed.ali@example.com`);
        // if (!response.ok) {
        //   throw new Error('فشل الاتصال بقاعدة البيانات. يرجى التحقق من إعدادات Vercel Postgres.');
        // }
        // const data = await response.json();
        
        // const { newBalance, newTransactions } = processSessionTransaction(data.balance, transactions);
        // setBalance(newBalance);
        // setTransactions(newTransactions);

      } catch (e: any) {
        console.error("Failed to fetch financials:", e);
        setError(e.message || "حدث خطأ غير معروف أثناء جلب البيانات.");
        // Even if DB fails, check session storage for pending transactions
        const { newBalance, newTransactions } = processSessionTransaction(4.00, initialTransactionsData); // Start with default balance
        setBalance(newBalance);
        setTransactions(newTransactions);

      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("تم النسخ إلى الحافظة!", {
      description: "يمكنك الآن مشاركة رابط الإحالة الخاص بك.",
    });
  };

  const handleTopUp = () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح.');
      return;
    }
    toast.info('سيتم توجيهك للدفع', {
      description: `جارٍ معالجة إضافة ${amount.toFixed(2)}$ إلى رصيدك.`,
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 grid gap-6">
        {error && (
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle /> خطأ في الاتصال بقاعدة البيانات
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">{error}</p>
                    <p className="text-sm text-muted-foreground mt-2">يعرض التطبيق حاليًا بيانات بديلة. قد لا يتم حفظ الرصيد والمعاملات بشكل صحيح.</p>
                </CardContent>
            </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>شحن الرصيد</CardTitle>
            <CardDescription>أضف أموالاً إلى حسابك. استمتع بخصم 20٪ على كل عملية شحن!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ ($)</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="50.00" 
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">طرق الدفع: Binance (يدوي) ، المحافظ الإلكترونية (فودافون كاش ، إلخ)</p>
            <Button onClick={handleTopUp}>متابعة للدفع</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>سجل المعاملات</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <TableCell colSpan={3} className="text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell className={`text-right font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
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
                <p className="text-xs text-muted-foreground">يشمل 4.00$ مكافأة ترحيبية</p>
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
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
