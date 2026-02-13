
import { getPostBySlug, getBlogPosts } from '@/lib/blog';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Blog AtelierFlow`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <article className="flex-1 container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <Link 
          href="/blog" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar para o blog
        </Link>

        <header className="space-y-6 mb-12">
          <Badge variant="outline" className="border-primary text-primary px-3 py-1">
            {post.category}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
              AF
            </div>
            <div className="text-sm">
              <p className="font-bold text-foreground">Equipe AtelierFlow</p>
              <p>{format(new Date(post.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
            </div>
          </div>
        </header>

        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl mb-12 border-4 border-card">
          <Image
            src={post.image!}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="prose prose-stone prose-lg max-w-none 
          prose-headings:font-headline prose-headings:text-foreground
          prose-p:text-muted-foreground prose-p:leading-relaxed
          prose-strong:text-foreground prose-strong:font-bold
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-2xl prose-img:shadow-lg">
          <MDXRemote source={post.content} />
        </div>
      </article>
      <Footer />
    </div>
  );
}
