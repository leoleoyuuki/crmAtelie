import { MetadataRoute } from 'next'

/**
 * Gerador de robots.txt para o AtelierFlow.
 * 
 * Controla o acesso de robôs de busca. Permitimos a indexação das páginas
 * públicas (Home, Landing, Ajuda) e bloqueamos as rotas internas do 
 * dashboard para proteger a privacidade e economizar recursos de rastreamento.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/landing',
        '/login',
        '/ajuda',
      ],
      // Bloqueia indexação de todas as páginas de gerenciamento e dados sensíveis
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
        '/api/' // Protege rotas de API internas
      ],
    },
    sitemap: 'https://atelierflow.com.br/sitemap.xml',
  }
}
