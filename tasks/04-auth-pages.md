# 04. Auth Pages

## Цель
Реализовать страницы логина и регистрации, привязать к API.

## Маршруты
- `/auth/login`
- `/auth/register`

## UX

### Login
- Поля: email, password, чекбокс «Запомнить меня» (расширение TTL refresh).
- Кнопки: «Войти», «Создать аккаунт» (ссылка на /auth/register).
- Ошибки от API мапятся на конкретные поля (`INVALID_CREDENTIALS` → общая ошибка под формой).
- При успехе сохраняем токены, диспатчим `auth.login(user)` и редиректим на `from` (`location.state.from`) или `/catalog`.

### Register
- Поля: full name, email, password, confirm password.
- Валидация zod:
  - email — формат;
  - password — мин. 8, хотя бы 1 буква и 1 цифра;
  - confirm — равно password.
- `EMAIL_TAKEN` → ошибка на email-поле.

## Хранение токенов

- `accessToken` — в памяти (zustand-store `useAuthStore`).
- `refreshToken` — в `localStorage` под ключом `r_rt`.
- При старте `App.tsx` пытается вызвать `/auth/refresh` если есть `refreshToken`, чтобы поднять сессию.

```ts
// shared/api/auth-storage.ts
export const authStorage = {
  getRefresh: () => localStorage.getItem('r_rt') ?? undefined,
  setRefresh: (t: string) => localStorage.setItem('r_rt', t),
  clear: () => localStorage.removeItem('r_rt'),
};
```

## Компоненты

- `features/auth/components/LoginForm.tsx`
- `features/auth/components/RegisterForm.tsx`
- `features/auth/hooks/useLogin.ts` (TanStack mutation)
- `features/auth/hooks/useRegister.ts`
- `features/auth/hooks/useLogout.ts`
- `features/auth/store/auth.store.ts` (zustand)

## Definition of Done
- [ ] Логин и регистрация работают c бэком.
- [ ] Валидация форм через zod + react-hook-form.
- [ ] При обновлении страницы пользователь не теряет сессию, пока валиден refresh.
- [ ] Logout очищает токены и редиректит на `/auth/login`.
