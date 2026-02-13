import { getBlogPosts } from '@/lib/blog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

export const metadata = {
  title: 'Blog AtelierFlow - Dicas de Gestão para Ateliês',
  description: 'Aprenda a organizar seu ateliê, aumentar sua produtividade e profissionalizar seu negócio artesanal.',
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Nosso Blog</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Dicas, tutoriais e insights feitos especialmente para profissionais do artesanato e costura.
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <Card className="h-full overflow-hidden hover:shadow-xl transition-all border-primary/10">
                  <div className="relative aspect-video">
                    <Image
                      src={post.image!}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardHeader className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                        {post.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground italic">
                        {format(new Date(post.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <CardDescription className="text-sm line-clamp-3">
                      {post.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border-2 border-dashed border-muted">
            <p className="text-muted-foreground italic">Estamos preparando conteúdos incríveis para você. Volte em breve!</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}