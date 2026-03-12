# CraftCV — AI-Powered Resume Builder

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase" />
  <img src="https://img.shields.io/badge/Groq-AI-orange?style=for-the-badge" />
</div>

<br />

> **CraftCV** is a modern, AI-powered resume builder that helps job seekers create beautiful, professional resumes in minutes — not hours. Live preview, multiple templates, cloud save, and PDF export.

---

## 🚀 Live Demo

> Coming soon — deploy instructions below.

---

## ✨ Features Implemented

### 🏠 Landing Page
- Animated hero section with gradient typography
- Features, Templates, Pricing, and CTA sections
- Responsive glassmorphic Navbar with scroll-aware styling
- Auth-aware Navbar: shows avatar + dropdown when logged in

### 🔐 Authentication (Supabase)
- Email + Password sign up / sign in
- Google OAuth (one-click sign in)
- Route protection via Next.js middleware (`/dashboard` requires auth)
- Auto-redirect after login / signup
- Avatar dropdown with **Sign Out** from any page

### 📝 Resume Builder
- **Live dual-pane layout** — form on the left, real-time PDF preview on the right
- 6 form sections: Personal Info, Summary, Experience, Education, Skills, Projects
- **2 professional templates**: Minimalist & Executive (Creative template — Premium locked)
- Inline click-to-edit **resume title**
- **Save to Supabase** — smart insert/update (no duplicates)
- **Export to PDF** via `html2canvas` + `jsPDF`
- New resumes start blank; existing resumes load with full saved data

### 📊 Dashboard
- Personalized greeting with user name
- Resume stats cards (total, per template)
- Resume grid with last-edited time and template badge
- One-click **Edit** → opens builder with data pre-loaded
- **Delete** resume with confirmation
- Create New Resume card always visible

### 🗄️ Database (Supabase PostgreSQL)
- `profiles` table — auto-created on signup via trigger
- `resumes` table — stores title, template, full JSON data, timestamps
- **Row Level Security (RLS)** — users can only access their own resumes
- Auto `updated_at` trigger on every save

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Vanilla CSS Modules (no Tailwind) |
| **Database & Auth** | [Supabase](https://supabase.com) (PostgreSQL + GoTrue) |
| **AI** | [Groq](https://groq.com) (via `GROQ_API_KEY`) |
| **PDF Export** | `html2canvas` + `jsPDF` |
| **Fonts** | Google Fonts — Outfit, Inter |
| **Deployment** | Vercel (recommended) |

---

## 📦 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Subharjun/Resume-builder-CraftCV.git
cd Resume-builder-CraftCV
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase — get these from supabase.com/dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Groq AI — get from console.groq.com
GROQ_API_KEY=your-groq-api-key-here
```

### 4. Set Up Supabase Database

In your Supabase SQL editor, run the following migration:

```sql
-- Profiles table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Resumes table
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Untitled Resume',
  template text not null default 'minimalist',
  data jsonb not null default '{}',
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.resumes enable row level security;

-- RLS Policies
create policy "Users can manage own profile" on public.profiles for all using (auth.uid() = id);
create policy "Users can manage own resumes" on public.resumes for all using (auth.uid() = user_id);

-- Auto-update timestamp trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger on_resume_updated
  before update on public.resumes
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles(id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 5. Enable Google OAuth (Optional)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → **Authentication → Providers → Google**
2. Toggle **Enable**
3. Add your Google Client ID and Client Secret from [Google Cloud Console](https://console.cloud.google.com)
4. Set the Authorized Redirect URI in Google Cloud Console to:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```

---

## 🧑‍💻 Development Commands

```bash
# Start development server (with Turbopack)
npm run dev

# Type-check without building
npx tsc --noEmit

# Build for production
npm run build

# Start production server (after build)
npm run start

# Lint the codebase
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── callback/       # OAuth callback handler
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page
│   ├── builder/            # Resume builder (BuilderPage.tsx + page.tsx wrapper)
│   ├── dashboard/          # User dashboard
│   └── layout.tsx          # Root layout
├── components/
│   ├── builder/
│   │   ├── sections/       # Form sections (Personal, Summary, Experience, etc.)
│   │   └── templates/      # Resume templates (Minimalist, Executive)
│   ├── layout/             # Navbar, Footer
│   └── sections/           # Landing page sections (Hero, Features, etc.)
├── hooks/
│   └── useResumeData.ts    # Resume state management hook
├── lib/
│   └── supabase/
│       ├── client.ts       # Browser Supabase client
│       └── server.ts       # Server-side Supabase client
├── types/
│   └── resume.ts           # TypeScript types
└── middleware.ts            # Route protection
```

---

## 🚀 Deployment (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repository
3. Add the following **Environment Variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROQ_API_KEY`
4. Click **Deploy**

For Google OAuth in production, add your Vercel URL to:
- **Google Cloud Console** → Authorized JavaScript origins
- **Supabase** → Authentication → URL Configuration → Site URL

---

## 📝 Assumptions Made

1. **No server-side PDF generation** — PDF export uses client-side `html2canvas` + `jsPDF` which captures the live preview as rendered in the browser. For pixel-perfect output, a headless browser solution (e.g., Puppeteer) would be recommended in production.

2. **Resume data stored as JSONB** — The entire resume is stored as a single JSON blob in Supabase. This makes schema changes easy but means you can't query individual fields (e.g., "find all resumes mentioning React") without JSON path operators.

3. **Single resume per save** — Each "Save" call upserts to the same `resumes` row. Users can create multiple distinct resumes by clicking "New Resume" from the dashboard.

4. **Free tier Supabase** — The app is built targeting Supabase's free tier. Row limits and storage are within free tier bounds for typical usage.

5. **Google OAuth requires manual setup** — The app ships with the callback route configured, but enabling the Google provider in Supabase dashboard requires user action (Client ID + Secret from Google Cloud Console).

6. **Groq API for AI features** — The `GROQ_API_KEY` environment variable is set up for AI-powered summary and suggestion features. If not configured, the builder still works fully — AI features will be disabled/hidden.

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/Subharjun">Subharjun</a>
</div>
