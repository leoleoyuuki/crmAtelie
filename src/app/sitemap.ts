import { MetadataRoute } from 'next'

/**
 * Gerador de Sitemap Dinâmico para o AtelierFlow.
 * 
 * Este arquivo gera automaticamente o sitemap.xml do site em tempo de execução ou build.
 * Ele ajuda motores de busca (Google, Bing) a descobrirem as páginas públicas do seu sistema.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://atelierflow.com.br'

  // Rotas estáticas públicas (páginas institucionais e de entrada)
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/landing`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/ajuda`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]

  /**
   * PREPARAÇÃO PARA O BLOG (MDX)
   * 
   * Quando você implementar o blog, poderá descomentar e adaptar o código abaixo:
   * 
   * // 1. Exemplo de função para obter slugs do sistema de arquivos ou banco
   * // const posts = await getBlogPosts() 
   * 
   * // 2. Mapeamento das rotas do blog
   * // const blogRoutes = posts.map((post) => ({
   * //   url: `${baseUrl}/blog/${post.slug}`,
   * //   lastModified: post.updatedAt || new Date(),
   * //   changeFrequency: 'monthly' as const,
   * //   priority: 0.6,
   * // }))
   * 
   * // return [...staticRoutes, ...blogRoutes]
   */

  return [...staticRoutes]
}
