'use server';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart } from 'lucide-react';
import { sql } from '@vercel/postgres';
import { DashboardChart } from './_components/dashboard-chart';
import { DashboardMetrics } from './_components/dashboard-metrics';
import { seed } from '@/lib/db';

async function getBalance() {
  try {
    const { rows } = await sql`SELECT balance FROM users WHERE email = 'ahmed.ali@example.com'`;
    if (rows.length > 0) {
      // The balance is returned as a string from the DB, so we parse it.
      return parseFloat(rows[0].balance);
    }
    // If user not found, maybe the db is not seeded yet.
    await seed();
    const { rows: newRows } = await sql`SELECT balance FROM users WHERE email = 'ahmed.ali@example.com'`;
     if (newRows.length > 0) {
      return parseFloat(newRows[0].balance);
    }

  } catch (error) {
    console.error('Failed to fetch balance:', error);
    // If seeding also fails, return the default welcome bonus.
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
              أداء الحملة
            </CardTitle>
            <CardDescription>
              نظرة عامة على إنفاقك الإعلاني خلال العام الماضي.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardChart />
          </CardContent>
        </Card>
    </div>
  );
}
