# ТЗ — researchers (Frontend)

## 1. Назначение проекта

**researchers** — образовательная платформа с ручным наполнением курсов. Авторы создают курсы (текст уроков + видео + файлы), пользователи получают доступ к контенту **по подписке, которую вручную выдаёт админ**. Никаких AI-функций, генерации контента или RAG — этот проект сознательно делает «ручную» версию academis.

Фронтенд отвечает за:
- авторизацию и поддержку JWT (access + refresh);
- каталог опубликованных курсов, поиск и фильтры;
- страницу курса с уроками и индикатором подписки;
- плеер урока (видео + материалы) и отметку прохождения;
- **Creator Studio** для автора (CRUD курсов и уроков, загрузка медиа напрямую в Cloudinary);
- **Admin Panel** для админа (роли + подписки);
- личный кабинет, прогресс, статус подписки;
- единый дизайн-язык (Tailwind + shadcn/ui), light/dark тема.

## 2. Стек

- **Build:** Vite + React 18 + TypeScript (strict).
- **Routing:** React Router v6.
- **State / data:** TanStack Query (server state), Zustand для лёгкого UI-state (модалки, тема).
- **UI:** Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/) (Radix-based).
- **Формы:** react-hook-form + zod.
- **Видео:** react-player (HTML5/HLS).
- **HTTP:** axios с интерсепторами (auth + refresh).
- **Иконки:** lucide-react.
- **Уведомления:** sonner (toast).
- **Cloudinary upload:** прямые `multipart/form-data` запросы на `https://api.cloudinary.com/v1_1/{cloud}/upload` с подписью, полученной с бэка.

## 3. Архитектурные принципы

Соблюдаем Clean Architecture + SOLID + DRY на масштабах фронта:

- **Слой `pages/`** — экранные компоненты, отвечают только за композицию.
- **Слой `features/<feature>/`** — фичевые модули (`api`, `hooks`, `components`, `types`, `schemas`). Содержат бизнес-логику фронта.
- **Слой `shared/`** — переиспользуемые UI-компоненты, утилиты, API-клиент.
- **Никакого fetch'а напрямую из компонентов** — только через хуки TanStack Query внутри `features/*/hooks`.
- **DTO и Zod-схемы** живут рядом с фичей; не передаём по приложению «сырые» Axios-объекты.
- **Guards** реализуются через `<ProtectedRoute role=... requiresSubscription>` и `<RoleSwitch>`.

```
src/
  app/
    App.tsx
    router.tsx
    providers/        # QueryClientProvider, ThemeProvider, ToastProvider
  pages/
    auth/{LoginPage,RegisterPage}.tsx
    catalog/CatalogPage.tsx
    course/{CourseDetailPage,LessonPlayerPage}.tsx
    studio/{StudioCoursesPage,StudioCourseEditor,StudioLessonEditor}.tsx
    admin/{AdminUsersPage,AdminSubscriptionsPage}.tsx
    profile/ProfilePage.tsx
    common/{NotFoundPage,ForbiddenPage}.tsx
  features/
    auth/
    users/
    courses/
    lessons/
    media/
    subscriptions/
    progress/
  shared/
    api/axios.ts
    ui/                # обёртки над shadcn/ui
    components/        # Layout, Header, Sidebar, EmptyState, LoadingState
    hooks/
    lib/
    types/
  styles/
    globals.css
```

## 4. Пользовательские роли и видимость экранов

| Экран                  | Subscriber              | Author                  | Admin |
|------------------------|-------------------------|-------------------------|-------|
| Каталог `/catalog`     | да                      | да                      | да    |
| Страница курса         | контент за пэйволлом    | свой курс — полный      | полный|
| Lesson Player          | требуется подписка      | свой курс — без подписки| без подписки |
| Studio `/studio/*`     | нет                     | да                      | да    |
| Admin `/admin/*`       | нет                     | нет                     | да    |
| Profile                | да                      | да                      | да    |

## 5. Дизайн-язык

- Тема — нейтральные тёмные + светлые палитры, акцентный цвет (по согласованию).
- Сетка — 8px.
- Карточки курсов 16/9 обложка + 2 строки описания.
- Lesson Player — двухколоночный: видеоплеер + список уроков справа.
- Полностью адаптивный (320px → 1440px+).
- Поддержка клавиатурной навигации и `prefers-reduced-motion`.

Подробности — в [`tasks/02-design-system.md`](tasks/02-design-system.md) и [`design-prompt.md`](design-prompt.md).

## 6. План работ (таски)

Декомпозиция — в папке [`tasks/`](tasks/):

1. [`00-overview.md`](tasks/00-overview.md) — общий обзор продукта (единый для фронта и бэка).
2. [`01-project-bootstrap.md`](tasks/01-project-bootstrap.md) — Vite + Tailwind + shadcn/ui.
3. [`02-design-system.md`](tasks/02-design-system.md) — токены, базовые компоненты, темы.
4. [`03-routing-layout.md`](tasks/03-routing-layout.md) — роутер, лейаут, guards.
5. [`04-auth-pages.md`](tasks/04-auth-pages.md) — логин и регистрация.
6. [`05-catalog-page.md`](tasks/05-catalog-page.md) — каталог опубликованных курсов.
7. [`06-course-detail-page.md`](tasks/06-course-detail-page.md) — страница курса + пэйволл.
8. [`07-lesson-player-page.md`](tasks/07-lesson-player-page.md) — плеер урока.
9. [`08-creator-studio.md`](tasks/08-creator-studio.md) — Studio автора и загрузка медиа.
10. [`09-admin-panel.md`](tasks/09-admin-panel.md) — пользователи, подписки, роли.
11. [`10-profile-page.md`](tasks/10-profile-page.md) — личный кабинет.
12. [`11-api-client.md`](tasks/11-api-client.md) — axios + TanStack Query + типы.

Промпт для генерации UI-дизайна через Claude — [`design-prompt.md`](design-prompt.md).

## 7. Definition of Done всего фронта

- [ ] Все ключевые экраны доступны под нужными ролями.
- [ ] Автор реально может загрузить видео в Cloudinary прямо из браузера.
- [ ] Подписчик без подписки видит «заглушку с CTA», а после выдачи подписки — открытый контент.
- [ ] Light/dark тема, отзывчивая вёрстка ≥ 320 px.
- [ ] Покрытие линтером без ошибок, TypeScript strict без `any` в публичных сигнатурах.
- [ ] README объясняет, как запустить (`npm install`, `npm run dev`).
