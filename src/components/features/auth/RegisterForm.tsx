'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/FormControls'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'

interface Estate {
  id: string
  name: string
  subdomain: string
}

export function RegisterForm() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  
  // Role is determined by subdomain detection, not user selection
  const [role, setRole] = useState<'resident' | 'estate_admin'>('estate_admin')
  
  // Estate selection for residents (subdomain)
  const [selectedEstateId, setSelectedEstateId] = useState('')
  const [detectedSubdomain, setDetectedSubdomain] = useState<string | null>(null)
  const [detectedEstate, setDetectedEstate] = useState<Estate | null>(null)
  const [isOnSubdomain, setIsOnSubdomain] = useState(false)

  // New estate details for estate admins (main domain)
  const [newEstateName, setNewEstateName] = useState('')
  const [newEstateSubdomain, setNewEstateSubdomain] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // OTP flow states
  const [showOtpScreen, setShowOtpScreen] = useState(false)
  const [otpToken, setOtpToken] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpSuccess, setOtpSuccess] = useState(false)

  // Detect subdomain client-side and auto-configure role
  useEffect(() => {
    async function initRegisterForm() {
      try {
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname
          const parts = hostname.split('.')
          const rootDomains = ['localhost', 'neighborly', 'www', 'vercel']
          const isSubdomain = parts.length > 1 && !rootDomains.includes(parts[0])
          
          if (isSubdomain) {
            const sub = parts[0]
            setDetectedSubdomain(sub)
            setIsOnSubdomain(true)
            setRole('resident')
            
            // Fetch the estate matching this subdomain
            const { data: estateData } = await supabase
              .from('estates')
              .select('id, name, subdomain')
              .eq('subdomain', sub)
              .single()
            
            if (estateData) {
              setDetectedEstate(estateData)
              setSelectedEstateId(estateData.id)
            }
          } else {
            // Main domain — landlord/estate admin registration
            setRole('estate_admin')
            setIsOnSubdomain(false)
          }
        }
      } catch (err: any) {
        console.error('Failed to init register form:', err)
      }
    }
    initRegisterForm()
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validations
      if (role === 'resident' && !selectedEstateId) {
        throw new Error('No estate detected for this subdomain. Please contact the estate administrator.')
      }
      if (role === 'estate_admin' && (!newEstateName || !newEstateSubdomain)) {
        throw new Error('Please enter both estate name and desired subdomain')
      }

      // 1. Sign up the user in Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            estate_id: role === 'resident' ? selectedEstateId : null,
          },
        },
      })

      if (signUpError) throw signUpError

      const userId = signUpData.user?.id
      if (!userId) throw new Error('Registration failed, no user ID returned')

      // 2. If registering as an Estate Admin, create the estate record
      if (role === 'estate_admin') {
        const { data: estateData, error: estateError } = await supabase
          .from('estates')
          .insert({
            name: newEstateName,
            subdomain: newEstateSubdomain.toLowerCase().trim(),
            admin_id: userId,
            subscription_status: 'active'
          })
          .select()
          .single()

        if (estateError) throw estateError

        // Link the estate admin profile to their newly created estate
        if (estateData) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ estate_id: estateData.id })
            .eq('id', userId)
          
          if (profileError) throw profileError
        }
      }

      // Show OTP verification screen
      setShowOtpScreen(true)
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpError(null)
    setOtpVerifying(true)

    try {
      if (otpToken.length !== 6) {
        throw new Error('Please enter a valid 6-digit code')
      }

      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otpToken,
        type: 'signup'
      })

      if (verifyError) throw verifyError

      setOtpSuccess(true)
      // Auto sign-in via NextAuth after verification
      setTimeout(async () => {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })
        if (result?.ok) {
          window.location.href = '/'
        } else {
          window.location.href = '/login'
        }
      }, 1500)
    } catch (err: any) {
      setOtpError(err.message || 'OTP verification failed. Please try again.')
    } finally {
      setOtpVerifying(false)
    }
  }

  if (showOtpScreen) {
    return (
      <form onSubmit={handleVerifyOtp} className="w-full max-w-md mx-auto">
        <Card className="shadow-2xl border border-border bg-card/60 backdrop-blur-md">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-black text-foreground">Verify Account</CardTitle>
            <CardDescription className="text-sm">
              We sent a 6-digit OTP code to <strong className="text-foreground">{email}</strong>. Enter the code below to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {otpError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl border border-destructive/20 font-medium space-y-2">
                <p>{otpError}</p>
              </div>
            )}
            {otpSuccess && (
              <div className="bg-emerald-500/10 text-emerald-600 text-sm p-3 rounded-xl border border-emerald-500/20 font-medium text-center">
                Email verified successfully! Redirecting...
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">OTP Verification Code</label>
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-center tracking-[0.75em] text-2xl font-bold rounded-xl border border-input bg-card/80 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              disabled={otpVerifying || otpSuccess}
              className="w-full font-semibold rounded-xl"
            >
              {otpVerifying ? 'Verifying...' : 'Verify OTP Code'}
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              Didn&apos;t get the code?{' '}
              <button
                type="button"
                onClick={handleRegister}
                className="text-primary font-semibold hover:underline bg-transparent border-0 cursor-pointer"
              >
                Resend Code
              </button>
            </div>
          </CardFooter>
        </Card>
      </form>
    )
  }

  return (
    <form onSubmit={handleRegister} className="w-full max-w-md mx-auto">
      <Card className="shadow-2xl border border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl text-center font-black tracking-tight">
            {isOnSubdomain ? 'Join Your Community' : 'Register Your Estate'}
          </CardTitle>
          <CardDescription className="text-center text-sm">
            {isOnSubdomain
              ? detectedEstate
                ? `Create your resident account for ${detectedEstate.name}`
                : 'Create your resident account'
              : 'Create a private portal for your estate and tenants'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3.5 rounded-xl border border-destructive/20 font-medium space-y-2.5">
              <p>{error}</p>
            </div>
          )}

          {/* Show detected estate badge when on subdomain */}
          {isOnSubdomain && detectedEstate && (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-sm text-foreground flex items-center justify-between">
              <span>🏡 Joining <strong>{detectedEstate.name}</strong></span>
              <Badge variant="success">Auto-Detected</Badge>
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="John Doe"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Estate Admin fields — only on main domain */}
          {!isOnSubdomain && (
            <div className="space-y-4 border-t border-border pt-4">
              <Input
                label="Estate / Community Name"
                placeholder="e.g. Lekki Phase 1"
                required
                value={newEstateName}
                onChange={(e) => setNewEstateName(e.target.value)}
              />
              <div className="space-y-1">
                <Input
                  label="Desired Subdomain"
                  placeholder="e.g. lekki-1"
                  required
                  value={newEstateSubdomain}
                  onChange={(e) => setNewEstateSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                />
                {newEstateSubdomain && (
                  <p className="text-[10px] text-muted-foreground">
                    Your estate portal will be at: <strong className="text-primary">{newEstateSubdomain}.neighborly.ng</strong>
                  </p>
                )}
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full font-semibold rounded-xl" isLoading={loading}>
            {isOnSubdomain ? 'Create Resident Account' : 'Register Estate'}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </form>
  )
}
