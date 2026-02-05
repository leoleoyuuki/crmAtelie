# AtelierFlow 🧵

O AtelierFlow é um sistema de gestão inteligente projetado exclusivamente para ateliês de costura, artesanato e profissionais de personalizados. Ele substitui cadernos, planilhas e anotações soltas por um fluxo de trabalho organizado, profissional e baseado em dados.

## 🚀 Funcionalidades Principais

### 📊 Dashboard Estratégico
- **Visão Geral Financeira:** Gráficos de faturamento e lucro líquido (Receita - Custos).
- **Distribuição de Serviços:** Entenda quais tipos de pedidos são mais frequentes no seu ateliê.
- **Modo de Privacidade:** Esconda valores sensíveis com um clique, protegido por senha, ideal para quando clientes estão por perto.

### 📝 Gestão de Pedidos e Clientes
- **Fluxo Completo:** Do cadastro do cliente à entrega final.
- **Impressão de Comprovantes:** Gere tickets térmicos (58mm) profissionais para seus clientes.
- **Comunicação via WhatsApp:** Envie confirmações de pedido e avisos de "Pronto para Retirada" com um clique.
- **Painel de Tarefas:** Uma agenda inteligente que prioriza seus itens por data de entrega (Próximos vs. Atrasados).

### 📦 Controle de Estoque e Custos
- **Inventário Automatizado:** Baixa automática de materiais ao concluir um pedido.
- **Registro de Compras:** Acompanhe o histórico de compras de materiais e atualize seu estoque simultaneamente.
- **Custos Fixos:** Gerencie despesas como aluguel, luz e internet para um cálculo real de lucro.

### 💰 Comercial e Monetização
- **Tabela de Preços:** Padronize seus valores para agilizar a criação de novos orçamentos.
- **Fluxo de Ativação:** Sistema de assinatura com 7 dias de teste grátis.
- **Integração Mercado Pago:** Pagamentos automatizados via checkout transparente/webhook.

## 🛠️ Stack Tecnológica

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [Shadcn/UI](https://ui.shadcn.com/)
- **Backend/Banco de Dados:** [Firebase (Firestore & Auth)](https://firebase.google.com/)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Animações:** [Framer Motion](https://www.framer.com/motion/)

## 📂 Estrutura do Projeto

```text
src/
├── app/              # Rotas e Páginas do Next.js
├── components/       # Componentes React reutilizáveis
│   ├── dashboard/    # Widgets e tabelas do painel principal
│   ├── estoque/      # Gestão de inventário
│   ├── landing/      # Seções da página de marketing
│   └── ui/           # Componentes base (Shadcn)
├── firebase/         # Configuração e Hooks customizados do Firebase
├── lib/              # Funções utilitárias, tipos e lógica de dados
└── contexts/         # Context Providers (ex: Senha de Privacidade)
```

## ⚙️ Configuração Local

1. **Clonar o repositório:**
   ```bash
   git clone [url-do-repositorio]
   cd atelierflow
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Variáveis de Ambiente:**
   Crie um arquivo `.env.local` na raiz com as seguintes chaves:
   ```env
   # Firebase Public
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...

   # Firebase Admin (para Webhooks)
   FIREBASE_PROJECT_ID=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY=...

   # Mercado Pago
   NEXT_PUBLIC_MP_PUBLIC_KEY=...
   MP_ACCESS_TOKEN=...

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:9002
   ```

4. **Rodar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## 🔒 Segurança (Firestore Rules)

O projeto utiliza Regras de Segurança do Firebase que garantem que:
- Usuários só podem acessar seus próprios dados (`userId` check).
- Apenas usuários com status `active` (assinatura válida ou trial) podem realizar operações de escrita.
- Administradores específicos têm acesso global para suporte e auditoria.

---
Criado com foco em quem transforma tecido e matéria-prima em arte. **AtelierFlow: Menos papelada, mais arte.**