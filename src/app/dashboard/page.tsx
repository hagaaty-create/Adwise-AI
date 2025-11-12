'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet, Megaphone, Users, DollarSign, LineChart } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // We need to wrap this in useEffect to avoid hydration errors
    // because Math.random() produces different values on server and client.
    setData([
      { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Feb', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Apr', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'May', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Jul', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Aug', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Sep', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Oct', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Nov', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Dec', total: Math.floor(Math.random() * 5000) + 1000 },
    ]);
  }, []);

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4.00</div>
            <p className="text-xs text-muted-foreground">Includes $4.00 welcome bonus</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No active campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Earnings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">From 0 referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">Across all campaigns</p>
          </CardContent>
        </Card>
      </div>
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Campaign Performance
            </CardTitle>
            <CardDescription>
              An overview of your ad spend over the last year.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
           {data.length > 0 && <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>}
          </CardContent>
        </Card>
    </div>
  );
}
