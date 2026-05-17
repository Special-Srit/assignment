'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import type { Database, AnswerChoice } from '@/lib/types'

type SaveStatus = 'saving' | 'saved' | 'error'
type ScoreInsert = Database['public']['Tables']['scores']['Insert']

type AnswerRecord = {
  questionText: string
  options: Record<AnswerChoice, string>
  userAnswer: AnswerChoice | null
  correctAnswer: AnswerChoice
  correct: boolean
}

function getEncouragingMessage(pct: number): string {
  if (pct >= 80) return '훌륭해요! 🎉'
  if (pct >= 50) return '잘했어요! 👍'
  return '다음엔 더 잘할 수 있어요! 💪'
}

export default function ResultPage() {
  const [isChecking, setIsChecking] = useState(true)
  const [playerName, setPlayerName] = useState('')
  const [teamName, setTeamName] = useState('')
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saving')
  const [reviewData, setReviewData] = useState<AnswerRecord[]>([])
  const [showReview, setShowReview] = useState(false)
  const hasSaved = useRef(false)
  const router = useRouter()

  useEffect(() => {
    // Auth + session guard
    const authenticated = sessionStorage.getItem('quizAuthenticated') === 'true'
    const storedPlayerName = sessionStorage.getItem('playerName')
    const storedTeamId = sessionStorage.getItem('teamId')
    const storedScore = sessionStorage.getItem('quizScore')
    const storedTotal = sessionStorage.getItem('totalQuestions')

    if (!authenticated || !storedPlayerName || !storedTeamId || storedScore === null || storedTotal === null) {
      router.replace('/')
      return
    }

    const parsedScore = Number(storedScore)
    const parsedTotal = Number(storedTotal)

    if (isNaN(parsedScore) || isNaN(parsedTotal) || parsedTotal <= 0) {
      router.replace('/')
      return
    }

    // Capture non-null values for use in async closure
    const resolvedPlayerName = storedPlayerName
    const resolvedTeamId = storedTeamId
    const resolvedTeamName = sessionStorage.getItem('teamName') ?? ''

    const storedAnswers = sessionStorage.getItem('quizAnswers')
    if (storedAnswers) {
      try { setReviewData(JSON.parse(storedAnswers)) } catch { /* ignore corrupt data */ }
    }

    setPlayerName(resolvedPlayerName)
    setTeamName(resolvedTeamName)
    setScore(parsedScore)
    setTotal(parsedTotal)

    // StrictMode double-invoke guard — must come before setIsChecking(false)
    if (hasSaved.current) {
      setIsChecking(false)
      return
    }
    hasSaved.current = true
    setIsChecking(false)

    // Clear session keys before the async call so a tab-close mid-flight
    // cannot leave stale keys that trigger a duplicate insert on next visit
    sessionStorage.removeItem('quizScore')
    sessionStorage.removeItem('totalQuestions')
    sessionStorage.removeItem('playerName')
    sessionStorage.removeItem('teamId')
    sessionStorage.removeItem('teamName')
    sessionStorage.removeItem('quizAuthenticated')
    sessionStorage.removeItem('quizAnswers')

    async function saveScore() {
      const payload: ScoreInsert = {
        player_name: resolvedPlayerName,
        team_id: resolvedTeamId,
        score: parsedScore,
        total_questions: parsedTotal,
      }
      try {
        const { error } = await supabase.from('scores').insert(payload)
        setSaveStatus(error ? 'error' : 'saved')
      } catch {
        setSaveStatus('error')
      }
    }

    saveScore()
  }, [router])

  if (isChecking) return null

  const percentage = Math.round((score / total) * 100)
  const message = getEncouragingMessage(percentage)

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold">퀴즈 완료!</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 pt-2">

          {/* Player / Team Info */}
          <div className="text-center">
            <p className="text-lg font-semibold">{playerName}</p>
            {teamName && (
              <p className="text-sm text-muted-foreground mt-1">팀: {teamName}</p>
            )}
          </div>

          {/* Large Score Display */}
          <div
            className="flex flex-col items-center gap-1"
            aria-label={`점수: ${score}/${total}`}
          >
            <span className="text-7xl font-bold tabular-nums" aria-hidden="true">{score}</span>
            <span className="text-muted-foreground text-sm" aria-hidden="true">{total}문제 중</span>
          </div>

          {/* Percentage + Message */}
          <div className="flex flex-col items-center gap-2">
            <Badge
              variant={percentage >= 80 ? 'default' : percentage >= 50 ? 'secondary' : 'outline'}
              className="text-base px-4 py-1"
            >
              {percentage}%
            </Badge>
            <p className="text-xl font-medium">{message}</p>
            <p className="text-sm text-muted-foreground text-center">
              {total}문제 중 {score}문제를 맞혔습니다.
            </p>
          </div>

          {/* Save Status */}
          <div className="w-full border-t pt-4 text-center">
            {saveStatus === 'saving' && (
              <p className="text-sm text-muted-foreground">점수 저장 중...</p>
            )}
            {saveStatus === 'saved' && (
              <p className="text-sm text-green-600 font-medium">점수가 저장되었습니다!</p>
            )}
            {saveStatus === 'error' && (
              <p role="alert" className="text-sm text-destructive">
                점수 저장에 실패했습니다. 결과: {score}/{total} ({percentage}%)
              </p>
            )}
          </div>

          {/* Return to start */}
          <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
            처음으로
          </Button>

          {/* Review answers toggle */}
          {reviewData.length > 0 && (
            <div className="w-full">
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => setShowReview((v) => !v)}
              >
                답안 {showReview ? '숨기기' : '확인'}
              </Button>

              {showReview && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="mt-3 flex flex-col gap-3"
                >
                  {reviewData.map((item, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg border p-3 text-sm ${
                        item.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="mt-0.5 text-base">{item.correct ? '✅' : '❌'}</span>
                        <p className="font-medium text-foreground leading-snug">{idx + 1}. {item.questionText}</p>
                      </div>
                      <div className="flex flex-col gap-1 pl-6">
                        {(['a', 'b', 'c', 'd'] as AnswerChoice[]).map((key) => {
                          const isUser = item.userAnswer === key
                          const isCorrect = item.correctAnswer === key
                          return (
                            <div
                              key={key}
                              className={`px-2 py-1 rounded text-xs ${
                                isCorrect
                                  ? 'bg-green-100 text-green-800 font-semibold'
                                  : isUser && !isCorrect
                                  ? 'bg-red-100 text-red-700 line-through'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {key.toUpperCase()}. {item.options[key]}
                              {isCorrect && !item.correct && ' ← 정답'}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}

        </CardContent>
      </Card>
    </motion.div>
  )
}
