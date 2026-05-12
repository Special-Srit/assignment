# Quiz UI Refresh — Design Spec
Date: 2026-05-13

## Overview

Polish the existing quiz competition website (Next.js static export, shadcn/ui, white/monochrome theme) with:
1. Decorative background layer (dot grid + floating filled shapes) on every page
2. Framer Motion animations (mount fade-up, button hover/press)
3. Question count selector on the setup page (3/5/10/20/100)
4. Random question selection in the quiz page when count < 100

No visual theme change — stays white/monochrome/shadcn.

---

## 1. Dependencies

Install `framer-motion`:
```
npm install framer-motion
```

---

## 2. Background Layer (shared, all pages)

### Implementation
Add a fixed, non-interactive background layer to `src/app/layout.tsx` — rendered inside `<body>` before `{children}`, `pointer-events: none`, `z-index: -1`.

### Dot Grid
```css
background-image: radial-gradient(#d1d5db 1px, transparent 1px);
background-size: 20px 20px;
opacity: 0.5;
```
Applied to a `position: fixed; inset: 0` div.

### Floating Shapes
Four shapes rendered inside the same fixed layer. Each is a filled `div` with `position: absolute`, partially off-screen, `pointer-events: none`.

| Shape | Size | Position | Border-radius | Color | Opacity |
|---|---|---|---|---|---|
| Circle | 140×140px | top-left (−40px, −40px) | 50% | `#e5e7eb` | 0.7 |
| Rounded rect | 110×110px | bottom-right (−30px, −30px) | 18px, rotated 25° | `#d1d5db` | 0.6 |
| Circle | 90×90px | middle-right (−20px, 40%) | 50% | `#f3f4f6` | 0.8 |
| Rounded rect | 70×70px | middle-left (−15px, 60%) | 10px, rotated −15° | `#e5e7eb` | 0.6 |

All shapes use `pointer-events: none` and `user-select: none`.

### Shape Float Animation
Each shape floats independently using a CSS keyframe animation — slow, organic, like drifting in water. Use `motion.div` from Framer Motion with `animate` cycling between two Y/X/rotation positions on an infinite loop.

Each shape gets a slightly different duration and starting phase so they don't move in sync:

| Shape | Duration | Y range | X range | Rotation drift |
|---|---|---|---|---|
| Circle top-left | 8s | 0 → −18px | 0 → 10px | none |
| Rect bottom-right | 11s | 0 → 14px | 0 → −10px | 25° → 32° |
| Circle middle-right | 9s | 0 → −12px | 0 → 8px | none |
| Rect middle-left | 13s | 0 → 16px | 0 → −6px | −15° → −22° |

Animation config per shape:
```ts
animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
```
`ease: 'easeInOut'` gives the slow-in / slow-out feel of floating in water. No abrupt direction changes.

---

## 3. Framer Motion Animations

### Page Mount Animation
Every page wraps its outermost `<div>` (the `min-h-screen` container) in a `motion.div` with:
```ts
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, ease: 'easeOut' }}
```

Apply to: `page.tsx` (/), `setup/page.tsx`, `quiz/page.tsx`, `result/page.tsx`, `admin/page.tsx`.

### Answer Button Hover/Press (quiz page only)
Wrap each answer `<Button>` in a `motion.div`:
```ts
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
transition={{ type: 'spring', stiffness: 400, damping: 25 }}
```

### Staggered Answer Options (quiz page)
When a new question appears, answer options animate in with a stagger:
```ts
// container
variants={{ show: { transition: { staggerChildren: 0.07 } } }}

// each item
variants={{
  hidden: { opacity: 0, x: -12 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.25 } }
}}
```
Use `key={currentIndex}` on the container so it re-triggers on question change.

---

## 4. Question Count Selector (setup page)

### UI
A row of 5 clickable cards placed between the team picker and the Start Quiz button.

| value | label |
|---|---|
| 3 | Quick |
| 5 | Short |
| 10 | Standard |
| 20 | Long |
| 100 | Full |

Default selected: `10`.

Selected state: `border: 2px solid #111; background: #f9fafb; font-weight: 700`.
Unselected state: `border: 1px solid #e5e7eb; background: #fff`.

Each card shows the number (large, bold) above the label (small, muted).

### State
```ts
const [questionCount, setQuestionCount] = useState<number>(10)
```

### sessionStorage
On submit (alongside `playerName`, `teamId`, `teamName`):
```ts
sessionStorage.setItem('questionCount', String(questionCount))
```

---

## 5. Random Question Selection (quiz page)

### Reading the count
```ts
const count = Number(sessionStorage.getItem('questionCount') ?? '10')
```
If `count` is NaN, falsy, or > total questions available, fall back to all questions in `order_num` order.

### Shuffle algorithm (Fisher-Yates)
```ts
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
```

### Selection logic
```ts
const selected = count >= qs.length
  ? qs                          // all questions, original order
  : shuffle(qs).slice(0, count) // random N, no repeats
```

Applied after the Supabase fetch, before `setQuestions`.

### Guard on quiz page auth check
Add `questionCount` read to the session guard. If missing, default to `10` (don't redirect — it's optional data).

---

## 6. Progress Bar

Already implemented on the quiz page using shadcn `Progress`. No changes needed to placement (bottom of card) — this matches the approved design.

Value formula (already correct after previous fix):
```ts
((currentIndex + 1) / total) * 100
```

---

## 7. Files Changed

| File | Change |
|---|---|
| `package.json` | Add `framer-motion` |
| `src/app/layout.tsx` | Add background layer (dot grid + 4 shapes) |
| `src/app/page.tsx` | Wrap in motion.div (mount animation) |
| `src/app/setup/page.tsx` | Add question count selector; save to sessionStorage |
| `src/app/quiz/page.tsx` | Read questionCount; shuffle/slice; motion.div + staggered answers |
| `src/app/result/page.tsx` | Wrap in motion.div (mount animation) |
| `src/app/admin/page.tsx` | Wrap in motion.div (mount animation) |

---

## 8. Out of Scope

- No color theme changes
- No changes to Supabase schema or data flow
- No new pages or routes
- No changes to admin page content
- `questionCount` is not saved to the `scores` table (scores already record `total_questions` from actual quiz length)
