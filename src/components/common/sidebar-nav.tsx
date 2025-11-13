'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarRail
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Megaphone,
  Bot,
  CheckCircle,
  BrainCircuit,
  Wallet,
  Briefcase,
  Settings,
  LifeBuoy,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/create-ad', icon: Megaphone, label: 'Create Ad' },
  { href: '/dashboard/review-ad', icon: CheckCircle, label: 'Review Ad' },
  { href: '/dashboard/site-management', icon: BrainCircuit, label: 'Site AI' },
  { href: '/dashboard/financials', icon: Wallet, label: 'Financials' },
  { href: '/dashboard/subscription', icon: Briefcase, label: 'Agency' },
];

const adminNavItems = [
    { href: '/dashboard/admin', icon: Shield, label: 'Admin Panel' },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      <SidebarContent>
        <SidebarHeader>
            <SidebarTrigger />
        </SidebarHeader>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <hr className="my-4 border-sidebar-border" />
        
        <SidebarMenu>
            {adminNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <Link href="#">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Support">
                <Link href="#">
                  <LifeBuoy />
                  <span>Support</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
