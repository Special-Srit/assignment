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
  { value: 3,   label: '빠르게' },
  { value: 5,   label: '짧게' },
  { value: 10,  label: '기본' },
  { value: 20,  label: '길게' },
  { value: 100, label: '전체' },
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
        setTeamsError('팀을 불러오지 못했습니다. 새로고침 후 다시 시도하세요.')
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
      setValidationError('이름을 입력하고 팀을 선택하세요.')
      return
    }

    const team = teams.find((t) => t.id === selectedTeamId)
    if (!team) {
      setValidationError('선택한 팀이 유효하지 않습니다. 다시 시도하세요.')
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
          <CardTitle className="text-3xl font-bold">참가자 설정</CardTitle>
          <CardDescription>퀴즈를 시작하려면 정보를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="playerName">이름</Label>
              <Input
                id="playerName"
                type="text"
                autoComplete="name"
                placeholder="이름을 입력하세요"
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
              <Label htmlFor="team">소속 팀</Label>
              {loadingTeams ? (
                <p className="text-sm text-muted-foreground">팀 불러오는 중...</p>
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
                  <option value="">팀을 선택하세요</option>
                  {teams.length === 0 ? (
                    <option value="" disabled>등록된 팀이 없습니다 — 관리자에게 문의하세요</option>
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
              <Label>문제 수</Label>
              <div className="flex gap-2 flex-wrap">
                {COUNT_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value}문제 – ${label}`}
                    aria-pressed={questionCount === value}
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
              퀴즈 시작
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
