'use server';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet, Megaphone, Users, DollarSign, LineChart } from 'lucide-react';
import { sql } from '@vercel/postgres';
import { DashboardChart } from './_components/dashboard-chart';
import { DashboardMetrics } from './_components/dashboard-metrics';

async function getBalance() {
  try {
    const { rows } = await sql`SELECT balance FROM users WHERE email = 'ahmed.ali@example.com'`;
    if (rows.length > 0) {
      // The balance is returned as a string from the DB, so we parse it.
      return parseFloat(rows[0].balance);
    }
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    // Return the default welcome bonus if the DB query fails for any reason
  }
  return 4.00;
}


export default async function Dashboard() {
  const balance = await getBalance();
  
  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <DashboardMetrics initialBalance={balance} />
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
            <DashboardChart />
          </CardContent>
        </Card>
    </div>
  );
}
