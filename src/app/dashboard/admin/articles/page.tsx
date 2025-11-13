'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getArticles, publishArticle, deleteArticle } from '@/lib/actions';
import type { Article } from '@/lib/db';
import { Loader2, Newspaper, CheckCircle, Edit, Trash2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function ArticleRow({ article, onArticleUpdate }: { article: Article, onArticleUpdate: () => void }) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publishArticle(article.id);
      toast.success("Article published successfully!");
      onArticleUpdate();
    } catch (error) {
      toast.error("Failed to publish article.");
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteArticle(article.id);
      toast.success("Article deleted successfully.");
      onArticleUpdate();
    } catch (error) {
      toast.error("Failed to delete article.");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium max-w-sm truncate">
        {article.status === 'published' ? (
             <Link href={`/blog/${article.slug}`} target="_blank" className="hover:underline" title={article.title}>
                {article.title}
            </Link>
        ) : (
            <span title={article.title}>{article.title}</span>
        )}
       
      </TableCell>
      <TableCell>
        <Badge variant={article.status === 'published' ? 'secondary' : 'outline'} className="flex w-fit items-center gap-1">
          {article.status === 'published' ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Edit className="h-3 w-3" />}
          {article.status}
        </Badge>
      </TableCell>
      <TableCell>{new Date(article.created_at).toLocaleDateString()}</TableCell>
      <TableCell className="text-right flex items-center justify-end gap-2">
        {article.status === 'draft' && (
          <Button size="sm" onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4 mr-1" />}
            Publish
          </Button>
        )}
         <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this article?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the article "{article.title}".
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Yes, Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

export default function ManageArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const fetchedArticles = await getArticles();
      setArticles(fetchedArticles);
    } catch (error) {
      toast.error("Failed to load articles.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-6 w-6" />
            Manage AI-Generated Articles
          </CardTitle>
          <CardDescription>
            Review, publish, and manage all articles created by the Autonomous Site Marketing AI. Published articles will be live on your public blog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.length > 0 ? (
                articles.map(article => (
                  <ArticleRow key={article.id} article={article} onArticleUpdate={fetchArticles} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                    No articles found. Go to the "Admin {'>'} Site Marketing" page to generate one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
