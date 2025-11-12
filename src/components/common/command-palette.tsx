'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Megaphone,
  Bot,
  CheckCircle,
  BrainCircuit,
  Wallet,
  Briefcase,
  Search,
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
} from '@/components/ui/command';

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/create-ad', icon: Megaphone, label: 'Create Ad' },
    { href: '/dashboard/review-ad', icon: CheckCircle, label: 'Review Ad' },
    { href: '/dashboard/site-management', icon: BrainCircuit, label: 'Site AI' },
    { href: '/dashboard/marketing', icon: Bot, label: 'Marketing AI' },
    { href: '/dashboard/financials', icon: Wallet, label: 'Financials' },
    { href: '/dashboard/subscription', icon: Briefcase, label: 'Agency' },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

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
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navItems.map((item) => (
              <CommandItem
                key={item.href}
                value={item.label}
                onSelect={() => {
                  runCommand(() => router.push(item.href));
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
