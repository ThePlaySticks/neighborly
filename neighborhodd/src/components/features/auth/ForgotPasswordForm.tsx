'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'

export function ForgotPasswordForm() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        setError(resetError.message)
      } else {
        setSuccess(true)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary font-bold">Reset Email Sent</CardTitle>
          <CardDescription>
            We have sent a password reset link to <strong className="text-foreground">{email}</strong>. Please check your inbox.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <a href="/login" className="inline-flex items-center justify-center font-medium rounded-lg px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90">
            Back to Sign In
          </a>
        </CardFooter>
      </Card>
    )
  }

  return (
    <form onSubmit={handleReset} className="w-full max-w-md mx-auto">
      <Card className="shadow-lg border border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-bold tracking-tight">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20 font-medium">
              {error}
            </div>
          )}
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" isLoading={loading}>
            Send Reset Link
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <a href="/login" className="text-primary hover:underline font-semibold">
              Sign In
            </a>
          </div>
        </CardFooter>
      </Card>
    </form>
  )
}
