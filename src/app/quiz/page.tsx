'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
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

const answerContainerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const answerItemVariants: Variants = {
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
          sessionStorage.setItem('quizAnswers', JSON.stringify(
            questions.map((q, i) => ({
              questionText: q.question_text,
              options: { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d },
              userAnswer: updated[i],
              correctAnswer: q.correct_answer,
              correct: updated[i] === q.correct_answer,
            }))
          ))
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

    const rawCount = parseInt(sessionStorage.getItem('questionCount') ?? '10', 10)
    const requestedCount = isNaN(rawCount) || rawCount <= 0 ? 10 : rawCount

    async function fetchQuestions() {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('order_num')

      if (error) {
        setLoadError('문제를 불러오지 못했습니다. 새로고침 후 다시 시도하세요.')
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
        <p className="text-muted-foreground">문제 불러오는 중...</p>
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
        <p className="text-muted-foreground">등록된 문제가 없습니다.</p>
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
            <span>{total}문제 중 {currentIndex + 1}번</span>
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
            aria-label={`퀴즈 진행률: ${total}문제 중 ${currentIndex + 1}번`}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
