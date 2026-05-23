# 08. Creator Studio

## Цель
Дать автору полный CRUD: создание/редактирование курсов и уроков, загрузка видео и файлов прямо в Cloudinary.

## Маршруты
- `/studio` — список своих курсов.
- `/studio/courses/new` — создание курса.
- `/studio/courses/:id` — редактор курса (метаданные + уроки).
- `/studio/courses/:id/lessons/:lessonId` — редактор урока (контент + видео + материалы).

## Список своих курсов
- Таблица: обложка, название, статус (`<StatusBadge />`), кол-во уроков, дата обновления, действия (Редактировать / Опубликовать / Архивировать / Удалить).
- Кнопка «Создать курс» вверху справа.

## Редактор курса

**Левая колонка — форма метаданных:**
- Поле «Название» (text), «Описание» (textarea), «Статус» (select), обложка (`<UploadButton accept="image/*" maxSizeMb={5} />`).
- Кнопки: «Сохранить», «Опубликовать», «Архивировать», «Удалить» (`<ConfirmDialog />`).

**Правая колонка — уроки:**
- Список уроков с drag-and-drop (`@dnd-kit/sortable`).
- Кнопка «Добавить урок».
- При сохранении нового порядка вызывается `PATCH /courses/:id/lessons/reorder`.

## Редактор урока

- Поля: заголовок, контент (markdown textarea с предпросмотром).
- **Секция «Видео»:**
  - Список загруженных `LessonVideo` (можно переупорядочивать, переименовывать, удалять).
  - Кнопка «Загрузить видео» — открывает `<MediaUploader resourceType="video" maxSizeMb={500} />`.
- **Секция «Материалы»:**
  - Список файлов с иконкой по `mimeType`.
  - Кнопка «Прикрепить файл» (`resourceType="raw"`, `accept="application/pdf,application/msword,..."`, `maxSizeMb={50}`).

## Загрузка в Cloudinary (`<MediaUploader />`)

Поток:
1. Пользователь выбирает файл; компонент валидирует тип и размер.
2. `POST /api/v1/media/sign` → `{ cloudName, apiKey, timestamp, signature, folder, resourceType, publicId }`.
3. `POST https://api.cloudinary.com/v1_1/{cloudName}/{resourceType}/upload` с `FormData`: `file`, `api_key`, `timestamp`, `signature`, `folder`, опц. `public_id`.
4. Прогресс отображаем (`axios onUploadProgress` или нативный `XMLHttpRequest`).
5. По завершении Cloudinary вернёт `{ public_id, secure_url, duration, bytes, format }`.
6. Шлём на бэк `POST /lessons/:id/videos` (или `/materials`) с этими данными.
7. Инвалидация TanStack Query: `lessons.detail(lessonId)`.

```ts
type SignResponse = {
  cloudName: string; apiKey: string; timestamp: number; signature: string;
  folder: string; resourceType: 'image' | 'video' | 'raw'; publicId?: string;
};

async function uploadToCloudinary(file: File, sign: SignResponse, onProgress: (pct: number) => void) {
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sign.apiKey);
  form.append('timestamp', String(sign.timestamp));
  form.append('signature', sign.signature);
  form.append('folder', sign.folder);
  if (sign.publicId) form.append('public_id', sign.publicId);
  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/${sign.resourceType}/upload`,
    form,
    { onUploadProgress: e => onProgress(Math.round((e.loaded / (e.total ?? 1)) * 100)) },
  );
  return res.data;   // { public_id, secure_url, duration?, bytes, ... }
}
```

## Definition of Done
- [ ] Автор может создать курс, добавить уроки, загрузить видео и pdf-материалы.
- [ ] Drag-and-drop сохраняет порядок уроков.
- [ ] Прогресс загрузки видео виден пользователю.
- [ ] Удаление видео/материала действительно очищает Cloudinary (через бэк).
- [ ] Все ошибки upload'а корректно показываются (toast).
