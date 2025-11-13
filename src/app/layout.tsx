import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster as SonnerToaster } from 'sonner';
import { ChatAssistant } from '@/components/common/chat-assistant';
import { GoogleAnalytics } from '@/components/common/google-analytics';

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
    <html lang="ar" dir="rtl" className="h-full dark">
      <head>
        {/* Paste your Google Search Console HTML tag here for site verification */}
      </head>
      <body className={`${inter.variable} antialiased h-full`}>
        <GoogleAnalytics />
        {children}
        <ChatAssistant />
        <SonnerToaster richColors />
      </body>
    </html>
  );
}
