# 02. Design System

## Цель
Зафиксировать токены, типографику и базовые компоненты, чтобы вёрстка всех экранов была единой.

## Цветовая палитра

Используем CSS-переменные shadcn/ui (HSL). Базовые значения:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --primary: 221 83% 53%;       /* акцент (синий) */
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --accent: 210 40% 96%;
  --destructive: 0 84% 60%;
  --border: 214 32% 91%;
  --ring: 221 83% 53%;
  --radius: 0.75rem;
}
.dark {
  --background: 222 47% 6%;
  --foreground: 210 40% 98%;
  --card: 222 47% 8%;
  --card-foreground: 210 40% 98%;
  --primary: 217 91% 60%;
  --primary-foreground: 222 47% 11%;
  --secondary: 217 33% 17%;
  --muted: 217 33% 17%;
  --muted-foreground: 215 20% 65%;
  --border: 217 33% 17%;
  --ring: 217 91% 60%;
}
```

Акцент по умолчанию — синий; можно подменить в `design-prompt.md` под конкретный бренд.

## Типографика

- Шрифт: `Inter` (sans), `JetBrains Mono` (code).
- Размеры: text-xs(12), sm(14), base(16), lg(18), xl(20), 2xl(24), 3xl(30), 4xl(36).
- Заголовки страниц — `text-3xl font-semibold tracking-tight`.

## Сетка и spacing

- Основная сетка — Tailwind 8px (1 unit = 4px).
- Контейнер: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- Карточки: `rounded-2xl border bg-card shadow-sm`.

## Базовые компоненты (через shadcn/ui)

- `Button` — варианты `default | secondary | outline | ghost | destructive | link`.
- `Input`, `Textarea`, `Select`, `Label`, `Form` (react-hook-form bindings).
- `Card`, `Dialog`, `Sheet`, `DropdownMenu`, `Tabs`, `Tooltip`, `Badge`, `Avatar`, `Skeleton`, `Progress`, `Table`, `Toast`.
- Кастомные обёртки в `shared/ui/`:
  - `<PageHeader title subtitle actions />`
  - `<EmptyState icon title description action />`
  - `<LoadingState />`
  - `<ErrorState />`
  - `<RoleBadge role />`, `<StatusBadge status />`
  - `<UploadButton onSelect accept maxSizeMb />`

## Темизация

`ThemeProvider` хранит `theme: 'light' | 'dark' | 'system'` в `localStorage` и переключает класс `dark` на `<html>`.

## Состояния

Каждый экран обязан корректно отображать:
- loading (skeleton);
- empty (EmptyState с CTA);
- error (ErrorState с кнопкой Retry);
- forbidden (нет роли / нет подписки) — отдельная заглушка с CTA.

## Definition of Done
- [ ] Палитра подключена, тема переключается.
- [ ] Все базовые компоненты shadcn доступны и обёрнуты, где нужно.
- [ ] Visual storybook (или просто `/_/design` страница) демонстрирует кнопки/инпуты/карточки.
- [ ] Контраст соответствует WCAG AA для текста.
