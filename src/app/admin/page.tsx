'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { supabase } from '@/lib/supabase'
import type { Score, TeamScore } from '@/lib/types'

// NOTE: NEXT_PUBLIC_ADMIN_PASSWORD is inlined into the client bundle at build
// time (required by GitHub Pages static export — no server-side code available).
// This provides lightweight access control only; the real data protection is
// Supabase Row Level Security on the scores table.
type ScoreWithTeam = Score & { teams: { name: string } | null }
type LoadStatus = 'loading' | 'loaded' | 'error'

export default function AdminPage() {
  const [isChecking, setIsChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  // Password form state
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Scoreboard data state
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading')
  const [scores, setScores] = useState<ScoreWithTeam[]>([])
  const [teamScores, setTeamScores] = useState<TeamScore[]>([])

  const fetchScoreboard = useCallback(async () => {
    setLoadStatus('loading')
    try {
      const [scoresResult, teamScoresResult] = await Promise.all([
        supabase
          .from('scores')
          .select('*, teams(name)')
          .order('score', { ascending: false }),
        supabase
          .from('team_scores')
          .select('*')
          .order('total_score', { ascending: false }),
      ])

      if (scoresResult.error || teamScoresResult.error) {
        setLoadStatus('error')
        return
      }

      setScores((scoresResult.data as ScoreWithTeam[]) ?? [])
      setTeamScores(teamScoresResult.data ?? [])
      setLoadStatus('loaded')
    } catch {
      setLoadStatus('error')
    }
  }, [])

  useEffect(() => {
    const alreadyAuthed = sessionStorage.getItem('adminAuthenticated') === 'true'
    if (alreadyAuthed) setAuthenticated(true)
    setIsChecking(false)
  }, [])

  useEffect(() => {
    if (authenticated) fetchScoreboard()
  }, [authenticated, fetchScoreboard])

  function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    if (!adminPassword) {
      setPasswordError('관리자 비밀번호가 설정되지 않았습니다.')
      return
    }
    if (password === adminPassword) {
      sessionStorage.setItem('adminAuthenticated', 'true')
      setAuthenticated(true)
    } else {
      setPasswordError('비밀번호가 올바르지 않습니다. 다시 시도하세요.')
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('adminAuthenticated')
    setAuthenticated(false)
    setPassword('')
  }

  if (isChecking) return null

  // Password gate
  if (!authenticated) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">관리자 접근</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-password">비밀번호</Label>
                <Input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  aria-describedby={passwordError ? 'admin-password-error' : undefined}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError('')
                  }}
                  required
                />
                {passwordError && (
                  <p id="admin-password-error" role="alert" className="text-sm text-destructive">
                    {passwordError}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full">
                점수판 보기
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (loadStatus === 'loading') {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <p className="text-muted-foreground">점수판 불러오는 중...</p>
      </motion.div>
    )
  }

  if (loadStatus === 'error') {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <p role="alert" className="text-destructive">
          점수판 데이터를 불러오지 못했습니다.
        </p>
        <Button variant="outline" onClick={fetchScoreboard}>다시 시도</Button>
      </motion.div>
    )
  }

  // Scoreboard
  return (
    <motion.div
      className="min-h-screen p-6 md:p-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">점수판</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchScoreboard}>새로고침</Button>
          <Button variant="ghost" onClick={handleLogout}>잠금</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Individual Rankings */}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-4">개인 순위</h2>
          <Table aria-label="개인 순위">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>참가자</TableHead>
                <TableHead>팀</TableHead>
                <TableHead className="text-right">점수</TableHead>
                <TableHead className="text-right">총 문제</TableHead>
                <TableHead className="text-right">정답률</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    아직 점수가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                scores.map((row, index) => {
                  const pct = row.total_questions > 0
                    ? Math.round((row.score / row.total_questions) * 100)
                    : 0
                  return (
                    <TableRow key={row.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{row.player_name}</TableCell>
                      <TableCell>{row.teams?.name ?? '—'}</TableCell>
                      <TableCell className="text-right">{row.score}</TableCell>
                      <TableCell className="text-right">{row.total_questions}</TableCell>
                      <TableCell className="text-right">{pct}%</TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Team Rankings */}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-4">팀 순위</h2>
          <Table aria-label="팀 순위">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>팀명</TableHead>
                <TableHead className="text-right">참가자 수</TableHead>
                <TableHead className="text-right">총점</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamScores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    아직 팀 점수가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                teamScores.map((row, index) => (
                  <TableRow key={row.team_id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.team_name}</TableCell>
                    <TableCell className="text-right">{row.player_count}</TableCell>
                    <TableCell className="text-right">{row.total_score}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </motion.div>
  )
}
