'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, X, Loader2, Send, LinkIcon } from 'lucide-react';
import { assistUser } from '@/ai/flows/intelligent-assistant';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const parseAssistantResponse = (text: string) => {
    const regex = /\[Link: (.*?)\]/;
    const match = text.match(regex);
    if (match) {
        const mainText = text.replace(regex, '').trim();
        const linkUrl = match[1];
        const linkTextMatch = mainText.match(/the (.*?) page\?/);
        const linkText = linkTextMatch ? linkTextMatch[1] : 'Go to Page';
        return { mainText, link: { url: linkUrl, text: linkText } };
    }
    return { mainText: text, link: null };
};

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsLoading(true);
      const initialMessage: Message = {role: 'assistant', content: "Hello! I'm your Hagaaty AI assistant. How can I help you today? You can ask me about the website's features or how to navigate it."};
      // Prevent adding another initial message if one already exists.
      if (messages.length === 0) {
          setMessages([initialMessage]);
      }
      setIsLoading(false);
    }
  }, [isOpen, messages.length]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = { role: 'user', content: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = [...messages, userMessage]; 

      const result = await assistUser({
        query: trimmedInput,
        history: history.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({role: m.role, content: m.content})),
      });
      
      const assistantMessage: Message = { role: 'assistant', content: result.response };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error('AI assistant error:', error);
      const errorMessage: Message = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error('Assistant Error', {
        description: 'Sorry, I encountered an error. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkClick = (url: string) => {
    if (url === pathname) {
        setMessages((prev) => [...prev, {role: 'assistant', content: "You are already on that page!"}]);
    } else {
        router.push(url);
        setIsOpen(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-4 right-4 z-50">
            <Button onClick={() => setIsOpen(true)} size="icon" className="rounded-full h-14 w-14 shadow-lg">
            <Bot className="h-6 w-6" />
            </Button>
        </div>
      )}

      {isOpen && (
        <Card className="fixed bottom-4 right-4 z-50 w-full max-w-sm h-[60vh] flex flex-col shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2"><Bot className="h-5 w-5 text-primary" /> Hagaaty AI Assistant</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
                <X className="h-4 w-4" />
                <span className="sr-only">Close chat</span>
            </Button>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="p-4 space-y-4">
                {messages.map((message, index) => {
                   const { mainText, link } = message.role === 'assistant' ? parseAssistantResponse(message.content) : { mainText: message.content, link: null };

                   return (
                      <div
                        key={index}
                        className={cn(
                          'flex items-end gap-2',
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          <p className="whitespace-pre-wrap">{mainText}</p>
                           {link && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="mt-2 w-full"
                                onClick={() => handleLinkClick(link.url)}
                            >
                                <LinkIcon className="mr-2 h-4 w-4" />
                                {link.text}
                            </Button>
                           )}
                        </div>
                      </div>
                    )
                })}
                {isLoading && (
                  <div className="flex justify-start gap-2">
                     <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
