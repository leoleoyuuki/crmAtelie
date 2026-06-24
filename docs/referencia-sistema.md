# Referência Técnica do Sistema: AtelierFlow

Este documento serve como um guia de referência rápida sobre a arquitetura, rotas, fluxos de dados e regras de negócio do **AtelierFlow** para economizar tokens em futuras interações.

---

## 💻 Visão Geral e Identidade do Sistema

O **AtelierFlow** é um sistema CRM exclusivo para artesãos, costureiras e alfaiates ("Sistema Exclusivo para Artesãos"). Ele visa automatizar a gestão de pedidos, prazos, clientes e finanças.

*   **Paleta de Cores e Estética:**
    *   **Cor Primária:** Sand / Areia Claro (`#D8CDBF` / HSL derivados) - reflete calma e o aspecto artesanal.
    *   **Cor de Fundo:** Olive / Verde Oliva Suave (`#A7A27A` / Tailwind zinc/stone variants com toques quentes).
    *   **Cor de Destaque (Accent):** Rust / Ferrugem Terroso (`#B6663D`) - para CTAs, botões e elementos interativos importantes.
*   **Tipografia:**
    *   **Títulos/Headlines:** *Playfair Display* (Serifada elegante).
    *   **Corpo:** *PT Sans* (Sans-serif clara e legível).
*   **Tecnologias:** Next.js (App Router), Firebase (Auth, Firestore), Stripe (assinaturas e portal de faturamento), Tailwind CSS + componentes customizados estilo Shadcn UI.

---

## 🗺️ Mapa de Rotas e Telas (App Shell)

O layout geral da aplicação é envelopado pelo component [app-shell.tsx](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/components/app-shell.tsx), que define o menu lateral (Sidebar), a navegação mobile flutuante (Bottom Navigation / FAB) e a barra superior (Header) com controle de metas, assistente de voz por IA e configurações de privacidade.

### 1. Landing Page
*   **Rota:** `/landing` (implementada em [src/app/landing/page.tsx](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/app/landing/page.tsx))
*   **Objetivo:** Apresentação comercial do sistema.
*   **Seções:** Hero, Recursos Gerais, FAQs, Testemunhos, Banner Mobile PWA, Call to Action (CTA).

### 2. Dashboard Principal
*   **Rota:** `/` (implementada em [src/app/page.tsx](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/app/page.tsx))
*   **Objetivo:** Tela inicial pós-login com carrossel de recursos (IA de Voz, Financeiro, Tarefas), indicadores rápidos de receita, pendências e gráficos de faturamento/lucro real baseados em [UserSummary](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/lib/types.ts#L132).

### 3. Fluxo de Caixa
*   **Rota:** `/fluxo-caixa` (implementada em [src/app/fluxo-caixa/page.tsx](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/app/fluxo-caixa/page.tsx))
*   **Objetivo:** Conciliação financeira completa.
*   **Regra:** Une **Entradas** (Pedidos concluídos + Vendas diretas) e **Saídas** (Compras de materiais + Contas/Custos fixos). Suporta filtros de datas, tipo e busca textual.

### 4. Pedidos e Fluxo de Trabalho
*   **Rota:** `/pedidos` (implementada em [src/app/pedidos/page.tsx](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/app/pedidos/page.tsx))
*   **Objetivo:** Gerenciar as encomendas de serviços.
*   **Status de Pedido:** `Novo` ➡️ `Em Processo` ➡️ `Aguardando Retirada` ➡️ `Concluído`.
*   **Integração WhatsApp:**
    *   *Confirmação de Pedido:* Link gerado com mensagem padrão e dados do serviço.
    *   *Aviso de Retirada:* Quando o status muda para `Aguardando Retirada`, envia notificação informando que está pronto.

### 5. Histórico de Vendas
*   **Rota:** `/pedidos/vendas` (implementada em [src/app/pedidos/vendas/page.tsx](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/app/pedidos/vendas/page.tsx))
*   **Objetivo:** Listar vendas diretas (itens pronta-entrega e faturamentos extras que não dependem do fluxo de confecção de um pedido).

### 6. Base de Clientes
*   **Rota:** `/clientes` (implementada em [src/app/clientes/page.tsx](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/app/clientes/page.tsx))
*   **Objetivo:** Cadastro de contatos para vinculação aos pedidos e disparo de mensagens do WhatsApp.

### 7. Agenda de Tarefas
*   **Rota:** `/tarefas` (implementada em [src/app/tarefas/page.tsx](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/app/tarefas/page.tsx))
*   **Regra de Ouro:** Uma "Tarefa" não é uma coleção independente. Ela é derivada diretamente de cada item de pedido (`OrderItem`) cujo status geral do pedido seja `Novo` ou `Em Processo`.
*   **Abas:** *Upcoming* (a vencer) e *Overdue* (atrasadas) em relação à data limite do pedido (`dueDate`).

### 8. Tabela de Preços
*   **Rota:** `/tabela-precos` (implementada em [src/app/tabela-precos/page.tsx](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/app/tabela-precos/page.tsx))
*   **Objetivo:** Cadastro rápido de serviços recorrentes (ex: Bainha, Ajuste de Ombros) com preços pré-definidos para agilizar a criação de pedidos.

### 9. Calculadora de Orçamentos
*   **Rota:** `/calculadora` (implementada em [src/app/calculadora/page.tsx](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/app/calculadora/page.tsx))
*   **Objetivo:** Precificação inteligente.
*   **Parâmetros de Cálculo:**
    1.  Custo da mão de obra (Valor/Hora × Horas estimadas).
    2.  Diluição do Custo Fixo do ateliê (Custo/Hora de imóvel × Horas de uso).
    3.  Custo de insumos/materiais utilizados.
    4.  Margem de Lucro desejada (Percentual ou Valor Fixo).
*   **Ação:** Permite salvar a precificação diretamente no Catálogo de Produtos.

### 10. Catálogo de Produtos
*   **Rota:** `/catalogo` (implementada em [src/app/catalogo/page.tsx](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/app/catalogo/page.tsx))
*   **Objetivo:** Armazenar os produtos precificados na calculadora como "base padrão de custos", sem exibição direta para os clientes.

### 11. Inventário de Materiais
*   **Rota:** `/estoque` (implementada em [src/app/estoque/page.tsx](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/app/estoque/page.tsx))
*   **Automação Importante:**
    *   **Entrada de Estoque:** Registrada através do *Registro de Compras* (`/compras`).
    *   **Saída de Estoque:** Ocorre de forma automatizada ao marcar um pedido como `Concluído` (utilizando o campo `materialsUsed` do pedido).

### 12. Custos e Registro de Compras
*   **Rota:** `/compras` (implementada em [src/app/compras/page.tsx](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/app/compras/page.tsx))
*   **Objetivo:** Lançamento de compras de materiais (insumos) e custos fixos operacionais daquele mês.

### 13. Tela de Impressão de Comprovante (Ticket)
*   **Rota:** `/print/[orderId]` (implementada em [src/app/print/[orderId]/page.tsx](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/app/print/%5BorderId%5D/page.tsx))
*   **Objetivo:** Exibir o recibo de um pedido.
*   **Destaques:** Configuração para diferentes tamanhos de bobina de impressora térmica (`58mm`, `80mm`, `110mm`) ou folhas de papel (`A4`, `1/2 A4`, `1/4 A4`). Utiliza `html2canvas` para transformar o comprovante em imagem para download ou envio por WhatsApp.

### 14. Central de Ajuda
*   **Rota:** `/ajuda` (implementada em [src/app/ajuda/page.tsx](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/app/ajuda/page.tsx))
*   **Objetivo:** Vídeo-tutoriais rápidos incorporados do YouTube e formulário para gravação de sugestões diretamente no banco de dados (`suggestions`).

### 15. Configurações gerais do Usuário
*   **Rota:** `/configuracoes` (implementada em [src/app/configuracoes/page.tsx](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/app/configuracoes/page.tsx))
*   **Objetivo:** Alterar nome, senha, gerenciar assinaturas Stripe e personalizar o cabeçalho/rodapé do Recibo (`ticketSettings`).

---

## 🗄️ Modelagem de Dados (Firestore / TypeScript)

Os principais tipos definidos no arquivo [types.ts](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/lib/types.ts) representam as coleções do Firestore:

```typescript
// 1. Clientes
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: Date;
  userId: string;
}

// 2. Pedidos (Serviços sob medida)
export interface OrderItem {
  serviceType: string;
  description?: string;
  value: number;
  quantity: number;
  assignedTo?: string;
}

export interface UsedMaterial {
    materialId: string;
    materialName: string;
    quantityUsed: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string; // Denormalizado para agilizar listagens
  items: OrderItem[];
  totalValue: number;
  dueDate: Date;
  status: 'Novo' | 'Em Processo' | 'Aguardando Retirada' | 'Concluído';
  createdAt: Date;
  userId: string;
  materialsUsed?: UsedMaterial[];
}

// 3. Vendas Diretas (Pronta-entrega)
export interface Sale {
  id: string;
  userId: string;
  productName: string;
  catalogProductId?: string;
  customerId?: string;
  customerName?: string;
  cost: number;
  price: number;
  profit: number;
  date: Date;
  createdAt: Date;
}

// 4. Materiais / Insumos no Inventário
export interface Material {
    id: string;
    name: string;
    unit: string; // Ex: metros, unidades, botões
    stock: number;
    costPerUnit?: number;
    createdAt: Date;
    userId: string;
}

// 5. Histórico de Compras de Insumos (Entradas de Estoque)
export interface Purchase {
    id: string;
    materialName: string;
    quantity: number;
    cost: number;
    unit: string;
    createdAt: Date;
    userId: string;
}

// 6. Custos Fixos Operacionais (Saídas Financeiras)
export interface FixedCost {
    id: string;
    description: string;
    cost: number;
    date: Date;
    userId: string;
}

// 7. Sumário Financeiro do Usuário (Gerado dinamicamente para estatísticas rápidas)
export interface UserSummary {
  id: string;
  userId: string;
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  monthlyRevenue: { [key: string]: number }; // Chaves no formato "YYYY-MM"
  monthlyCosts: { [key: string]: number };   // Chaves no formato "YYYY-MM"
  monthlyOrders: { [key: string]: number };  // Chaves no formato "YYYY-MM"
  monthlyGoal?: number;
  totalSalesRevenue?: number;
  totalSalesProfit?: number;
}
```

---

## 🔒 Regras de Negócio e Funcionalidades Globais

1.  **Modo Privacidade (`isPrivacyMode`):**
    *   Disponível via [PasswordContext](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/contexts/password-context.tsx).
    *   Quando ativo, oculta valores monetários (substituindo por `***` ou similares) no Dashboard e no Fluxo de Caixa para que o usuário possa usar a aplicação na frente de clientes sem expor seu faturamento.
2.  **Sincronização de Dados e Cache Local:**
    *   A aplicação usa a capacidade de persistência em cache offline do Firebase.
    *   No cabeçalho, existe um botão de *Sincronização Forçada* (`RefreshCw`) que dispara o evento `firebase-sync-force` para atualizar dados locais diretamente do servidor.
3.  **Fluxo de Assinaturas (Stripe & Trial):**
    *   Usuários novos ganham 7 dias de teste gratuito (`trial`).
    *   A ativação e expiração dos planos são verificadas no [app-shell.tsx](file:///c:/Users/leo%20yuuki/Documents/atelierflow/antigravity/crmAtelie/src/components/app-shell.tsx) e bloqueadas na ausência de pagamento ativo pós-trial.
    *   Existe também um fluxo administrativo alternativo para gerar tokens de acesso manual (`accessTokens`) com durações flexíveis.
4.  **IA de Voz (Assistente de Voz):**
    *   Localizado no cabeçalho. Permite que o artesão utilize comandos de voz para preencher formulários rapidamente (ex: "Novo pedido de bainha de calça para Maria no valor de cinquenta reais até sexta-feira").
