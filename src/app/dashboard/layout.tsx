'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/common/header';
import { SidebarNav } from '@/components/common/sidebar-nav';
import { LanguageProvider } from '@/context/language-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <SidebarProvider>
          <SidebarNav />
          <SidebarInset>
            <Header />
            <main className="p-4 sm:px-6 sm:py-4">
              {children}
            </main>
          </SidebarInset>
      </SidebarProvider>
    </LanguageProvider>
  );
}
