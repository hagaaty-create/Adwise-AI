'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Megaphone, Users, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CampaignStatus, CampaignMetrics } from '../create-ad/page';

export function DashboardMetrics({ initialBalance }: { initialBalance: number }) {
  const [balance, setBalance] = useState(initialBalance);
  const [metrics, setMetrics] = useState<CampaignMetrics>({ adSpend: 0, impressions: 0, clicks: 0, status: 'pending' });
  const [hasActiveCampaign, setHasActiveCampaign] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      const savedMetrics = JSON.parse(sessionStorage.getItem('campaignMetrics') || 'null');
      const campaignStatus = sessionStorage.getItem('campaignStatus') as CampaignStatus | null;
      
      if (savedMetrics) {
        setMetrics(savedMetrics);
      }
      setHasActiveCampaign(campaignStatus === 'active' || campaignStatus === 'review');
    };

    updateMetrics();

    // Listen for changes from other tabs/windows
    window.addEventListener('storage', updateMetrics);
    return () => {
      window.removeEventListener('storage', updateMetrics);
    };
  }, []);

  const activeCampaignsCount = hasActiveCampaign ? 1 : 0;
  const activeCampaignsText = hasActiveCampaign ? '1 campaign is currently running' : 'No active campaigns';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          <Megaphone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCampaignsCount}</div>
          <p className="text-xs text-muted-foreground">{activeCampaignsText}</p>
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
          <div className="text-2xl font-bold">${metrics.adSpend.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Across all campaigns</p>
        </CardContent>
      </Card>
    </div>
  );
}
