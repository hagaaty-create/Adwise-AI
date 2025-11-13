'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAdminDashboardData, processWithdrawal } from '@/lib/actions';
import { Shield, Users, Megaphone, CheckCircle, PauseCircle, Ban, ShieldCheck, Loader2, HandCoins } from 'lucide-react';
import type { User, Campaign, Withdrawal } from '@/lib/db';
import { UserControls } from './_components/user-controls';
import { CampaignControls } from './_components/campaign-controls';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { SafeDateTime } from '@/components/common/safe-date-time';

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

function WithdrawalRow({ withdrawal, onProcess }: { withdrawal: Withdrawal; onProcess: (id: string) => void; }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      await processWithdrawal(withdrawal.id);
      toast.success("Withdrawal marked as completed!");
      onProcess(withdrawal.id); // Notify parent to remove from list
    } catch (error: any) {
      toast.error("Failed to process withdrawal", { description: error.message });
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <TableRow>
      <TableCell>{withdrawal.user_name}</TableCell>
      <TableCell className="font-medium">${withdrawal.amount.toFixed(2)}</TableCell>
      <TableCell dir="ltr">{withdrawal.phone_number}</TableCell>
      <TableCell><SafeDateTime date={withdrawal.created_at} locale="ar-EG" options={{dateStyle: 'medium', timeStyle: 'short'}} /></TableCell>
      <TableCell className="text-right">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Mark as Paid'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد إتمام الدفع</AlertDialogTitle>
              <AlertDialogDescription>
                هل تؤكد أنك قمت بتحويل مبلغ ${withdrawal.amount.toFixed(2)} إلى رقم فودافون كاش {withdrawal.phone_number}؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleProcess}>نعم، لقد دفعت</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getAdminDashboardData();
        setUsers(data.users);
        setCampaigns(data.campaigns);
        setPendingWithdrawals(data.pendingWithdrawals);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
        toast.error("Failed to load admin data.");
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdrawalProcessed = (id: string) => {
    setPendingWithdrawals(prev => prev.filter(w => w.id !== id));
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading Admin Panel...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {pendingWithdrawals.length > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <HandCoins className="h-6 w-6" />
                طلبات السحب المعلقة
              </CardTitle>
              <CardDescription>
                الطلبات التالية تحتاج إلى معالجة يدوية. قم بتحويل المبلغ ثم اضغط على "Mark as Paid".
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المستخدم</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>رقم فودافون كاش</TableHead>
                    <TableHead>تاريخ الطلب</TableHead>
                    <TableHead className="text-right">الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingWithdrawals.map((w) => (
                    <WithdrawalRow key={w.id} withdrawal={w} onProcess={handleWithdrawalProcessed} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            إدارة المستخدمين
          </CardTitle>
          <CardDescription>عرض وإدارة جميع المستخدمين في النظام.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الرصيد</TableHead>
                <TableHead>أرباح الإحالة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>${user.balance.toFixed(2)}</TableCell>
                  <TableCell>${user.referral_earnings.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'} className="flex items-center w-fit">
                      {user.status === 'active' ? <ShieldCheck className="h-3 w-3 mr-1" /> : <Ban className="h-3 w-3 mr-1" />}
                      {user.status === 'active' ? 'نشط' : 'موقوف'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                     <UserControls user={user} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            إدارة الحملات
          </CardTitle>
          <CardDescription>مراقبة وإدارة جميع الحملات الإعلانية النشطة.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المستخدم</TableHead>
                <TableHead>عنوان الحملة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign: Campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>{campaign.user_name}</TableCell>
                  <TableCell className="font-medium">{campaign.headline}</TableCell>
                  <TableCell>
                     <Badge variant={campaign.status === 'active' ? 'default' : 'outline'} className="flex items-center w-fit">
                        {campaign.status === 'active' ? <CheckCircle className="h-3 w-3 mr-1"/> : <PauseCircle className="h-3 w-3 mr-1"/>}
                        {campaign.status === 'active' ? 'نشطة' : 'متوقفة'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <CampaignControls campaign={campaign} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
