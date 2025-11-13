'use client';

import { Button } from '@/components/ui/button';
import { PauseCircle } from 'lucide-react';
import { toast } from 'sonner';
import { toggleCampaignStatus } from '@/lib/actions';
import type { Campaign } from '@/lib/db';

export function CampaignControls({ campaign }: { campaign: Campaign }) {
  const handleToggleStatus = async () => {
    try {
      await toggleCampaignStatus(campaign.id, campaign.status);
      toast.success('Campaign status updated successfully.');
    } catch (error) {
      toast.error('Failed to update campaign status.');
    }
  };

  return (
    <form action={handleToggleStatus}>
      <Button variant="secondary" size="sm" type="submit">
        <PauseCircle className="h-4 w-4" />
      </Button>
    </form>
  );
}