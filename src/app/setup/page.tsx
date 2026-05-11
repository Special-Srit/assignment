'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import type { Team } from '@/lib/types'

export default function SetupPage() {
  const [isChecking, setIsChecking] = useState(true)
  const [playerName, setPlayerName] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState('')
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
    router.push('/quiz')
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
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
    </div>
  )
}
