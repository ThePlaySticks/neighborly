'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { loginAction } from '@/lib/actions/community'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)

      const result = await loginAction(formData)

      if (!result.success) {
        setError(result.error || 'Invalid email or password. Please try again.')
      } else {
        const destination = (redirectUrl && redirectUrl !== '/') ? redirectUrl : (result.defaultRedirect || '/manager/dashboard')
        router.push(destination)
        router.refresh()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during login'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="w-full max-w-md mx-auto">
      <Card className="shadow-lg border border-border bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your Neighborly community account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3.5 rounded-xl border border-destructive/20 font-medium">
              <p>{error}</p>
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. admin@bananaisland.ng"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline font-semibold"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="bg-muted/40 p-3 rounded-xl border border-border/50 text-[11px] text-muted-foreground space-y-1">
            <p className="font-bold text-foreground">Demo Accounts:</p>
            <p>Admin: <code className="text-primary font-mono font-bold">admin@bananaisland.ng</code> / <code className="font-mono">admin123</code></p>
            <p>Resident: <code className="text-primary font-mono font-bold">chinedu@example.com</code> / <code className="font-mono">resident123</code></p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full rounded-xl py-3 font-semibold text-xs" isLoading={loading}>
            Sign In
          </Button>
          <div className="text-center text-xs text-muted-foreground">
            Don&apos;t have an estate registered yet?{' '}
            <Link href="/" className="text-primary hover:underline font-semibold">
              Create community
            </Link>
          </div>
        </CardFooter>
      </Card>
    </form>
  )
}
