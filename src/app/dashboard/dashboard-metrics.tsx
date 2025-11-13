'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Megaphone, Users, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Campaign } from './campaigns/page';
import { useLanguage } from '@/context/language-context';
import { getBalance } from '@/lib/actions'; // We will call this client side

export function DashboardMetrics({ initialBalance: defaultBalance }: { initialBalance: number }) {
  const { translations } = useLanguage();
  const [balance, setBalance] = useState(defaultBalance);
  const [adSpend, setAdSpend] = useState(0);
  const [activeCampaignsCount, setActiveCampaignsCount] = useState(0);

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
    
    const handleStorageChange = () => {
        // When a transaction happens, refetch the balance
        if (sessionStorage.getItem('newTransaction')) {
            fetchBalance();
            sessionStorage.removeItem('newTransaction');
        }
    };
    
    fetchBalance();
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, [defaultBalance]);

  useEffect(() => {
    const updateMetrics = () => {
      const savedCampaigns = JSON.parse(sessionStorage.getItem('userCampaigns') || '[]') as Campaign[];
      
      const totalAdSpend = savedCampaigns.reduce((sum, campaign) => sum + campaign.adSpend, 0);
      setAdSpend(totalAdSpend);

      const activeCount = savedCampaigns.filter(c => c.status === 'active' || c.status === 'review').length;
      setActiveCampaignsCount(activeCount);
    };

    updateMetrics();

    // Listen for changes from other tabs/windows
    window.addEventListener('storage', updateMetrics);
    return () => {
      window.removeEventListener('storage', updateMetrics);
    };
  }, []);

  const activeCampaignsText = activeCampaignsCount === 1 
    ? translations.dashboard.metrics.activeCampaigns.one 
    : (activeCampaignsCount > 1 
        ? `${activeCampaignsCount} campaigns are running` 
        : translations.dashboard.metrics.activeCampaigns.none);


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
          <div className="text-2xl font-bold">${adSpend.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{translations.dashboard.metrics.totalSpent.description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
