# Промпт для Claude — Дизайн UI researchers

> Скопируй блок ниже и отправь Claude (Opus / Sonnet) в Anthropic Console / Claude.ai. Промпт описывает **только визуальный дизайн** и интерактивные состояния — не пишет код фичей. Если хочешь сразу прототип в виде React + Tailwind, добавь финальный пункт «Render as a single-file React component with Tailwind classes».

---

## System / Role

You are a senior product designer specializing in clean, modern SaaS web apps. You design with Tailwind CSS conventions and the shadcn/ui component library. You must produce a complete UI design specification (and, on request, a high-fidelity HTML/React mockup) for the project below.

## Product context

**Name:** researchers
**One-liner:** A minimalist learning platform where authors manually upload courses (video + files + text lessons) and learners get access via a subscription that is granted manually by an admin.
**Important:** This product intentionally does NOT include any AI features, generation, RAG, or chatbots. The UI must never imply AI capabilities. No "Generate", "AI", "Smart", or sparkle/magic icons anywhere.

## Users and roles

- **Subscriber** — browses the catalog, watches lessons after admin grants a subscription.
- **Author** — creates courses, uploads videos and files, edits lesson text.
- **Admin** — manages users, roles, and subscriptions.

## Tech & visual constraints

- Stack: React + Vite + TypeScript + Tailwind CSS + shadcn/ui.
- Two themes: light and dark, both first-class.
- Typography: Inter for UI, JetBrains Mono for code blocks.
- Border radius scale: `rounded-md` (8px), `rounded-xl` (12px), `rounded-2xl` (16px). Cards = `rounded-2xl`.
- Spacing scale: Tailwind defaults (4px grid).
- Icons: lucide-react. No emoji.
- Accent color: a calm, scholarly blue (`hsl(221, 83%, 53%)` in light, `hsl(217, 91%, 60%)` in dark). Suggest an alternate option (deep emerald) but recommend blue as default.
- Use subtle gradients and depth, never neon. Shadows: `shadow-sm` for cards, `shadow-lg` only for modals/popovers.
- Motion: 150–250 ms ease-out for hovers, 250–350 ms for modals; respect `prefers-reduced-motion`.
- Responsive breakpoints: 320 / 640 / 768 / 1024 / 1280 / 1536 px. Mobile-first.
- Accessibility: WCAG AA contrast, focus-visible ring (`ring-2 ring-primary/50`), keyboard navigation for player, sidebars, dialogs.

## Information architecture & screens

Design the following screens. For each screen produce:
1. A short **goal** statement.
2. A **wireframe-style description** (top-to-bottom, left-to-right) listing regions, components, and copy examples.
3. **States**: default, loading (skeletons), empty, error, locked-by-paywall (where relevant), success toast.
4. **Mobile** notes (what collapses, what becomes a sheet/drawer).
5. The specific **shadcn/ui components** to use.

### 1. Auth — Login & Register
Centered narrow card on a soft brand-tinted background. Left side optional illustration panel (>= lg). Inputs: email, password, full name (register). Show subtle "Why researchers?" footer with 3 bullets (no AI claims, just "Hand-crafted courses", "Direct access to authors", "Track your progress"). Below the card: small theme toggle.

### 2. App shell (AppLayout)
- Top header: logo "researchers" (wordmark + simple bookmark/book icon), global search (catalog), theme toggle, user menu (avatar + dropdown with Profile, Logout, role badge).
- Left sidebar (collapsible to icons on `md`, becomes a `<Sheet>` drawer on `<md`). Items vary by role (see TZ).
- Main content area with sticky `<PageHeader>` block (title + subtitle + action slot).

### 3. Catalog `/catalog`
- PageHeader: "Catalog" + count of courses + search input.
- Filters row: sort (Newest / A-Z), category chips (placeholder — courses currently uncategorized; show them subtly disabled).
- Grid of `CourseCard`s (1/2/3/4 columns by breakpoint).
- Card anatomy: 16:9 cover with subtle gradient overlay, course title (line-clamp-2, semibold), author row (avatar 24px + name), bottom row with lessons count badge and duration estimate, hover → lift + slight scale (1.01).
- Skeleton: 8 cards.
- Empty: large soft illustration of an empty bookshelf + heading "No courses yet" + subtitle.

### 4. Course detail `/courses/:id`
- Two-column hero on `lg+`:
  - Left: cover 16:9, rounded-2xl, with status badge overlay (`Draft`/`Published`/`Archived`, only for owner/admin).
  - Right: title (text-3xl semibold), author chip, description, meta row (X lessons · created date), CTA stack.
- Below hero: tabs `Overview` / `Lessons` (defaults to Lessons).
- Lessons list — numbered rows with:
  - Index circle.
  - Title + duration.
  - Right slot: `Lock` icon (paywalled), `CheckCircle` (completed), `Play` (current/next).
  - Click animates a small horizontal slide.
- Sticky right rail on `xl+` with progress percentage and "Continue learning" button.
- **Paywall state** (subscriber without subscription): inline banner above lessons with a lock icon, headline "Subscription required", body "Reach out to your admin to unlock this course", primary button "Contact admin" (opens a Dialog with admin email placeholder), secondary "Back to catalog".

### 5. Lesson Player `/courses/:cid/lessons/:lid`
- Two-column on `lg+`: left primary content (video + transcript + materials), right rail with lesson list.
- Video player: rounded-2xl, dark background, large play button overlay, custom progress bar in accent color, time, volume, fullscreen, playback rate. Keyboard: Space / arrows / F.
- Below video: lesson title (text-2xl), meta (lesson X of Y · duration), markdown content block with proper typography (`prose prose-lg`).
- Materials section: each item is a row card with file-type icon (PDF/DOC/ZIP), filename, size, "Download" button (ghost variant + Download icon).
- Footer nav: Previous / Next pill buttons + "Mark as completed" primary button. After mark — turns into a green outline "Completed ✓" with subtle confetti micro-animation (very tasteful, optional, respect reduced motion).
- Sidebar: same as Course detail lessons list, active item has a left accent bar.
- Mobile: sidebar becomes a `<Sheet>` triggered by a button in the header; player takes full width.
- **Paywall state**: instead of the player, render a beautiful locked illustration + "Subscription required" message + CTAs as in Course Detail.

### 6. Creator Studio
- `/studio` — table of own courses (columns: cover thumb, title, status badge, lessons, updated, actions menu). Empty state has a primary CTA "Create your first course" centered with simple line illustration.
- `/studio/courses/:id` — split:
  - Left panel: course metadata form (title, description, cover uploader with drag&drop dashed area, status select, publish/archive/delete actions).
  - Right panel: lessons list with drag handles (`GripVertical` icon), inline rename, "Add lesson" button at top, contextual action menu per lesson.
- `/studio/courses/:id/lessons/:lid` — focused editor:
  - Top: breadcrumb back to course.
  - Title input (large, borderless h1 style).
  - Markdown content textarea with preview tab toggle.
  - **Videos section**: cards stacked vertically. Each card: thumbnail (Cloudinary auto-poster), title editable, duration badge, drag handle, kebab menu. Below cards — "Upload video" button opens an inline uploader with file picker / drag-and-drop, file constraints text ("MP4, up to 500 MB"), a progress bar that turns the card from gray to filled accent as upload proceeds.
  - **Materials section**: same idea but smaller rows, accept PDF / DOC / DOCX, max 50 MB. Show file-type colored icon.

### 7. Admin Panel
- `/admin/users` — data table with avatar, name, email, role badge (color-coded: Admin=violet, Author=blue, Subscriber=gray), subscription column ("Active until 2026-08-12" or "—"), actions menu (Change role / Grant subscription / Delete).
- `/admin/subscriptions` — data table with user chip, plan badge, status pill (Active=green, Expired=amber, Revoked=red), starts/expires, granted by, actions (Extend / Revoke).
- Both tables: dense layout, sticky header, filter chips above (status / role), search input top-right, pagination footer.
- All destructive/admin actions are `Dialog`-confirmed with a clear summary line.

### 8. Profile `/profile`
- Tabs: Profile / Security / Subscription / Progress.
- Profile tab: avatar uploader (circular, with hover overlay "Change"), full name, email (read-only with copy button), save button.
- Security: change password form, password strength meter.
- Subscription: hero card with plan name, big remaining-days counter (e.g. "23 days left"), expiration date, plus a small history table below.
- Progress: list of courses in progress, each row with mini cover, title, % bar, "Continue" button. Empty state with friendly illustration.

### 9. 403 Forbidden / 404 Not Found
Centered minimalistic illustrations (no humanoids — abstract shapes / books), large number, helpful subtitle, primary button "Back to catalog" or "Sign in".

## Component library (must define visual specs for each)

- `<PageHeader>` (title, subtitle, breadcrumbs, action slot).
- `<CourseCard>`, `<LessonRow>`, `<MaterialRow>`, `<UserRow>`, `<SubscriptionRow>`.
- `<RoleBadge>`, `<StatusBadge>`, `<PlanBadge>`.
- `<EmptyState>`, `<ErrorState>`, `<LoadingState>` (skeleton variants per page).
- `<PaywallBanner>` (inline) and `<PaywallScreen>` (full-page).
- `<MediaUploader>` (single file, drag&drop, progress, success / failure states).
- `<ConfirmDialog>` with destructive variant.
- `<UserMenu>` and `<MobileNavSheet>`.

## Microcopy guidelines

- Tone: warm, focused, no marketing fluff, no AI buzzwords.
- Use Russian as primary language for end-user copy (the product is launching for a Russian-speaking audience), but keep code identifiers and component names in English. Provide RU translations for: page titles, CTAs, status badges, toasts, empty/error states.
- Russian style: avoid bureaucratic phrasing; prefer short, direct sentences. Use «вы» (capitalized only in formal address; lowercase «вы» is acceptable here).

## Deliverables

For each screen, produce:
- Layout sketch in ASCII or a description in markdown.
- A short list of Tailwind classes for **the most important** components (card, button, badge, table row).
- A copy table: Russian phrase → context.
- The light and dark color tokens that apply.

If asked at the end, produce a **single-file React + Tailwind preview** (`PreviewApp.tsx`) that renders the Catalog, Course Detail (with paywall), Lesson Player and Studio editor in a tabbed switcher so the user can browse all designs in one Vite playground. Do **not** include real network calls — mock the data inline.

## Do / Don't

**Do**
- Lean on shadcn/ui defaults; customize only when necessary.
- Use proper semantic HTML.
- Reuse the same `CourseCard` and `LessonRow` everywhere.
- Add tasteful, low-saturation gradients for hero sections.

**Don't**
- Don't include any chatbot, AI assistant, "Generate with AI" buttons, "Summarize", "Quiz me", or sparkle/magic icons.
- Don't show pricing screens, Stripe forms, or credit cards.
- Don't use rounded-full on big cards — only on avatars and pills.
- Don't propose dark gradients with neon — keep it scholarly.

---

## Optional follow-ups you can ask Claude

1. "Now render the full Lesson Player screen as a single-file React + Tailwind component with mock data."
2. "Adapt the design palette for an emerald-green brand alternative."
3. "Show the mobile layouts for Catalog, Course Detail, and Lesson Player as ASCII frames."
4. "Generate Tailwind class strings for the `CourseCard` component in both light and dark."
