'use client'
import { useState, useEffect } from 'react'
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

type ScoreWithTeam = Score & { teams: { name: string } | null }

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

export default function AdminPage() {
  const [isChecking, setIsChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  // Password form state
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Scoreboard data state
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('idle')
  const [scores, setScores] = useState<ScoreWithTeam[]>([])
  const [teamScores, setTeamScores] = useState<TeamScore[]>([])

  useEffect(() => {
    const alreadyAuthed = sessionStorage.getItem('adminAuthenticated') === 'true'
    if (alreadyAuthed) {
      setAuthenticated(true)
    }
    setIsChecking(false)
  }, [])

  useEffect(() => {
    if (!authenticated) return

    async function fetchScoreboard() {
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
    }

    fetchScoreboard()
  }, [authenticated])

  function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    if (!adminPassword) {
      setPasswordError('Admin password is not configured. Contact the administrator.')
      return
    }
    if (password === adminPassword) {
      sessionStorage.setItem('adminAuthenticated', 'true')
      setAuthenticated(true)
    } else {
      setPasswordError('Incorrect password. Please try again.')
    }
  }

  // Prevent flash while checking sessionStorage
  if (isChecking) return null

  // Password gate
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-password">Password</Label>
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
                View Scoreboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading state
  if (loadStatus === 'loading' || loadStatus === 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading scoreboard...</p>
      </div>
    )
  }

  // Error state
  if (loadStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p role="alert" className="text-destructive">
          Failed to load scoreboard data. Please refresh the page.
        </p>
      </div>
    )
  }

  // Scoreboard
  return (
    <div className="min-h-screen p-6 md:p-10">
      <h1 className="text-4xl font-bold mb-8">Scoreboard</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Individual Rankings */}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-4">Individual Rankings</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Player Name</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No scores yet.
                  </TableCell>
                </TableRow>
              ) : (
                scores.map((row, index) => {
                  const pct =
                    row.total_questions > 0
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
          <h2 className="text-2xl font-semibold mb-4">Team Rankings</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Team Name</TableHead>
                <TableHead className="text-right">Players</TableHead>
                <TableHead className="text-right">Total Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamScores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No team scores yet.
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
    </div>
  )
}
