'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, Gift, Copy } from 'lucide-react';
import { toast } from 'sonner';

const initialTransactions = [
  { id: 'trx-001', date: '2024-06-15', description: 'Welcome Bonus', amount: 4.00, type: 'credit' },
];

// This is a client component, but we want to fetch the real balance
// We can't use server actions directly in the initial render of a client component
// So we fetch it in a useEffect. A more robust solution might use a data fetching library like SWR or TanStack Query
async function fetchUserBalance() {
    // This is a placeholder for fetching the logged-in user's balance
    // In a real app, you'd get the user ID from the session
    // For now, we assume 'Ahmed Ali' is the user.
    // A proper implementation would require an API route or another server action.
    return 4.00; // Returning initial balance for now as we don't have user session
}


export default function FinancialsPage() {
  const referralLink = "https://hagaaty.com/ref/user123";
  const [balance, setBalance] = useState(4.00);
  const [transactions, setTransactions] = useState(initialTransactions);

  // The logic to update balance from localStorage is now obsolete with a real DB.
  // A real implementation would involve either polling, websockets, or re-fetching data
  // when the user navigates to the page or an action occurs.
  // For this prototype, we'll keep the UI static and rely on revalidation from the admin page.

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Copied to clipboard!", {
      description: "You can now share your referral link.",
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 grid gap-6">
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
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell className={`text-right font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'credit' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
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
            <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Includes $4.00 welcome bonus</p>
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
