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
import { ChevronLeft, Calendar, Clock, User } from 'lucide-react';

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
    <div className="bg-background min-h-screen w-full flex flex-col">
      <Header />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 md:py-16">
        <Link 
          href="/blog" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Voltar para o blog
        </Link>

        <article className="space-y-8">
          <header className="space-y-6">
            <Badge variant="outline" className="border-primary text-primary px-4 py-1 uppercase tracking-wider text-[10px] font-bold">
              {post.category}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold font-headline leading-[1.2] text-foreground tracking-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-sm text-muted-foreground pt-4 border-t border-primary/10">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{format(new Date(post.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Equipe AtelierFlow</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>3 min de leitura</span>
              </div>
            </div>
          </header>

          {post.image && (
            <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-primary/10 bg-muted">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="prose prose-stone prose-lg max-w-none 
            prose-headings:font-headline prose-headings:text-foreground prose-headings:font-bold
            prose-p:text-muted-foreground/90 prose-p:leading-relaxed prose-p:mb-6
            prose-strong:text-foreground prose-strong:font-bold
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-semibold
            prose-img:rounded-2xl prose-img:shadow-lg prose-img:border prose-img:border-primary/5
            prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-primary
            prose-li:text-muted-foreground/90
            ">
            <MDXRemote source={post.content} />
          </div>
          
          <div className="mt-16 pt-10 border-t border-primary/10 flex flex-col items-center text-center pb-10">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl mb-4">
                AF
              </div>
              <h3 className="font-headline text-2xl font-bold mb-2">Gostou deste conteúdo?</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6 px-4">
                O AtelierFlow ajuda artesãos a organizarem sua rotina para focarem no que realmente importa: a arte.
              </p>
              <Link 
                href="/login" 
                className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
              >
                Começar a organizar meu ateliê
              </Link>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
}