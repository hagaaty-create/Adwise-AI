'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Megaphone, Users, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CampaignStatus, CampaignMetrics } from '../create-ad/page';
import { useLanguage } from '@/context/language-context';
import { getBalance } from '@/lib/actions'; // We will call this client side

export function DashboardMetrics({ initialBalance: defaultBalance }: { initialBalance: number }) {
  const { translations } = useLanguage();
  const [balance, setBalance] = useState(defaultBalance);
  const [metrics, setMetrics] = useState<CampaignMetrics>({ adSpend: 0, impressions: 0, clicks: 0, status: 'pending' });
  const [hasActiveCampaign, setHasActiveCampaign] = useState(false);

  useEffect(() => {
    async function fetchBalance() {
      try {
        const dbBalance = await getBalance();
        setBalance(dbBalance);
      } catch (e) {
        console.error("Failed to fetch balance, using default.", e);
        setBalance(defaultBalance);
      }
    }
    fetchBalance();
  }, [defaultBalance]);

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
  const activeCampaignsText = hasActiveCampaign ? translations.dashboard.metrics.activeCampaigns.one : translations.dashboard.metrics.activeCampaigns.none;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{translations.dashboard.metrics.balance.title}</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{translations.dashboard.metrics.balance.description}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{translations.dashboard.metrics.activeCampaigns.title}</CardTitle>
          <Megaphone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCampaignsCount}</div>
          <p className="text-xs text-muted-foreground">{activeCampaignsText}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{translations.dashboard.metrics.referralEarnings.title}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$0.00</div>
          <p className="text-xs text-muted-foreground">{translations.dashboard.metrics.referralEarnings.description}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{translations.dashboard.metrics.totalSpent.title}</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${metrics.adSpend.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{translations.dashboard.metrics.totalSpent.description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
