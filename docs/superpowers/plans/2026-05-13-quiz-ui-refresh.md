# Quiz UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add framer-motion animations, a floating-shapes background layer, and a question count selector (3/5/10/20/100 with Fisher-Yates random selection) to the existing quiz app.

**Architecture:** A new `AnimatedBackground` client component holds the dot grid + 4 independently floating shapes and is imported into `layout.tsx` (server component) so it renders on every page. Page mount animations and quiz answer animations are added directly in each page component using `motion.div`. The question count selector lives entirely in the setup page; the quiz page reads `questionCount` from sessionStorage and applies shuffle+slice before rendering.

**Tech Stack:** Next.js 16 static export, TypeScript strict, shadcn/ui, Tailwind CSS v4, Framer Motion, Supabase JS v2

---

### Task 1: Install framer-motion and create AnimatedBackground component

**Files:**
- Modify: `package.json` (via npm install)
- Create: `src/components/AnimatedBackground.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Install framer-motion**

Run in `c:\Users\Coder\Desktop\Project_Folder\assignment`:
```
npm install framer-motion
```
Expected: package installs without errors, `framer-motion` appears in `package.json` dependencies.

- [ ] **Step 2: Create `src/components/AnimatedBackground.tsx`**

```tsx
'use client'
import { motion } from 'framer-motion'

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.5,
        }}
      />

      {/* Shape 1: circle top-left */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 140, height: 140, top: -40, left: -40, background: '#e5e7eb', opacity: 0.7 }}
        animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Shape 2: rounded rect bottom-right */}
      <motion.div
        className="absolute"
        style={{ width: 110, height: 110, bottom: -30, right: -30, borderRadius: 18, background: '#d1d5db', opacity: 0.6 }}
        animate={{ y: [0, 14, 0], x: [0, -10, 0], rotate: [25, 32, 25] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Shape 3: circle middle-right */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 90, height: 90, top: '40%', right: -20, background: '#f3f4f6', opacity: 0.8 }}
        animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Shape 4: rounded rect middle-left */}
      <motion.div
        className="absolute"
        style={{ width: 70, height: 70, top: '60%', left: -15, borderRadius: 10, background: '#e5e7eb', opacity: 0.6 }}
        animate={{ y: [0, 16, 0], x: [0, -6, 0], rotate: [-15, -22, -15] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
```

- [ ] **Step 3: Import AnimatedBackground into `src/app/layout.tsx`**

Replace the entire file with:
```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "@/components/AnimatedBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quiz Competition",
  description: "Team-based quiz competition website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AnimatedBackground />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify TypeScript and build**

```
npx tsc --noEmit
npm run build
```
Expected: TypeScript 0 errors, all 6 routes prerender successfully.

- [ ] **Step 5: Commit**

```
git add src/components/AnimatedBackground.tsx src/app/layout.tsx package.json package-lock.json
git commit -m "feat: add framer-motion animated background with floating shapes"
```

---

### Task 2: Add page mount animations to password, result, and admin pages

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/result/page.tsx`
- Modify: `src/app/admin/page.tsx`

- [ ] **Step 1: Update `src/app/page.tsx` — wrap outer div in motion.div**

Add `motion` import at top (add to existing import line):
```tsx
import { motion } from 'framer-motion'
```

Replace the outer `<div className="min-h-screen ...">` with:
```tsx
<motion.div
  className="min-h-screen flex items-center justify-center"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
>
```
And close with `</motion.div>`.

- [ ] **Step 2: Update `src/app/result/page.tsx` — wrap outer div in motion.div**

Add `motion` import:
```tsx
import { motion } from 'framer-motion'
```

Replace the outer `<div className="min-h-screen flex flex-col items-center justify-center p-4">` with:
```tsx
<motion.div
  className="min-h-screen flex flex-col items-center justify-center p-4"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
>
```
And close with `</motion.div>`.

- [ ] **Step 3: Update `src/app/admin/page.tsx` — wrap both render paths**

Add `motion` import:
```tsx
import { motion } from 'framer-motion'
```

The admin page has three render paths (password gate, loading, scoreboard). Wrap each top-level `<div className="min-h-screen ...">` with `motion.div` using the same props:
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, ease: 'easeOut' }}
```
Apply to the password gate div, the loading div, the error div, and the scoreboard div — all four top-level returns.

- [ ] **Step 4: Verify TypeScript and build**

```
npx tsc --noEmit
npm run build
```
Expected: 0 errors, all 6 routes build.

- [ ] **Step 5: Commit**

```
git add src/app/page.tsx src/app/result/page.tsx src/app/admin/page.tsx
git commit -m "feat: add page mount fade-up animation to password, result, and admin pages"
```

---

### Task 3: Add question count selector to setup page

**Files:**
- Modify: `src/app/setup/page.tsx`

- [ ] **Step 1: Replace `src/app/setup/page.tsx` with updated version**

Full file content (adds `questionCount` state, count selector UI, saves to sessionStorage, and adds mount animation):

```tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import type { Team } from '@/lib/types'

const COUNT_OPTIONS: { value: number; label: string }[] = [
  { value: 3,   label: 'Quick' },
  { value: 5,   label: 'Short' },
  { value: 10,  label: 'Standard' },
  { value: 20,  label: 'Long' },
  { value: 100, label: 'Full' },
]

export default function SetupPage() {
  const [isChecking, setIsChecking] = useState(true)
  const [playerName, setPlayerName] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [questionCount, setQuestionCount] = useState<number>(10)
  const [teams, setTeams] = useState<Team[]>([])
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [teamsError, setTeamsError] = useState('')
  const [validationError, setValidationError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (sessionStorage.getItem('quizAuthenticated') !== 'true') {
      router.replace('/')
      return
    }
    setIsChecking(false)

    async function fetchTeams() {
      const { data, error } = await supabase.from('teams').select('*').order('name')
      if (error) {
        setTeamsError('Failed to load teams. Please refresh and try again.')
      } else {
        setTeams(data ?? [])
      }
      setLoadingTeams(false)
    }

    fetchTeams()
  }, [router])

  if (isChecking) return null

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmedName = playerName.trim()

    if (!trimmedName || !selectedTeamId) {
      setValidationError('Please enter your name and select a team.')
      return
    }

    const team = teams.find((t) => t.id === selectedTeamId)
    if (!team) {
      setValidationError('Selected team is invalid. Please try again.')
      return
    }

    sessionStorage.setItem('playerName', trimmedName)
    sessionStorage.setItem('teamId', team.id)
    sessionStorage.setItem('teamName', team.name)
    sessionStorage.setItem('questionCount', String(questionCount))
    router.push('/quiz')
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Player Setup</CardTitle>
          <CardDescription>Enter your details to start the quiz</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="playerName">Your Name</Label>
              <Input
                id="playerName"
                type="text"
                autoComplete="name"
                placeholder="Enter your name"
                maxLength={50}
                aria-describedby={validationError ? 'validation-error' : undefined}
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value)
                  setValidationError('')
                }}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="team">Your Team</Label>
              {loadingTeams ? (
                <p className="text-sm text-muted-foreground">Loading teams...</p>
              ) : teamsError ? (
                <p role="alert" className="text-sm text-destructive">{teamsError}</p>
              ) : (
                <select
                  id="team"
                  value={selectedTeamId}
                  aria-describedby={validationError ? 'validation-error' : undefined}
                  onChange={(e) => {
                    setSelectedTeamId(e.target.value)
                    setValidationError('')
                  }}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                >
                  <option value="">Select a team</option>
                  {teams.length === 0 ? (
                    <option value="" disabled>No teams available — contact the administrator</option>
                  ) : (
                    teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Number of Questions</Label>
              <div className="flex gap-2 flex-wrap">
                {COUNT_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setQuestionCount(value)}
                    className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 flex-1 min-w-[52px] transition-colors ${
                      questionCount === value
                        ? 'border-2 border-foreground bg-muted font-bold'
                        : 'border border-border bg-background hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-base font-bold leading-none">{value}</span>
                    <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {validationError && (
              <p id="validation-error" role="alert" className="text-sm text-destructive">{validationError}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loadingTeams || !!teamsError}
            >
              Start Quiz
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

- [ ] **Step 2: Verify TypeScript and build**

```
npx tsc --noEmit
npm run build
```
Expected: 0 errors, `/setup` route builds.

- [ ] **Step 3: Commit**

```
git add src/app/setup/page.tsx
git commit -m "feat: add question count selector to setup page (3/5/10/20/100)"
```

---

### Task 4: Update quiz page — random selection + animations + progress bar at bottom

**Files:**
- Modify: `src/app/quiz/page.tsx`

- [ ] **Step 1: Replace `src/app/quiz/page.tsx` with the full updated version**

```tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase'
import type { Question, AnswerChoice } from '@/lib/types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const answerContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const answerItemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
}

export default function QuizPage() {
  const [isChecking, setIsChecking] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(AnswerChoice | null)[]>([])
  const router = useRouter()

  const handleAnswer = useCallback(
    (choice: AnswerChoice) => {
      if (currentIndex < questions.length - 1) {
        setAnswers((prev) => {
          const updated = [...prev]
          updated[currentIndex] = choice
          return updated
        })
        setCurrentIndex((i) => i + 1)
      } else {
        setAnswers((prev) => {
          const updated = [...prev]
          updated[currentIndex] = choice
          const score = updated.reduce<number>((acc, ans, idx) => {
            return acc + (ans === questions[idx].correct_answer ? 1 : 0)
          }, 0)
          sessionStorage.setItem('quizScore', String(score))
          sessionStorage.setItem('totalQuestions', String(questions.length))
          return updated
        })
        router.replace('/result')
      }
    },
    [currentIndex, questions, router],
  )

  useEffect(() => {
    const authenticated = sessionStorage.getItem('quizAuthenticated') === 'true'
    const playerName = sessionStorage.getItem('playerName')
    const teamId = sessionStorage.getItem('teamId')

    if (!authenticated || !playerName || !teamId) {
      router.replace('/')
      return
    }

    if (sessionStorage.getItem('quizScore') !== null) {
      router.replace('/result')
      return
    }

    setIsChecking(false)

    const rawCount = Number(sessionStorage.getItem('questionCount') ?? '10')
    const requestedCount = isNaN(rawCount) || rawCount <= 0 ? 10 : rawCount

    async function fetchQuestions() {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('order_num')

      if (error) {
        setLoadError('Failed to load questions. Please refresh and try again.')
      } else {
        const qs = data ?? []
        const selected = requestedCount >= qs.length
          ? qs
          : shuffle(qs).slice(0, requestedCount)
        setQuestions(selected)
        setAnswers(new Array<AnswerChoice | null>(selected.length).fill(null))
      }
      setLoading(false)
    }

    fetchQuestions()
  }, [router])

  if (isChecking) return null

  if (loading) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <p className="text-muted-foreground">Loading questions...</p>
      </motion.div>
    )
  }

  if (loadError) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <p role="alert" className="text-destructive">{loadError}</p>
      </motion.div>
    )
  }

  if (questions.length === 0) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <p className="text-muted-foreground">No questions available.</p>
      </motion.div>
    )
  }

  const question = questions[currentIndex]
  const total = questions.length
  const progressValue = ((currentIndex + 1) / total) * 100
  const isAnswered = answers[currentIndex] !== null

  const optionLabels: { key: AnswerChoice; label: string; text: string }[] = [
    { key: 'a', label: 'A', text: question.option_a },
    { key: 'b', label: 'B', text: question.option_b },
    { key: 'c', label: 'C', text: question.option_c },
    { key: 'd', label: 'D', text: question.option_d },
  ]

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className="w-full max-w-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Question {currentIndex + 1} of {total}</span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <p className="text-xl font-semibold leading-snug">{question.question_text}</p>

          <motion.div
            key={currentIndex}
            className="flex flex-col gap-3"
            variants={answerContainerVariants}
            initial="hidden"
            animate="show"
          >
            {optionLabels.map(({ key, label, text }) => (
              <motion.div
                key={key}
                variants={answerItemVariants}
                whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                whileTap={{ scale: 0.98, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
              >
                <Button
                  variant={answers[currentIndex] === key ? 'default' : 'outline'}
                  className="w-full justify-start text-left whitespace-normal h-auto py-3"
                  onClick={() => handleAnswer(key)}
                  disabled={isAnswered && answers[currentIndex] !== key}
                >
                  <span className="font-semibold mr-2">{label}.</span>
                  <span>{text}</span>
                </Button>
              </motion.div>
            ))}
          </motion.div>

          <Progress
            value={progressValue}
            aria-label={`Quiz progress: question ${currentIndex + 1} of ${total}`}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

- [ ] **Step 2: Verify TypeScript and build**

```
npx tsc --noEmit
npm run build
```
Expected: 0 errors, all 6 routes (`/`, `/setup`, `/quiz`, `/result`, `/admin`, `/_not-found`) prerender successfully.

- [ ] **Step 3: Commit and push**

```
git add src/app/quiz/page.tsx
git commit -m "feat: add random question selection, staggered animations, and progress bar to quiz page"
git push origin main
```
Expected: push succeeds, GitHub Actions deploys to `https://special-srit.github.io/assignment/`.
