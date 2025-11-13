'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Megaphone, Clock, CheckCircle, BarChart2, DollarSign, Eye, MousePointerClick, Info } from 'lucide-react';
import Link from 'next/link';

export type CampaignStatus = 'pending' | 'review' | 'active' | 'finished';

export interface Campaign {
  id: string;
  headline: string;
  status: CampaignStatus;
  adCopy: string;
  predictedReach: number;
  predictedConversions: number;
  budget: number;
  duration: number;
  adSpend: number;
  impressions: number;
  clicks: number;
  startDate: string;
}

const platformIcons: { [key: string]: React.ReactNode } = {
  Google: <svg role="img" viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.75 8.36,4.73 12.19,4.73C15.28,4.73 17.27,6.48 17.27,6.48L19.43,4.18C19.43,4.18 16.71,2.05 12.19,2.05C6.7,2.05 2.5,6.73 2.5,12C2.5,17.27 6.7,21.95 12.19,21.95C18.08,21.95 21.5,17.5 21.5,12.33C21.5,11.76 21.45,11.43 21.35,11.1Z"></path></svg>,
};


const StatusBadge = ({ status }: { status: CampaignStatus }) => {
  switch (status) {
    case 'review':
      return <Badge variant="secondary" className="animate-pulse"><Clock className="mr-2 h-3 w-3" />قيد المراجعة</Badge>;
    case 'active':
      return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-2 h-3 w-3" />نشطة</Badge>;
    case 'finished':
       return <Badge variant="outline">مكتملة</Badge>;
    default:
      return <Badge variant="destructive">غير معروف</Badge>;
  }
};


export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedCampaigns = JSON.parse(sessionStorage.getItem('userCampaigns') || '[]');
    setCampaigns(savedCampaigns);
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCampaigns(prevCampaigns => {
        let hasChanged = false;
        const updatedCampaigns = prevCampaigns.map(campaign => {
          let newStatus = campaign.status;
          let newAdSpend = campaign.adSpend;
          let newImpressions = campaign.impressions;
          let newClicks = campaign.clicks;

          const startTime = new Date(campaign.startDate).getTime();
          const now = Date.now();

          if (campaign.status === 'review' && now > startTime + 10000) { // 10 seconds review period
            newStatus = 'active';
            hasChanged = true;
          }

          if (newStatus === 'active') {
            const totalDurationSeconds = campaign.duration * 24 * 60 * 60;
            const elapsedSeconds = (now - (startTime + 10000)) / 1000;
            const progress = Math.min(elapsedSeconds / totalDurationSeconds, 1);
            
            newAdSpend = campaign.budget * progress;
            newImpressions = Math.floor(campaign.predictedReach * progress);
            newClicks = Math.floor(campaign.predictedConversions * progress);

            if (progress >= 1) {
              newStatus = 'finished';
              newAdSpend = campaign.budget;
              newImpressions = campaign.predictedReach;
              newClicks = campaign.predictedConversions;
            }
            hasChanged = true;
          }

          return { ...campaign, status: newStatus, adSpend: newAdSpend, impressions: newImpressions, clicks: newClicks };
        });

        if (hasChanged) {
          sessionStorage.setItem('userCampaigns', JSON.stringify(updatedCampaigns));
          // Notify other components like the dashboard metrics
          window.dispatchEvent(new Event('storage'));
          return updatedCampaigns;
        }

        return prevCampaigns;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (campaigns.length === 0) {
    return (
        <Card className="text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                    <Info className="h-6 w-6 text-primary"/>
                    لا توجد حملات إعلانية
                </CardTitle>
                <CardDescription>
                    لم تقم بإنشاء أي حملات إعلانية بعد. ابدأ الآن لجذب المزيد من العملاء.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/dashboard/create-ad">إنشاء حملة جديدة</Link>
                </Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            حملاتي الإعلانية
          </CardTitle>
          <CardDescription>
            تابع أداء جميع حملاتك الإعلانية هنا.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full space-y-4">
                {campaigns.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(campaign => (
                     <Card key={campaign.id} className="overflow-hidden">
                        <AccordionItem value={campaign.id} className="border-b-0">
                            <AccordionTrigger className="p-4 hover:no-underline hover:bg-muted/50">
                                <div className="flex-1 flex items-center gap-4 text-start">
                                    {platformIcons.Google}
                                    <div className="flex-1">
                                        <p className="font-semibold">{campaign.headline}</p>
                                        <p className="text-xs text-muted-foreground">
                                          بدأت في: {new Date(campaign.startDate).toLocaleDateString('ar-EG')}
                                        </p>
                                    </div>
                                </div>
                                <div className="px-4">
                                  <StatusBadge status={campaign.status} />
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-0">
                               <div className="border-t p-4 grid gap-6 bg-muted/20">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                        <div className="bg-muted p-3 rounded-lg">
                                            <p className="text-sm font-medium flex items-center justify-center gap-1"><DollarSign className="h-4 w-4"/> المنفق</p>
                                            <p className="text-xl font-bold">${campaign.adSpend.toFixed(2)}</p>
                                        </div>
                                        <div className="bg-muted p-3 rounded-lg">
                                            <p className="text-sm font-medium flex items-center justify-center gap-1"><Eye className="h-4 w-4"/> مرات الظهور</p>
                                            <p className="text-xl font-bold">{Math.floor(campaign.impressions).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-muted p-3 rounded-lg">
                                            <p className="text-sm font-medium flex items-center justify-center gap-1"><MousePointerClick className="h-4 w-4"/> النقرات</p>
                                            <p className="text-xl font-bold">{Math.floor(campaign.clicks).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-muted p-3 rounded-lg">
                                            <p className="text-sm font-medium">تكلفة النقرة</p>
                                            <p className="text-xl font-bold">${campaign.clicks > 0 ? (campaign.adSpend / campaign.clicks).toFixed(2) : '0.00'}</p>
                                        </div>
                                    </div>
                                    
                                    <Card>
                                        <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            تفاصيل الإعلان المُنشأة بواسطة AI
                                        </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <h4 className="font-semibold mb-2">نص الإعلان</h4>
                                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{campaign.adCopy}</p>
                                        </CardContent>
                                    </Card>
                               </div>
                            </AccordionContent>
                        </AccordionItem>
                     </Card>
                ))}
            </Accordion>
        </CardContent>
         <CardFooter>
            <Button asChild variant="secondary">
                <Link href="/dashboard/create-ad">إنشاء حملة جديدة</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
