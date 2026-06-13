# AtelierFlow Mobile - Implementation Plan

## Phase 1: Project Setup (Steps 1-3)
1. Create Expo project with TypeScript template
2. Install core dependencies (Firebase, Zustand, React Native Paper, Expo Router)
3. Configure Firebase, navigation structure, and shared types

## Phase 2: Authentication (Steps 4-5)
4. Implement Firebase Auth (Email + Google OAuth)
5. Auth flow: login, activation check, phone requirement

## Phase 3: Core Data Layer (Steps 6-8)
6. Firebase config + Firestore hooks (useCollection, useDocument)
7. Zustand stores for all modules
8. Shared types from web project

## Phase 4: UI Shell & Dashboard (Steps 9-11)
9. Bottom Tab Navigator with 5 tabs
10. Dashboard screen (stats, charts, pending orders, activity)
11. App header with voice assistant button

## Phase 5: Orders Module (Steps 12-15)
12. Orders list (searchable, filterable)
13. Create/Edit order form (multi-item, materials, customer link)
14. Order detail screen (status management, WhatsApp)
15. Sales list + create sale

## Phase 6: Customers Module (Steps 16-17)
16. Customers list (searchable)
17. Create/Edit customer form + detail screen

## Phase 7: Inventory & Purchases (Steps 18-20)
18. Inventory list + CRUD (materials, stock levels)
19. Purchases list + CRUD (auto stock increment)
20. Fixed costs management

## Phase 8: Supporting Modules (Steps 21-25)
21. Price Table CRUD
22. Product Catalog with cost breakdown
23. Tasks/agenda screen
24. Calculator screen
25. Settings screen (profile, privacy, ticket settings)

## Phase 9: Bluetooth Printing (Steps 26-27)
26. Bluetooth device discovery + connection
27. ESC/POS ticket generation + print

## Phase 10: Voice AI (Steps 28-29)
28. Speech-to-Text integration (expo-speech)
29. Gemini API integration + intent parsing + form auto-fill

## Phase 11: Polish & Deploy (Steps 30-32)
30. Error handling, loading states, empty states
31. Testing on physical device
32. EAS Build configuration + store submission
