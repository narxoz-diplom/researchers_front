# 09. Admin Panel

## Цель
Дать админу UI для управления пользователями, ролями и подписками.

## Маршруты
- `/admin/users`
- `/admin/subscriptions`

## Users (`/admin/users`)

**Таблица** с пагинацией и поиском:
- Колонки: Avatar, ФИО, email, роль (`<RoleBadge />`), активная подписка (Да/Нет + срок), дата регистрации, действия.
- Действия:
  - «Сменить роль» — `<Dialog />` со `<Select />` (ADMIN / AUTHOR / SUBSCRIBER).
  - «Выдать подписку» — `<Dialog />` с `plan` + `durationDays` → `POST /admin/subscriptions/grant`.
  - «Удалить» — `<ConfirmDialog />`.

## Subscriptions (`/admin/subscriptions`)

**Таблица всех подписок:**
- Поля: пользователь, план, статус (`<StatusBadge />` ACTIVE/EXPIRED/REVOKED), `startsAt`, `expiresAt`, кем выдана.
- Фильтры: по статусу, по email пользователя.
- Действия:
  - «Продлить» — `<Dialog />` (`extraDays`).
  - «Отозвать» — `<ConfirmDialog />`.

## Запросы
- `GET /api/v1/users?query=&role=&page=`
- `PATCH /api/v1/users/:id/role`
- `DELETE /api/v1/users/:id`
- `GET /api/v1/admin/subscriptions?status=&userId=&page=`
- `POST /api/v1/admin/subscriptions/grant`
- `POST /api/v1/admin/subscriptions/:id/revoke`
- `POST /api/v1/admin/subscriptions/:id/extend`

## UX-правила
- Любое деструктивное действие — через `<ConfirmDialog>` с явным текстом.
- После успеха — toast «Подписка выдана пользователю X до 2026-06-23».
- При попытке даунгрейдить последнего админа — бэк отдаст `LAST_ADMIN_PROTECTED`, фронт показывает понятный текст в toast.

## Definition of Done
- [ ] Админ может найти любого пользователя, поменять роль, выдать/отозвать/продлить подписку.
- [ ] Таблицы поддерживают пагинацию и поиск.
- [ ] Все диалоги имеют валидацию полей (`zod`).
- [ ] Доступ к `/admin/*` только у роли `ADMIN`.
