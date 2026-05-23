# The Common Room — Web App

A web companion to The Common Room in-person workshops. Helps participants reflect on what matters most, explore ADOPT themes, generate AI-powered Points of Reflection, and keep a personal note.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Database / Auth | Supabase (PostgreSQL + RLS) |
| AI | Anthropic Claude (via Supabase Edge Function) |
| Data fetching | TanStack React Query |
| Charts (admin) | Recharts |
| Typeface | Relative (Book, Medium, Bold, Italic) |

---

## Project structure

```
tcr-website/
├── app/
│   ├── (auth pages)       # /, /sign-in, /register
│   ├── dashboard/         # My Purpose — selected themes
│   ├── adopt/             # ADOPT theme browser + selection
│   ├── reflections/       # AI-generated Points of Reflection
│   ├── notes/             # Personal note (draft + submit)
│   ├── profile/           # Account details + sign out
│   └── admin/             # Admin dashboard (is_admin only)
│       ├── page.tsx       # Overview stats + charts
│       ├── users/         # User table
│       ├── themes/        # Theme analytics
│       └── export/        # CSV data export
├── app/api/admin/         # Server-side admin API routes
├── components/
│   ├── AppShell.tsx       # Sidebar nav (desktop + mobile hamburger)
│   ├── ThemeCard.tsx
│   ├── ReflectionCard.tsx
│   ├── ThemeInfoModal.tsx
│   └── Providers.tsx      # React Query provider
├── lib/
│   ├── supabase.ts        # Browser Supabase client
│   ├── supabase-server.ts # Server Supabase client (SSR cookies)
│   ├── supabase-admin.ts  # Service role client (admin API only)
│   ├── admin-guard.ts     # Shared admin auth check
│   ├── api.ts             # App data fetching functions
│   └── database.types.ts  # Generated Supabase types
├── constants/
│   └── theme.ts           # Brand colours + typography tokens
├── public/
│   ├── logo.png           # Horizontal wordmark
│   ├── icon.png           # Circle mark (favicon + apple-touch-icon)
│   ├── og-image.png       # Open Graph banner image
│   └── fonts/             # Relative typeface (OTF)
├── proxy.ts               # Auth proxy (replaces middleware in Next.js 16+)
└── next.config.ts         # Security headers
```

---

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create `.env.local` in this directory:

```bash
# Public — safe to expose in the browser
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-side only — NEVER prefix with NEXT_PUBLIC_
# Supabase dashboard → Settings → API → service_role key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database migration

The app requires an `is_admin` column on the `profiles` table. Run in the Supabase SQL editor:

```sql
alter table profiles
  add column if not exists is_admin boolean not null default false;
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Admin dashboard

The admin dashboard at `/admin` is only accessible to users with `is_admin = true` in their profile.

To grant admin access, run in the Supabase SQL editor:

```sql
update profiles
set is_admin = true
where id = (select id from auth.users where email = 'your@email.com');
```

The admin area provides:
- **Overview** — registration trends, engagement stats
- **Users** — searchable/sortable table of all users
- **Themes** — theme popularity charts by category
- **Export** — date-filtered CSV downloads (users, selections, reflections, notes)

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import the repo into Vercel
3. Add the three environment variables from `.env.local`
4. Deploy — Vercel auto-detects Next.js

### Environment variables required in production

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role |

### Supabase Edge Function

The `generate-reflections` Edge Function must be deployed separately from the `tcr-app` directory:

```bash
cd ../tcr-app
supabase functions deploy generate-reflections
```

The `ANTHROPIC_API_KEY` secret must be set in the Supabase dashboard under Edge Functions → Secrets.

---

## Brand

- **Typeface:** Relative (Book / Medium / Bold / Italic) — loaded from `/public/fonts/`
- **Headings:** Georgia serif
- **Colours:** defined in `constants/theme.ts` and `app/globals.css`
- **Raw brand assets:** `../brand_assets/`

---

## Related

- `../tcr-app/` — React Native / Expo mobile app (iOS + Android)
- `../docs/` — Client brief, wireframes, style guide (read-only reference)
- `../CLAUDE.md` — Full project context for AI-assisted development
