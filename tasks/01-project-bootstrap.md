# 01. Project Bootstrap (Frontend)

## Цель
Развернуть Vite + React + TypeScript проект с Tailwind, shadcn/ui, линтерами и алиасами.

## Шаги

1. **Инициализация:**
   ```bash
   npm create vite@latest researchers-web -- --template react-ts
   cd researchers-web && npm install
   ```
2. **Базовые зависимости:**
   ```bash
   npm i react-router-dom @tanstack/react-query axios zod react-hook-form \
         @hookform/resolvers zustand sonner clsx tailwind-merge \
         lucide-react react-player date-fns
   ```
3. **Tailwind:**
   ```bash
   npm i -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
   `tailwind.config.ts` — `darkMode: 'class'`, `content` покрывает `./src/**/*.{ts,tsx}`.
4. **shadcn/ui:**
   ```bash
   npx shadcn@latest init
   npx shadcn@latest add button card input label dialog dropdown-menu sheet tabs \
       toast avatar badge progress separator skeleton table tooltip form select textarea
   ```
5. **TS-алиас `@/` → `src/`:**
   - `tsconfig.json` → `compilerOptions.paths: { "@/*": ["src/*"] }`
   - `vite.config.ts` → `resolve: { alias: { '@': path.resolve(__dirname, 'src') } }`
6. **ESLint + Prettier:**
   ```bash
   npm i -D eslint @typescript-eslint/{eslint-plugin,parser} \
            eslint-plugin-react eslint-plugin-react-hooks \
            eslint-plugin-react-refresh prettier eslint-config-prettier \
            eslint-plugin-import
   ```
   Husky + lint-staged для pre-commit.

## Структура src/

```
src/
  app/
    App.tsx
    router.tsx
    providers/
      QueryProvider.tsx
      ThemeProvider.tsx
      ToastProvider.tsx
  pages/
  features/
  shared/
    api/
    components/
    hooks/
    lib/
    types/
    ui/
  styles/globals.css
  main.tsx
```

## Переменные окружения (`.env.example`)
```
VITE_API_URL=http://localhost:8080/api/v1
VITE_CLOUDINARY_CLOUD_NAME=
```

## Definition of Done
- [ ] `npm run dev` поднимает приложение на `http://localhost:5173`.
- [ ] Tailwind работает (тестовая страница со shadcn/ui-кнопкой).
- [ ] `npm run lint` и `npm run format` без ошибок.
- [ ] Алиас `@/` импортируется и понимается IDE.
