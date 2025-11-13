'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Ban, CircleDollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { toggleUserStatus, addUserBalance } from '@/lib/actions';
import type { User } from '@/lib/db';

export function UserControls({ user }: { user: User }) {
  const [amountToAdd, setAmountToAdd] = useState<number>(0);

  const handleToggleStatus = async () => {
    try {
      await toggleUserStatus(user.id, user.status);
      toast.success('User status updated successfully.');
    } catch (error) {
      toast.error('Failed to update user status.');
    }
  };

  const handleAddBalance = async () => {
    if (amountToAdd <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    try {
      await addUserBalance(user.id, amountToAdd);
      toast.success(`$${amountToAdd.toFixed(2)} added to user's balance.`);
      setAmountToAdd(0);
    } catch (error) {
      toast.error('Failed to add balance.');
    }
  };

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm"><CircleDollarSign className="h-4 w-4" /></Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>إضافة رصيد إلى {user.name}</AlertDialogTitle>
            <AlertDialogDescription>
              أدخل المبلغ الذي تريد إضافته إلى رصيد هذا المستخدم. سيتم تحديث رصيده على الفور في قاعدة البيانات.
            </AlertDialogDescription>
            <Input
              type="number"
              placeholder="مثال: 50"
              value={amountToAdd || ''}
              onChange={(e) => setAmountToAdd(parseFloat(e.target.value))}
              className="mt-4"
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAmountToAdd(0)}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddBalance}>إضافة الرصيد</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <form action={handleToggleStatus}>
        <Button variant="destructive" size="sm" type="submit">
          <Ban className="h-4 w-4" />
        </Button>
      </form>
    </>
  );
}