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
import { useEffect, useState } from 'react';


// Simple auth simulation hook
const useAuth = () => {
  // In a real app, this would be a proper authentication context
  // For now, we'll hardcode the admin user for demonstration
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    // We assume the logged-in user is 'ahmed.ali@example.com' which we treat as admin
    // This is a placeholder for a real auth check
    setIsAdmin(true); // In this prototype, we'll assume the user is always the admin.
  }, []);
  return { isAdmin };
}

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
  const { isAdmin } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      <SidebarContent>
        <SidebarHeader>
            <SidebarTrigger />
        </SidebarHeader>
        <SidebarMenu>
          {navItems.map((item) => {
             // Special case for Marketing AI to activate Create Ad link
             const isActive = item.label === 'Create Ad' 
             ? (pathname === item.href || pathname === '/dashboard/create-ad')
             : pathname === item.href;

            return (
              <SidebarMenuItem key={item.href + item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>

        {isAdmin && (
            <>
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
            </>
        )}

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
