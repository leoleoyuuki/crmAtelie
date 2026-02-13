
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/landing',
        '/login',
        '/ajuda',
        '/blog',
      ],
      disallow: [
        '/admin/', 
        '/pedidos', 
        '/clientes', 
        '/tarefas', 
        '/estoque', 
        '/compras', 
        '/tabela-precos', 
        '/ativacao',
        '/print/',
        '/api/'
      ],
    },
    sitemap: 'https://atelierflow.com.br/sitemap.xml',
  }
}
