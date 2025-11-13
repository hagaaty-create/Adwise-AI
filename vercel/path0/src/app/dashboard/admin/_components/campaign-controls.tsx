'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { PauseCircle, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { toggleCampaignStatus } from '@/lib/actions';
import type { Campaign } from '@/lib/db';

export function CampaignControls({ campaign }: { campaign: Campaign }) {
  const isPaused = campaign.status === 'paused';

  const handleToggleStatus = async () => {
    try {
      await toggleCampaignStatus(campaign.id, campaign.status);
      toast.success('تم تحديث حالة الحملة بنجاح.');
    } catch (error) {
      toast.error('فشل تحديث حالة الحملة.');
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="secondary" size="sm" aria-label={isPaused ? 'Activate Campaign' : 'Pause Campaign'}>
          {isPaused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
          <AlertDialogDescription>
            {isPaused
              ? `سيؤدي هذا إلى إعادة تفعيل الحملة "${campaign.headline}".`
              : `سيؤدي هذا إلى إيقاف الحملة "${campaign.headline}" مؤقتًا.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction onClick={handleToggleStatus}>نعم، قم بالتحديث</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}