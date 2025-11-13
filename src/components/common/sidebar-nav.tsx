
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
  Briefcase,
  Settings,
  LifeBuoy,
  Shield,
  BarChart,
  Newspaper,
  BookOpen,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/language-context';


// Simple auth simulation hook
const useAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  
  // We need to use useEffect to avoid hydration errors, as sessionStorage is client-side only.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');
      // The admin user is now hagaaty@gmail.com as defined in the database seed.
      if (loggedInUserEmail === 'hagaaty@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }
  }, []); // Empty dependency array means this runs once on the client after mount.

  return { isAdmin };
}



export function SidebarNav() {
  const pathname = usePathname();
  const { translations } = useLanguage();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: translations.sidebar.dashboard },
    { href: '/dashboard/create-ad', icon: Megaphone, label: translations.sidebar.createAd },
    { href: '/dashboard/campaigns', icon: BarChart, label: translations.sidebar.myCampaigns },
    { href: '/dashboard/financials', icon: Wallet, label: translations.sidebar.financials },
    { href: '/blog', icon: BookOpen, label: 'Blog', isPublic: true },
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
                  // Public items get a regular link, dashboard items get a dashboard-style link
                  target={item.isPublic ? '_blank' : ''}
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
                <Link href="/dashboard/support">
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

    