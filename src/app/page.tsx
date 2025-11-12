import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bot,
  Megaphone,
  Briefcase,
  Target,
  LineChart,
  Wallet,
  CheckCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { placeholderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'Automated Ad Creation',
    description: 'Let our AI generate high-performing ad campaigns across all major platforms in minutes.',
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: 'Smart Ad Review',
    description: 'Get your ads reviewed and activated within 10-15 minutes, ensuring compliance and relevance.',
  },
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: 'Automated Site Management',
    description: 'Our AI autonomously develops your website, creating pages and content to dominate SEO.',
  },
  {
    icon: <LineChart className="h-8 w-8 text-primary" />,
    title: 'Automated Marketing',
    description: 'From lead generation to campaign monitoring, our AI handles your entire marketing funnel.',
  },
  {
    icon: <Wallet className="h-8 w-8 text-primary" />,
    title: 'Integrated Financials',
    description: 'Manage your budget, top-ups with discounts, and referral commissions all in one place.',
  },
  {
    icon: <Briefcase className="h-8 w-8 text-primary" />,
    title: 'Agency Subscriptions',
    description: 'Unlimited ad accounts, anti-closure protection, and global targeting for agencies.',
  },
];

const heroImage = placeholderImages.find(p => p.id === 'hero');

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Megaphone className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tighter">Hagaaty</h1>
        </div>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 font-headline">
              Start Google ads
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Ad activation within 10 minutes by AI
            </p>
            <Button size="lg" asChild>
              <Link href="/signup">Claim Your $4 Welcome Bonus</Link>
            </Button>
          </div>
        </section>
        
        {heroImage && (
          <section className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative aspect-[16/9] md:aspect-[2/1] rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </section>
        )}

        <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold tracking-tighter font-headline">A Smarter Way to Advertise</h3>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
              Our AI-driven tools handle the heavy lifting, so you can focus on growing your business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/80 backdrop-blur-sm transform hover:scale-105 transition-transform duration-300">
                <CardHeader className="flex flex-row items-center gap-4">
                  {feature.icon}
                  <CardTitle className="font-headline">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Hagaaty. All rights reserved.</p>
      </footer>
    </div>
  );
}
