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
  BrainCircuit,
  Wallet,
  Briefcase,
  Settings,
  LifeBuoy,
  Shield,
  BarChart,
  Newspaper,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/language-context';


// Simple auth simulation hook
const useAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    // This is a placeholder for a real auth check.
    // We check the sessionStorage for the admin email.
    if (typeof window !== 'undefined') {
      const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');
      // The admin user is now hagaaty@gmail.com as defined in the database seed.
      if (loggedInUserEmail === 'hagaaty@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }
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
    { href: '/dashboard/campaigns', icon: BarChart, label: translations.sidebar.myCampaigns },
    { href: '/dashboard/financials', icon: Wallet, label: translations.sidebar.financials },
  ];
  
  const adminNavItems = [
      { href: '/dashboard/admin', icon: Shield, label: translations.sidebar.adminPanel },
      { href: '/dashboard/admin/site-marketing', icon: BrainCircuit, label: translations.sidebar.siteMarketing },
      { href: '/dashboard/admin/articles', icon: Newspaper, label: 'Manage Articles' },
      { href: '/dashboard/subscription', icon: Briefcase, label: translations.sidebar.agency },
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
             const isActive = pathname === (item.href);

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
                        isActive={pathname.startsWith(item.href)}
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
                <a href="mailto:hagaaty@gmail.com">
                  <LifeBuoy />
                  <span>{translations.sidebar.support}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
