'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart } from 'lucide-react';
import { DashboardChart } from './_components/dashboard-chart';
import { DashboardMetrics } from './_components/dashboard-metrics';
import { useLanguage } from '@/context/language-context';

export default function Dashboard() {
  const { translations } = useLanguage();
  
  // The logic for fetching balance is now handled inside DashboardMetrics
  // to better manage client-side state and updates. We can pass a static
  // value or handle it inside the component. For simplicity, we removed the server-side
  // getBalance() from this page component to make it a pure client component for i18n.
  const initialBalance = 4.00;

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <DashboardMetrics initialBalance={initialBalance} />
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              {translations.dashboard.campaignPerformance.title}
            </CardTitle>
            <CardDescription>
              {translations.dashboard.campaignPerformance.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardChart />
          </CardContent>
        </Card>
    </div>
  );
}
