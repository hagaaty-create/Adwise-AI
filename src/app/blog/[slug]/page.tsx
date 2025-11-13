import { getArticleBySlug, getPublishedArticles } from '@/lib/actions';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, ArrowLeft, Zap } from 'lucide-react';
import type { Metadata } from 'next';

type Props = {
  params: { slug: string };
};

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${article.title} | Hagaaty Blog`,
    description: article.content.substring(0, 160).replace(/<\/?[^>]+(>|$)/g, ""), // Strip HTML for description
  };
}

export async function generateStaticParams() {
  try {
    const articles = await getPublishedArticles();
    return articles.map(article => ({
      slug: article.slug,
    }));
  } catch (error) {
    console.error("Failed to generate static params for blog:", error);
    return [];
  }
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tighter">Hagaaty</h1>
        </div>
        <nav className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
           <Button variant="ghost" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" className="mb-8">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>

          <article>
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">{article.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Published on {new Date(article.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </header>

            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: article.html_content }}
            />
          </article>
        </div>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground border-t mt-12">
        <p>&copy; {new Date().getFullYear()} Hagaaty. All rights reserved.</p>
      </footer>
    </div>
  );
}
