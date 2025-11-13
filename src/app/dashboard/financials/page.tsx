'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, Gift, Copy, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

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

  const processSessionTransaction = (currentBalance: number | null, currentTransactions: Transaction[]): { newBalance: number | null, newTransactions: Transaction[] } => {
      const newTransactionStr = sessionStorage.getItem('newTransaction');
      if (newTransactionStr) {
          const newTransaction: Transaction = JSON.parse(newTransactionStr);
          if (!currentTransactions.some(t => t.id === newTransaction.id)) {
              const updatedTransactions = [...currentTransactions, newTransaction];
              const updatedBalance = currentBalance !== null ? currentBalance + newTransaction.amount : newTransaction.amount;
              sessionStorage.removeItem('newTransaction');
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
        const response = await fetch(`/api/user-financials?email=ahmed.ali@example.com`);
        if (!response.ok) {
          throw new Error('Failed to connect to the database. Please check configuration.');
        }
        const data = await response.json();
        
        const { newBalance, newTransactions } = processSessionTransaction(data.balance, transactions);
        setBalance(newBalance);
        setTransactions(newTransactions);

      } catch (e: any) {
        console.error("Failed to fetch financials:", e);
        setError(e.message || "An unknown error occurred while fetching data.");
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
    toast.success("Copied to clipboard!", {
      description: "You can now share your referral link.",
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 grid gap-6">
        {error && (
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle /> Database Connection Error
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-destructive-foreground">{error}</p>
                    <p className="text-sm text-muted-foreground mt-2">Please ensure the PostgreSQL database is correctly configured in your Vercel project settings.</p>
                </CardContent>
            </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Top Up Balance</CardTitle>
            <CardDescription>Add funds to your account. Enjoy a 20% discount on every top-up!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input id="amount" type="number" placeholder="50.00" />
            </div>
            <p className="text-sm text-muted-foreground">Payment methods: Binance (Manual), E-Wallets (Vodafone Cash, etc.)</p>
            <Button>Proceed to Payment</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
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
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell className={`text-right font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'credit' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
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
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
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
                <p className="text-xs text-muted-foreground">Includes $4.00 welcome bonus</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gift /> Referral Program</CardTitle>
            <CardDescription>Earn a 20% commission from every top-up made by users who sign up through your link.</CardDescription>
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

// We need to create an API route to fetch the balance for the client component.
// This would ideally be in `src/app/api/user-financials/route.ts`
// but since we cannot create new files, we'll mock the fetch logic.

// This is a placeholder for the API logic.
// In a real project, create a file at `src/app/api/user-financials/route.ts`
async function handler(req: Request) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
        return new Response(JSON.stringify({ message: 'Email is required' }), { status: 400 });
    }

    try {
        const { sql } = await import('@vercel/postgres');
        const { rows } = await sql`SELECT balance FROM users WHERE email = ${email}`;
        if (rows.length > 0) {
            return new Response(JSON.stringify({ balance: parseFloat(rows[0].balance) }), { status: 200 });
        } else {
            return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
        }
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
}
