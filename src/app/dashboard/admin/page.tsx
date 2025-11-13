'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getUsers, getCampaigns } from '@/lib/actions';
import { Shield, Users, Megaphone, CheckCircle, PauseCircle, Ban, ShieldCheck, Loader2 } from 'lucide-react';
import type { User, Campaign } from '@/lib/db';
import { UserControls } from './_components/user-controls';
import { CampaignControls } from './_components/campaign-controls';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [usersData, campaignsData] = await Promise.all([
          getUsers(),
          getCampaigns(),
        ]);
        setUsers(usersData as User[]);
        setCampaigns(campaignsData as Campaign[]);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

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
