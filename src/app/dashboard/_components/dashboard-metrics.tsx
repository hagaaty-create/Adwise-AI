'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Megaphone, Users, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Campaign } from '../campaigns/page';
import { useLanguage } from '@/context/language-context';
import { getFinancials } from '@/lib/actions'; 

export function DashboardMetrics({ initialBalance: defaultBalance }: { initialBalance: number }) {
  const { translations } = useLanguage();
  const [balance, setBalance] = useState(defaultBalance);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [adSpend, setAdSpend] = useState(0);
  const [activeCampaignsCount, setActiveCampaignsCount] = useState(0);

  const fetchAllMetrics = async () => {
      try {
        const data = await getFinancials();
        setBalance(data.balance);
        setReferralEarnings(data.referralEarnings);
      } catch (e) {
        console.error("Failed to fetch financials, using default.", e);
        setBalance(defaultBalance);
        setReferralEarnings(0);
      }
      
      const savedCampaigns = JSON.parse(sessionStorage.getItem('userCampaigns') || '[]') as Campaign[];
      const totalAdSpend = savedCampaigns.reduce((sum, campaign) => sum + campaign.adSpend, 0);
      setAdSpend(totalAdSpend);

      const activeCount = savedCampaigns.filter(c => c.status === 'active' || c.status === 'review').length;
      setActiveCampaignsCount(activeCount);
  };

  useEffect(() => {
    fetchAllMetrics();
    
    // Listen for storage changes from other tabs to re-fetch all data
    const handleStorageChange = (event: StorageEvent) => {
        // A 'newTransaction' event is a generic signal that finances might have changed.
        // A change to 'userCampaigns' means campaign metrics changed.
        if (event.key === 'newTransaction' || event.key === 'userCampaigns') {
            fetchAllMetrics();
            if(event.key === 'newTransaction') {
              sessionStorage.removeItem('newTransaction'); // Clear the flag
            }
        }
    };
    
    window.addEventListener('storage', handleStorageChange);

    // Also listen for a custom event for campaign updates to be more robust
    const campaignUpdateHandler = () => fetchAllMetrics();
    window.addEventListener('campaignUpdate', campaignUpdateHandler);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('campaignUpdate', campaignUpdateHandler);
    }

  }, [defaultBalance]);

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
          <div className="text-2xl font-bold">${referralEarnings.toFixed(2)}</div>
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
