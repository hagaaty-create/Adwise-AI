'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Megaphone,
  Bot,
  BrainCircuit,
  Wallet,
  Briefcase,
  Search,
  UploadCloud,
  Terminal,
  BarChart,
  Shield,
  Newspaper,
  BookOpen,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
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
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { href: '/dashboard/create-ad', icon: Megaphone, label: 'إنشاء إعلان' },
    { href: '/dashboard/campaigns', icon: BarChart, label: 'حملاتي' },
    { href: '/dashboard/financials', icon: Wallet, label: 'الماليات' },
    { href: '/blog', icon: BookOpen, label: 'المدونة', isPublic: true },
];

const gitCommands = `git add .
git commit -m "feat: Stabilize and finalize AI features"
git push origin main`;

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [showPublishDialog, setShowPublishDialog] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ الأوامر!", {
      description: "الآن الصقها في الطرفية (Terminal) لتشغيلها.",
    });
  };


  return (
    <>
      <Button
        variant="outline"
        className={cn(
          'relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64'
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">بحث...</span>
        <span className="inline-flex lg:hidden">بحث...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="اكتب أمراً أو ابحث..." />
        <CommandList>
          <CommandEmpty>لم يتم العثور على نتائج.</CommandEmpty>
          <CommandGroup heading="التنقل">
            {navItems.map((item) => (
              <CommandItem
                key={item.href + item.label}
                value={item.label}
                onSelect={() => {
                  runCommand(() => item.isPublic ? window.open(item.href, '_blank') : router.push(item.href));
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
           <CommandSeparator />
           <CommandGroup heading="الإجراءات">
            <CommandItem
              value="Publish"
              onSelect={() => {
                runCommand(() => setShowPublishDialog(true));
              }}
            >
              <UploadCloud className="mr-2 h-4 w-4" />
              نشر تحديثات الموقع
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Terminal /> كيفية نشر تحديثاتك
            </AlertDialogTitle>
            <AlertDialogDescription>
              لنشر التغييرات الخاصة بك، يجب نسخ الأوامر أدناه ولصقها في الطرفية (Terminal). **لا يمكن القيام بذلك من المتصفح.**
              <div className="mt-4 p-4 bg-muted rounded-lg font-mono text-sm text-foreground relative">
                <pre>{gitCommands}</pre>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => copyToClipboard(gitCommands)}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
                </Button>
              </div>
               <p className="mt-4 text-xs text-muted-foreground">
                **ملاحظة هامة:** إذا واجهت خطأ 'Authentication failed' (فشل المصادقة) مرة أخرى، فهذا يعني أنك بحاجة إلى تكوين أذونات الوصول بين هذه البيئة وحسابك على GitHub أولاً.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowPublishDialog(false)}>فهمت</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
