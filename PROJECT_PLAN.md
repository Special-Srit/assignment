# Quiz Competition Website — Project Plan

## Overview

A team-based quiz competition website hosted on **GitHub Pages**.
Players enter a password, register their name + department, answer multiple-choice questions, and their individual score is saved and rolled up into a team total.
An admin-only scoreboard shows individual and team rankings.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | **Next.js** (static export) | Works on GitHub Pages; best shadcn support |
| UI Components | **shadcn/ui** | Pre-built accessible components |
| Styling | **Tailwind CSS** | Bundled with shadcn |
| Database | **Supabase** | Free tier, Postgres, easy JS SDK |
| Hosting | **GitHub Pages** | Free static hosting via GitHub Actions |

> **Important:** Next.js must use `output: 'export'` mode for GitHub Pages.
> API routes are NOT available — all Supabase calls are client-side (use anon key + RLS).

---

## Environment Variables

Create a `.env.local` file (never commit this):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_QUIZ_PASSWORD=your-quiz-password-here
NEXT_PUBLIC_ADMIN_PASSWORD=your-admin-password-here
```

For GitHub Pages deployment, add these as **GitHub Actions Secrets** in:
`Settings → Secrets and variables → Actions`

---

## Supabase Database Schema

Run this SQL in your Supabase project → **SQL Editor**:

```sql
-- Teams / Departments table
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

-- Questions table (editable via Supabase dashboard)
create table questions (
  id uuid primary key default gen_random_uuid(),
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer char(1) not null check (correct_answer in ('a','b','c','d')),
  order_num int not null default 0,
  created_at timestamptz default now()
);

-- Individual player scores
create table scores (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  team_id uuid references teams(id),
  score int not null default 0,
  total_questions int not null,
  created_at timestamptz default now()
);

-- View: team totals (auto-calculated)
create view team_scores as
  select
    t.id as team_id,
    t.name as team_name,
    count(s.id) as player_count,
    coalesce(sum(s.score), 0) as total_score
  from teams t
  left join scores s on s.team_id = t.id
  group by t.id, t.name
  order by total_score desc;
```

Enable **Row Level Security (RLS)** and add these policies:

```sql
-- Allow anyone to read teams and questions (needed for the quiz)
alter table teams enable row level security;
alter table questions enable row level security;
alter table scores enable row level security;

create policy "Public read teams" on teams for select using (true);
create policy "Public read questions" on questions for select using (true);
create policy "Public insert scores" on scores for insert with check (true);
create policy "Admin read scores" on scores for select using (true);
```

---

## Page Structure

| Route | Description | Access |
|---|---|---|
| `/` | Password entry — quiz password required | Public |
| `/setup` | Enter player name + pick team from Supabase | After quiz password |
| `/quiz` | Multiple choice questions (from Supabase) | After setup |
| `/result` | Show final score, save to Supabase | After quiz |
| `/admin` | Admin password → individual + team scoreboard | Admin password |

---

## App Flow

```
[/] Enter quiz password
       ↓ correct
[/setup] Enter name + select department
       ↓
[/quiz] Answer questions one by one (progress bar)
       ↓ all done
[/result] See score → saved to Supabase → share/exit
       
[/admin] Separate admin password → view scoreboard
         - Individual rankings (name, team, score)
         - Team rankings (team name, total score, player count)
```

Session state (name, team, answers) is kept in `sessionStorage` between pages.

---

## Project File Structure

```
assignment/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions deploy to Pages
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            ← Password entry (/)
│   │   ├── setup/
│   │   │   └── page.tsx        ← Name + team picker
│   │   ├── quiz/
│   │   │   └── page.tsx        ← Quiz questions
│   │   ├── result/
│   │   │   └── page.tsx        ← Score result
│   │   └── admin/
│   │       └── page.tsx        ← Admin scoreboard
│   ├── components/
│   │   └── ui/                 ← shadcn components live here
│   └── lib/
│       ├── supabase.ts         ← Supabase client setup
│       └── types.ts            ← TypeScript types for DB tables
├── .env.local                  ← Local secrets (DO NOT COMMIT)
├── .env.example                ← Template for env vars
├── next.config.ts              ← output: 'export', basePath
└── package.json
```

---

## What Still Needs To Be Done

- [ ] Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir`
- [ ] Install shadcn: `npx shadcn@latest init`
- [ ] Install shadcn components: `npx shadcn@latest add button card input label progress badge table`
- [ ] Install Supabase: `npm install @supabase/supabase-js`
- [ ] Configure `next.config.ts` for static export + GitHub Pages basePath
- [ ] Create `src/lib/supabase.ts`
- [ ] Create `src/lib/types.ts`
- [ ] Build all 5 pages (password, setup, quiz, result, admin)
- [ ] Create `.github/workflows/deploy.yml` for GitHub Actions
- [ ] Set up Supabase project and run the SQL schema above
- [ ] Add secrets to GitHub repo settings
- [ ] Set GitHub Pages source to `gh-pages` branch (or `Actions`)

---

## Supabase Setup Steps (Manual)

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy `Project URL` and `anon public` key from **Settings → API**
3. Go to **SQL Editor** → run the schema SQL above
4. Go to **Table Editor** → add your teams (e.g. ITSW, Design, etc.)
5. Add some questions in the `questions` table

---

## GitHub Pages Setup Steps (Manual)

1. Push this project to a GitHub repo (e.g. `quiz-competition`)
2. Go to repo **Settings → Pages → Source → GitHub Actions**
3. Add the 4 environment variables as **Actions Secrets**
4. Push to `main` → GitHub Actions will build and deploy automatically
5. Site will be live at: `https://your-username.github.io/quiz-competition/`

> Update `basePath` in `next.config.ts` to match your repo name.

---

## Notes

- Questions and teams are fully managed via the Supabase dashboard — no code changes needed to add/edit them.
- The quiz password and admin password are set via environment variables — change them anytime without touching the code.
- Each player can only submit one score per session (enforced by sessionStorage clearing after result).
- The admin scoreboard is protected by a separate password (`NEXT_PUBLIC_ADMIN_PASSWORD`).
