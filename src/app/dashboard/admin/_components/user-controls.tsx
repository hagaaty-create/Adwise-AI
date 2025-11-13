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
import { Ban, CircleDollarSign, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { toggleUserStatus, addUserBalance } from '@/lib/actions';
import type { User } from '@/lib/db';
import { useFormState } from 'react-dom';
import { useFormStatus } from 'react-dom';


export function UserControls({ user }: { user: User }) {
  const [amountToAdd, setAmountToAdd] = useState<number>(0);
  const isSuspended = user.status === 'suspended';

  const handleToggleStatus = async () => {
    try {
      await toggleUserStatus(user.id, user.status);
      toast.success('تم تحديث حالة المستخدم بنجاح.');
    } catch (error) {
      toast.error('فشل تحديث حالة المستخدم.');
    }
  };

  const handleAddBalance = async () => {
    if (amountToAdd <= 0) {
      toast.error("الرجاء إدخال مبلغ صحيح.");
      return;
    }
    try {
      await addUserBalance(user.id, amountToAdd);
      toast.success(`تمت إضافة ${amountToAdd.toFixed(2)}$ إلى رصيد المستخدم.`);
      setAmountToAdd(0);
    } catch (error) {
      toast.error('فشل في إضافة الرصيد.');
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" aria-label="Add Balance"><CircleDollarSign className="h-4 w-4" /></Button>
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
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant={isSuspended ? 'secondary' : 'destructive'} size="sm" aria-label={isSuspended ? 'Un-suspend User' : 'Suspend User'}>
            {isSuspended ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              {isSuspended
                ? `سيؤدي هذا إلى إعادة تفعيل حساب المستخدم "${user.name}".`
                : `سيؤدي هذا إلى إيقاف حساب المستخدم "${user.name}" ومنعه من تسجيل الدخول.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleToggleStatus}
              className={isSuspended ? '' : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'}
            >
              نعم، قم بالتحديث
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
