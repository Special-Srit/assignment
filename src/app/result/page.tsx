'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/types'

type SaveStatus = 'saving' | 'saved' | 'error'
type ScoreInsert = Database['public']['Tables']['scores']['Insert']

function getEncouragingMessage(pct: number): string {
  if (pct >= 80) return 'Excellent!'
  if (pct >= 50) return 'Good job!'
  return 'Better luck next time!'
}

export default function ResultPage() {
  const [isChecking, setIsChecking] = useState(true)
  const [playerName, setPlayerName] = useState('')
  const [teamName, setTeamName] = useState('')
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saving')
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
          <CardTitle className="text-3xl font-bold">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 pt-2">

          {/* Player / Team Info */}
          <div className="text-center">
            <p className="text-lg font-semibold">{playerName}</p>
            {teamName && (
              <p className="text-sm text-muted-foreground mt-1">Team: {teamName}</p>
            )}
          </div>

          {/* Large Score Display */}
          <div
            className="flex flex-col items-center gap-1"
            aria-label={`Score: ${score} out of ${total}`}
          >
            <span className="text-7xl font-bold tabular-nums" aria-hidden="true">{score}</span>
            <span className="text-muted-foreground text-sm" aria-hidden="true">out of {total}</span>
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
              You scored {score} out of {total} questions correctly.
            </p>
          </div>

          {/* Save Status */}
          <div className="w-full border-t pt-4 text-center">
            {saveStatus === 'saving' && (
              <p className="text-sm text-muted-foreground">Saving your score...</p>
            )}
            {saveStatus === 'saved' && (
              <p className="text-sm text-green-600 font-medium">Score saved!</p>
            )}
            {saveStatus === 'error' && (
              <p role="alert" className="text-sm text-destructive">
                Failed to save score. Your result was {score}/{total} ({percentage}%).
              </p>
            )}
          </div>

          {/* Return to start */}
          <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
            Back to Start
          </Button>

        </CardContent>
      </Card>
    </motion.div>
  )
}
