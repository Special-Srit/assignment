'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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
    if (!correctPassword) {
      console.error('NEXT_PUBLIC_QUIZ_PASSWORD is not configured')
      setError('퀴즈 비밀번호가 설정되지 않았습니다. 관리자에게 문의하세요.')
      return
    }
    if (password === correctPassword) {
      sessionStorage.setItem('quizAuthenticated', 'true')
      router.push('/setup')
    } else {
      setError('비밀번호가 올바르지 않습니다. 다시 시도하세요.')
    }
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">퀴즈 대회</CardTitle>
          <CardDescription>계속하려면 퀴즈 비밀번호를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-describedby={error ? 'password-error' : undefined}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                required
              />
              {error && (
                <p id="password-error" role="alert" className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              퀴즈 입장
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
