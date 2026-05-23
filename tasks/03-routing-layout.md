# 03. Routing & Layout

## Цель
Описать карту маршрутов, общий лейаут и guards для ролей и подписки.

## Дерево маршрутов

```
/
├── /auth
│    ├── /login
│    └── /register
├── /catalog                            (subscriber/author/admin)
├── /courses/:id                        (auth required)
│    └── /lessons/:lessonId             (subscription/owner/admin)
├── /studio                             (author/admin)
│    ├── /                              # список своих курсов
│    ├── /courses/new                   # создать
│    ├── /courses/:id                   # редактор курса
│    └── /courses/:id/lessons/:lessonId # редактор урока
├── /admin                              (admin)
│    ├── /users
│    └── /subscriptions
├── /profile                            (auth required)
├── /403                                # forbidden
├── /404                                # not found
```

## Лейауты

- **`AuthLayout`** (`/auth/*`) — узкий центрированный контейнер, логотип, форма.
- **`AppLayout`** (всё остальное) — top header + side navigation:
  - Header: лого, поиск, переключатель темы, `<UserMenu />`.
  - Sidebar: ссылки в зависимости от роли:
    - Subscriber: Каталог, Профиль.
    - Author: Каталог, Studio, Профиль.
    - Admin: Каталог, Studio, Admin, Профиль.
  - Контент: `<Outlet />`.

## Guards

```tsx
// shared/components/ProtectedRoute.tsx
type Props = {
  allowedRoles?: Role[];
  requireSubscription?: boolean;  // дополнительная проверка
};

export function ProtectedRoute({ allowedRoles, requireSubscription }: Props) {
  const { user, isLoading } = useAuth();
  const { data: sub } = useMySubscription({ enabled: !!user });

  if (isLoading) return <LoadingState />;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/403" replace />;
  if (requireSubscription && user.role === 'SUBSCRIBER' && !sub?.isActive) {
    return <Navigate to={`/courses/${courseId}?paywall=1`} replace />;
  }
  return <Outlet />;
}
```

Использование:

```tsx
<Route element={<ProtectedRoute />}>
  <Route path="/catalog" element={<CatalogPage />} />
  <Route path="/profile" element={<ProfilePage />} />
</Route>

<Route element={<ProtectedRoute allowedRoles={['AUTHOR', 'ADMIN']} />}>
  <Route path="/studio" element={<StudioLayout />}>
    <Route index element={<StudioCoursesPage />} />
    ...
  </Route>
</Route>

<Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
  <Route path="/admin" element={<AdminLayout />}>
    <Route path="users" element={<AdminUsersPage />} />
    <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
  </Route>
</Route>
```

Доступ к содержимому Lesson Player отдаёт сам экран (см. `07-lesson-player-page.md`) — он умеет отображать заблокированное состояние, если бэк вернул `403 SUBSCRIPTION_REQUIRED`.

## Definition of Done
- [ ] Все маршруты подключены, переходы работают.
- [ ] Сайдбар адаптивно сворачивается на мобильных (`<Sheet />`).
- [ ] Неавторизованный пользователь редиректится на `/auth/login` и после логина — обратно (`location.state.from`).
- [ ] Forbidden / Not found страницы дружелюбные с кнопкой «Вернуться на главную».
