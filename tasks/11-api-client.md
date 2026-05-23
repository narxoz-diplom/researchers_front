# 11. API Client (axios + TanStack Query)

## Цель
Единая прослойка для всех HTTP-запросов с авто-обновлением access-токена.

## Структура

```
shared/api/
  axios.ts                # инстанс + интерсепторы
  query-client.ts         # настройка TanStack Query
  auth-storage.ts         # local storage helpers
  endpoints.ts            # все пути API в одном месте
features/<f>/api/         # типизированные функции (DTO in / DTO out)
features/<f>/hooks/       # use*Query / use*Mutation
features/<f>/types.ts     # TS-типы DTO (зеркало бэка)
features/<f>/schemas.ts   # zod-схемы для форм
```

## `shared/api/endpoints.ts`

```ts
export const API = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  users: {
    me: '/users/me',
    mePassword: '/users/me/password',
    list: '/users',
    byId: (id: string) => `/users/${id}`,
    role: (id: string) => `/users/${id}/role`,
  },
  courses: {
    list: '/courses',
    mine: '/courses/mine',
    byId: (id: string) => `/courses/${id}`,
    publish: (id: string) => `/courses/${id}/publish`,
    archive: (id: string) => `/courses/${id}/archive`,
  },
  lessons: {
    byCourse: (cid: string) => `/courses/${cid}/lessons`,
    reorder: (cid: string) => `/courses/${cid}/lessons/reorder`,
    byId: (id: string) => `/lessons/${id}`,
    complete: (id: string) => `/lessons/${id}/complete`,
  },
  videos: {
    attach: (lid: string) => `/lessons/${lid}/videos`,
    byId: (id: string) => `/videos/${id}`,
  },
  materials: {
    attach: (lid: string) => `/lessons/${lid}/materials`,
    byId: (id: string) => `/materials/${id}`,
  },
  media: {
    sign: '/media/sign',
    signAvatar: '/media/sign/avatar',
  },
  subscriptions: {
    me: '/me/subscription',
    meHistory: '/me/subscriptions',
    adminList: '/admin/subscriptions',
    grant: '/admin/subscriptions/grant',
    revoke: (id: string) => `/admin/subscriptions/${id}/revoke`,
    extend: (id: string) => `/admin/subscriptions/${id}/extend`,
  },
  progress: {
    my: '/me/progress',
  },
} as const;
```

## `shared/api/axios.ts`

```ts
import axios, { AxiosError } from 'axios';
import { authStorage } from './auth-storage';
import { useAuthStore } from '@/features/auth/store/auth.store';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((cfg) => {
  const access = useAuthStore.getState().accessToken;
  if (access) cfg.headers.Authorization = `Bearer ${access}`;
  return cfg;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(undefined, async (err: AxiosError) => {
  const original = err.config!;
  const status = err.response?.status;
  if (status !== 401 || (original as any)._retry) throw err;

  (original as any)._retry = true;
  refreshing ??= (async () => {
    try {
      const rt = authStorage.getRefresh();
      if (!rt) return null;
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, { refreshToken: rt });
      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
      authStorage.setRefresh(data.refreshToken);
      return data.accessToken as string;
    } catch {
      useAuthStore.getState().logout();
      return null;
    } finally {
      refreshing = null;
    }
  })();

  const newAccess = await refreshing;
  if (!newAccess) throw err;
  original.headers!.Authorization = `Bearer ${newAccess}`;
  return api(original);
});
```

## `shared/api/query-client.ts`

```ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (count, err: any) => err?.response?.status >= 500 && count < 2,
    },
  },
});
```

## Пример feature-слоя

```ts
// features/courses/types.ts
export type Course = {
  id: string; title: string; description: string; coverUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  author: { id: string; fullName: string };
  lessonsCount: number;
  createdAt: string;
};

// features/courses/api.ts
import { api } from '@/shared/api/axios';
import { API } from '@/shared/api/endpoints';
export const coursesApi = {
  list: (params: { query?: string; page?: number; pageSize?: number }) =>
    api.get<{ data: Course[]; meta: Meta }>(API.courses.list, { params }).then(r => r.data),
  byId: (id: string) => api.get<CourseDetail>(API.courses.byId(id)).then(r => r.data),
};

// features/courses/hooks.ts
export const useCoursesQuery = (params: Params) =>
  useQuery({ queryKey: ['courses', params], queryFn: () => coursesApi.list(params) });
```

## Типы ошибок

```ts
type ApiError = {
  statusCode: number;
  error: string;
  message: string;     // машинно-читаемый код (см. backend tasks/11-api-spec.md)
  path: string;
  timestamp: string;
};

export function extractApiError(err: unknown): ApiError | null {
  const e = err as AxiosError<ApiError>;
  return e.response?.data ?? null;
}
```

## Definition of Done
- [ ] Axios-инстанс автоматически добавляет Bearer и обновляет access по 401.
- [ ] Все запросы идут через `features/*/api.ts`, ни один компонент не зовёт `api.get` напрямую.
- [ ] `extractApiError` используется везде, где обрабатываются формы.
- [ ] Query keys стандартизированы (`['courses', params]`, `['lesson', id]`, ...).
