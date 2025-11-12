import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster as SonnerToaster } from 'sonner';
import { ChatAssistant } from '@/components/common/chat-assistant';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'AdWise AI',
  description: 'The All-in-One AI-Powered Advertising Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <body className={`${inter.variable} font-body antialiased h-full`}>
        {children}
        <ChatAssistant />
        <SonnerToaster richColors />
      </body>
    </html>
  );
}
