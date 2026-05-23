# 05. Catalog Page

## Цель
Каталог опубликованных курсов с поиском и пагинацией.

## Маршрут
`/catalog`

## Источник данных
`GET /api/v1/courses?query=&page=1&pageSize=12` → `{ data: CourseListItem[], meta }`.

## Макет
- **Header страницы:** `<PageHeader title="Каталог курсов" />` + строка поиска (debounced 300мс) + переключатель сортировки (Новые / По названию).
- **Сетка:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`.
- **Карточка курса (`<CourseCard />`)**:
  - Обложка 16/9 (`coverUrl` или плейсхолдер).
  - Заголовок, имя автора, бейдж «N уроков».
  - Двухстрочное описание с `line-clamp-2`.
  - Кнопка-ссылка «Открыть».

## Состояния
- **Loading:** скелетоны (8 карточек).
- **Empty:** `<EmptyState title="Курсов пока нет" description="..." />`.
- **Error:** `<ErrorState onRetry />`.

## Хуки
```ts
useCoursesQuery({ query, sort, page, pageSize })
```

## URL state
Параметры `query`, `sort`, `page` синхронизированы с `searchParams` (React Router) — копируемая ссылка.

## Definition of Done
- [ ] Список грузится, пагинация работает.
- [ ] Поиск дебаунсится и обновляет URL.
- [ ] Сетка адаптивна.
- [ ] Карточка открывает `/courses/:id`.
