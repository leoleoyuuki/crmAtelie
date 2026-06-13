# AtelierFlow Mobile - Design Document

## Overview

Rebuild the AtelierFlow CRM as a React Native (Expo) mobile application, reusing the existing Firebase backend (Firestore, Auth, Security Rules) with minimal adaptation. The app targets iOS and Android with feature parity to the web version.

## Project Location

The mobile project will be created as a **separate repository** outside the crmAtelie directory:
- **Path**: `C:\Users\leoyuuki\Documents\atelierflow\antigravity\atelierflow-mobile\`
- This keeps the web and mobile projects isolated while sharing the same Firebase backend

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 52+ |
| Routing | Expo Router (file-based) |
| State | Zustand (per-module stores) |
| Backend | Firebase JS SDK (Firestore, Auth) |
| UI | React Native Paper + custom components |
| Navigation | Bottom Tabs (5 main) + Stack per module |
| Bluetooth | expo-bluetooth + ESC/POS protocol |
| Voice AI | expo-speech (STT) + Gemini API via HTTP |
| Charts | react-native-chart-kit or victory-native |
| PDF | react-native-pdf (preview) |

## Project Structure

```
atelierflow-mobile/
├── app/                    # Expo Router (file-based routing)
│   ├── (auth)/             # Auth group
│   │   ├── login.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/             # Main group with bottom tabs
│   │   ├── _layout.tsx     # Bottom Tab Navigator
│   │   ├── index.tsx       # Dashboard
│   │   ├── pedidos.tsx     # Orders list
│   │   ├── clientes.tsx    # Customers list
│   │   ├── estoque.tsx     # Inventory list
│   │   └── mais.tsx        # "More" menu (other modules)
│   ├── pedidos/
│   │   ├── [id].tsx        # Order detail
│   │   ├── novo.tsx        # Create order
│   │   └── vendas.tsx      # Sales
│   ├── clientes/
│   │   ├── [id].tsx        # Customer detail
│   │   └── novo.tsx
│   ├── estoque/
│   │   ├── [id].tsx
│   │   └── novo.tsx
│   ├── compras.tsx
│   ├── tabela-precos.tsx
│   ├── tarefas.tsx
│   ├── catalogo.tsx
│   ├── calculadora.tsx
│   ├── configuracoes.tsx
│   ├── impressao.tsx       # Preview + Bluetooth print
│   └── _layout.tsx         # Root layout
├── components/             # Reusable components
│   ├── ui/                 # Buttons, Inputs, Cards, etc.
│   ├── orders/             # Order components
│   ├── customers/          # Customer components
│   └── voice/              # Voice assistant
├── stores/                 # Zustand stores
│   ├── auth-store.ts
│   ├── orders-store.ts
│   ├── customers-store.ts
│   ├── inventory-store.ts
│   ├── purchases-store.ts
│   ├── sales-store.ts
│   ├── price-table-store.ts
│   ├── catalog-store.ts
│   └── tasks-store.ts
├── firebase/               # Firebase configuration
│   ├── config.ts
│   └── hooks.ts            # useCollection, useDocument
├── lib/                    # Utilities
│   ├── types.ts            # Shared types with web project
│   ├── bluetooth.ts        # Bluetooth printing
│   ├── voice.ts            # Speech-to-Text + Gemini
│   └── utils.ts
├── app.json
└── package.json
```

## Navigation Architecture

### Bottom Tabs (5 main tabs)
| Tab | Icon | Module |
|---|---|---|
| Home | home | Dashboard - stats, pending orders, activity |
| Pedidos | package | Orders - list + create/edit |
| Clientes | users | Customers - list + create/edit |
| Estoque | store | Inventory - list + create/edit |
| Mais | more-horizontal | Menu - other modules |

### Auth Flow
1. App opens → check Firebase Auth state
2. Not logged in → Login screen (Email + Google OAuth)
3. Logged in but inactive → Activation screen (plan selection, Stripe/Mercado Pago)
4. Logged in active → Bottom Tabs
5. Admin UID check → admin sections accessible

## Firebase Integration

### Configuration
```typescript
// firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, persistentLocalCache } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, {
  localCache: persistentLocalCache({ tabManager: undefined })
});
const auth = getAuth(app);
```

### Data Layer
All Firestore operations from `src/lib/data.ts` (web) are directly reusable:
- Same collection names, same document structure
- Same security rules (Firestore rules are client-agnostic)
- Same transaction patterns for atomic updates

### Firestore Collections (same as web)
`users`, `customers`, `orders`, `priceTable`, `materials`, `purchases`, `fixedCosts`, `catalogProducts`, `sales`, `summaries`, `accessTokens`, `suggestions`

## State Management (Zustand)

### Store Pattern
```typescript
interface ModuleState {
  data: T[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  add: (item: TInput) => Promise<string>;
  update: (id: string, data: Partial<T>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}
```

### Stores
- `auth-store.ts` → current user, status, login/logout
- `orders-store.ts` → orders CRUD with material stock updates
- `customers-store.ts` → customers CRUD
- `inventory-store.ts` → materials CRUD
- `purchases-store.ts` → purchases + fixed costs CRUD
- `sales-store.ts` → sales CRUD
- `price-table-store.ts` → price table CRUD
- `catalog-store.ts` → catalog products CRUD
- `tasks-store.ts` → tasks from orders (derived)

## Feature Details

### Dashboard
- Welcome greeting with date (pt-BR locale)
- Stats: profit, revenue, order count (monthly/all-time)
- Pending orders card (upcoming/overdue)
- Activity card (recent orders with efficiency %)
- Financial chart (revenue vs costs vs profit)
- Period filter (current month, past months, all-time)

### Orders
- Full CRUD with customer link, service type, value, due date, status
- Statuses: Novo, Em Processo, Aguardando Retirada, Concluído
- Multi-item orders with quantity per service type
- Materials used tracking with automatic stock deduction on completion
- Material stock validation (prevents completion if insufficient)
- WhatsApp integration (wa.me links)
- Searchable and filterable by customer name and status

### Voice AI
- expo-speech for real-time transcription (PT-BR)
- Send transcript to Gemini API via HTTP
- Gemini classifies intent: ORDER, SALE, CUSTOMER, PURCHASE, FIXED_COST
- Extracts structured data and auto-fills forms
- Natural language commands in Portuguese

### Bluetooth Printing
- expo-bluetooth for device discovery and connection
- ESC/POS protocol for thermal receipt formatting (58mm)
- Preview screen before printing
- Remember last used printer

### Sales
- Register direct sales of ready-made products
- Product name, price, cost, profit tracking
- Link to catalog products

### Inventory
- Material stock management
- Stock levels, units, cost per unit
- Automatic deduction on order completion

### Purchases
- Record material purchases with cost, quantity, category
- Automatic stock increment
- Fixed costs tracking (rent, electricity, etc.)

### Price Table
- Service pricing catalog
- Used as reference in order creation

### Catalog
- Product costing: materials, labor hours, real estate hours
- Margin calculation (percentage or fixed)
- Final price computation

### Tasks
- Smart agenda prioritizing by delivery date
- Visual differentiation for overdue vs upcoming

### Calculator
- Pricing calculator for atelier services

### Settings
- User profile management
- Privacy mode password setup
- Ticket/receipt settings (logo, business name, footer)

## External Integrations (unchanged)

| Service | Purpose | Method |
|---|---|---|
| Stripe | Subscriptions | Checkout Sessions (HTTP API) |
| Mercado Pago | Subscriptions | Checkout Preferences (HTTP API) |
| Gemini AI | Voice commands | HTTP API |
| freeimage.host | Image uploads | HTTP API |
| MailerLite | Email marketing | HTTP API |
| Discord | Notifications | Webhooks |

## Shared Types

`lib/types.ts` should be symlinked or copied from the web project's `src/lib/types.ts`. All TypeScript interfaces for Firestore documents, API payloads, and domain models are shared.

## Build & Distribution

- **Development**: Expo Go app for testing
- **Preview**: EAS Build for internal testing
- **Production**: App Store (iOS) + Google Play Store via EAS Submit
- **OTA Updates**: Expo Updates for JS bundle hotfixes

## Migration Path

1. Create new Expo project
2. Port Firebase config and types from web
3. Implement auth flow
4. Build Dashboard + Orders (core)
5. Add remaining modules incrementally
6. Add Bluetooth printing
7. Add Voice AI
8. Test and polish
9. Publish to stores
