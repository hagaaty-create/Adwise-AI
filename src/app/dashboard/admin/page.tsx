'use server';

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
import { Shield, Settings } from 'lucide-react';
import { getUsers, getCampaigns } from '@/lib/actions';
import { UserControls } from './_components/user-controls';
import { CampaignControls } from './_components/campaign-controls';

export default async function AdminPage() {
  const users = await getUsers();
  const campaigns = await getCampaigns();

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield /> لوحة تحكم المسؤول
          </CardTitle>
          <CardDescription>إدارة المستخدمين والحملات والتكاملات من هنا.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings /> تكاملات Google
          </CardTitle>
           <CardDescription>قم بإدارة وإعداد تكاملات خدمات Google من هنا.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2 rounded-lg border p-4">
            <h4 className="font-semibold">Google Analytics & Tags</h4>
            <p className="text-sm text-muted-foreground">
              لتمكين تتبع الزوار والأحداث، افتح الملف التالي في مشروعك:
              <code className="mx-1 rounded bg-muted px-1.5 py-1 text-xs">src/components/common/google-analytics.tsx</code>
              ثم استبدل المعرف <code className="mx-1 rounded bg-muted px-1.5 py-1 text-xs">'G-XXXXXXXXXX'</code> بالمعرف الخاص بك.
            </p>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <h4 className="font-semibold">Google Search Console</h4>
            <p className="text-sm text-muted-foreground">
              لإثبات ملكية موقعك لجوجل، انسخ "علامة التحقق HTML" من حسابك في Search Console ثم الصقها داخل وسم `<head>` في الملف التالي:
              <code className="ml-1 rounded bg-muted px-1.5 py-1 text-xs">src/app/layout.tsx</code>
            </p>
          </div>
        </CardContent>
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
                  <TableCell>{campaign.user_name}</TableCell>
                  <TableCell className="font-medium">{campaign.headline}</TableCell>
                  <TableCell>
                    <Badge variant={campaign.status === 'active' ? 'default' : 'outline'} className={campaign.status === 'active' ? 'bg-green-600' : ''}>
                      {campaign.status === 'active' ? 'نشطة' : 'متوقفة'}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
