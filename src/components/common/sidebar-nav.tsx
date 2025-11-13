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
import { useLanguage } from '@/context/language-context';


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



export function SidebarNav() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const { translations } = useLanguage();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: translations.sidebar.dashboard },
    { href: '/dashboard/create-ad', icon: Megaphone, label: translations.sidebar.createAd },
    { href: '/dashboard/review-ad', icon: CheckCircle, label: translations.sidebar.reviewAd },
    { href: '/dashboard/site-management', icon: BrainCircuit, label: translations.sidebar.siteAI },
    { href: '/dashboard/financials', icon: Wallet, label: translations.sidebar.financials },
    { href: '/dashboard/subscription', icon: Briefcase, label: translations.sidebar.agency },
  ];
  
  const adminNavItems = [
      // { href: '/dashboard/admin', icon: Shield, label: translations.sidebar.adminPanel }, // Temporarily disabled
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      <SidebarContent>
        <SidebarHeader>
            <SidebarTrigger />
        </SidebarHeader>
        <SidebarMenu>
          {navItems.map((item) => {
             const isActive = pathname === item.href;

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

        {isAdmin && adminNavItems.length > 0 && (
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
              <SidebarMenuButton asChild tooltip={translations.sidebar.settings}>
                <Link href="#">
                  <Settings />
                  <span>{translations.sidebar.settings}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={translations.sidebar.support}>
                <Link href="#">
                  <LifeBuoy />
                  <span>{translations.sidebar.support}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
