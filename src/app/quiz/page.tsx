'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase'
import type { Question, AnswerChoice } from '@/lib/types'

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
        // Last question — compute score in one updater, then navigate
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
    // Auth + session guard
    const authenticated = sessionStorage.getItem('quizAuthenticated') === 'true'
    const playerName = sessionStorage.getItem('playerName')
    const teamId = sessionStorage.getItem('teamId')

    if (!authenticated || !playerName || !teamId) {
      router.replace('/')
      return
    }

    // No re-entry: if quiz already completed, go to result
    if (sessionStorage.getItem('quizScore') !== null) {
      router.replace('/result')
      return
    }

    setIsChecking(false)

    async function fetchQuestions() {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('order_num')

      if (error) {
        setLoadError('Failed to load questions. Please refresh and try again.')
      } else {
        const qs = data ?? []
        setQuestions(qs)
        setAnswers(new Array<AnswerChoice | null>(qs.length).fill(null))
      }
      setLoading(false)
    }

    fetchQuestions()
  }, [router])

  if (isChecking) return null

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground">Loading questions...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p role="alert" className="text-destructive">{loadError}</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground">No questions available.</p>
      </div>
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Question {currentIndex + 1} of {total}</span>
            </div>
            <Progress value={progressValue} aria-label={`Quiz progress: question ${currentIndex + 1} of ${total}`} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <CardTitle className="text-xl leading-snug">{question.question_text}</CardTitle>

          <div className="flex flex-col gap-3">
            {optionLabels.map(({ key, label, text }) => (
              <Button
                key={key}
                variant={answers[currentIndex] === key ? 'default' : 'outline'}
                className="w-full justify-start text-left whitespace-normal h-auto py-3"
                onClick={() => handleAnswer(key)}
                disabled={isAnswered && answers[currentIndex] !== key}
              >
                <span className="font-semibold mr-2">{label}.</span>
                <span>{text}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
