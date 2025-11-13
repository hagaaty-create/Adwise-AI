import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster as SonnerToaster } from 'sonner';
import { ChatAssistant } from '@/components/common/chat-assistant';
import { GoogleAnalytics } from '@/components/common/google-analytics';
import { LanguageProvider, LanguageSetter } from '@/context/language-context';


const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Hagaaty',
  description: 'The All-in-One AI-Powered Advertising Platform',
  // Add Google Search Console verification tag here if needed
  // For example:
  // verification: {
  //   google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
        <LanguageSetter>
            <GoogleAnalytics />
            {children}
            <ChatAssistant />
            <SonnerToaster richColors />
        </LanguageSetter>
    </LanguageProvider>
  );
}
