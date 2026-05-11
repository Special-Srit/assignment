'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Home() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const correctPassword = process.env.NEXT_PUBLIC_QUIZ_PASSWORD
    if (password === correctPassword) {
      sessionStorage.setItem('quizAuthenticated', 'true')
      router.push('/setup')
    } else {
      setError('Incorrect password. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Quiz Competition</CardTitle>
          <CardDescription>Enter the quiz password to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                required
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Enter Quiz
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
