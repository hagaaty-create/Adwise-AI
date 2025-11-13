'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Ban, CircleDollarSign, PauseCircle } from 'lucide-react';
import { toast } from 'sonner';
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
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';


type UserStatus = 'active' | 'suspended';
type CampaignStatus = 'active' | 'paused';

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  status: UserStatus;
}

interface Campaign {
  id: string;
  userId: string;
  userName: string;
  headline: string;
  status: CampaignStatus;
}

const initialUsers: User[] = [
  { id: 'user-001', name: 'Ahmed Ali', email: 'ahmed.ali@example.com', balance: 4.00, status: 'active' },
  { id: 'user-002', name: 'Fatima Zahra', email: 'fatima.zahra@example.com', balance: 50.00, status: 'active' },
  { id: 'user-003', name: 'Youssef Hassan', email: 'youssef.hassan@example.com', balance: 120.00, status: 'suspended' },
];

const initialCampaigns: Campaign[] = [
    { id: 'camp-001', userId: 'user-001', userName: 'Ahmed Ali', headline: 'مستقبل الإعلان بالذكاء الاصطناعي هنا', status: 'active' },
    { id: 'camp-002', userId: 'user-002', userName: 'Fatima Zahra', headline: 'خصم 50% على منتجات الصيف', status: 'active' },
];

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [amountToAdd, setAmountToAdd] = useState<number>(0);

  useEffect(() => {
    // Load from localStorage or use initial if not present
    const storedUsers = localStorage.getItem('admin_users');
    const storedCampaigns = localStorage.getItem('admin_campaigns');
    setUsers(storedUsers ? JSON.parse(storedUsers) : initialUsers);
    setCampaigns(storedCampaigns ? JSON.parse(storedCampaigns) : initialCampaigns);
  }, []);

  useEffect(() => {
    // Save to localStorage whenever state changes
    if (users.length > 0) localStorage.setItem('admin_users', JSON.stringify(users));
    if (campaigns.length > 0) localStorage.setItem('admin_campaigns', JSON.stringify(campaigns));
  }, [users, campaigns]);


  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' }
        : user
    ));
    toast.success('User status updated successfully.');
  };
  
  const handleAddBalance = (userId: string) => {
    if(amountToAdd <= 0) {
        toast.error("Please enter a valid amount.");
        return;
    }
    setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, balance: user.balance + amountToAdd }
          : user
      ));
    
    // Simulate updating global balance for the user
    if (userId === 'user-001') { // Assuming the logged-in user is user-001
        const currentBalance = parseFloat(localStorage.getItem('user_balance') || '4');
        const newBalance = currentBalance + amountToAdd;
        localStorage.setItem('user_balance', newBalance.toString());
        window.dispatchEvent(new Event('storage'));
    }

    toast.success(`$${amountToAdd.toFixed(2)} added to user's balance.`);
    setAmountToAdd(0);
  };

  const toggleCampaignStatus = (campaignId: string) => {
    setCampaigns(campaigns.map(campaign =>
      campaign.id === campaignId
        ? { ...campaign, status: campaign.status === 'active' ? 'paused' : 'active' }
        : campaign
    ));
    toast.success('Campaign status updated successfully.');
  };


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield /> لوحة تحكم المسؤول
          </CardTitle>
          <CardDescription>إدارة المستخدمين والحملات والأرصدة من هنا.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>إدارة المستخدمين</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الرصيد</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>${user.balance.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'}>
                      {user.status === 'active' ? 'نشط' : 'معطل'}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm"><CircleDollarSign className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>إضافة رصيد إلى {user.name}</AlertDialogTitle>
                          <AlertDialogDescription>
                            أدخل المبلغ الذي تريد إضافته إلى رصيد هذا المستخدم. سيتم تحديث رصيده على الفور.
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
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleAddBalance(user.id)}>إضافة الرصيد</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="destructive" size="sm" onClick={() => toggleUserStatus(user.id)}>
                      <Ban className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إدارة الحملات الإعلانية</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المستخدم</TableHead>
                <TableHead>عنوان الحملة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map(campaign => (
                <TableRow key={campaign.id}>
                  <TableCell>{campaign.userName}</TableCell>
                  <TableCell className="font-medium">{campaign.headline}</TableCell>
                  <TableCell>
                    <Badge variant={campaign.status === 'active' ? 'default' : 'outline'} className={campaign.status === 'active' ? 'bg-green-600' : ''}>
                      {campaign.status === 'active' ? 'نشطة' : 'متوقفة'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="secondary" size="sm" onClick={() => toggleCampaignStatus(campaign.id)}>
                       <PauseCircle className="h-4 w-4" />
                    </Button>
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
