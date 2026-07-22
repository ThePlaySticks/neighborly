'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Shield, CreditCard, Bell, ShoppingBag, AlertTriangle,
  ArrowRight, CheckCircle, MapPin, Mail, Phone, Send,
  Lock, ChevronDown, Check, Home, Users, Briefcase, Sparkles, LogIn
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'



export default function NextdoorLandingPage() {
  const supabase = createClient()

  // Form inputs
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role] = useState<'estate_admin'>('estate_admin') // Landlord-only on main domain
  
  // Estate listings
  
  // Estate Admin details
  const [newEstateName, setNewEstateName] = useState('')
  const [newEstateSubdomain, setNewEstateSubdomain] = useState('')

  // State flags
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showOtpScreen, setShowOtpScreen] = useState(false)
  const [otpToken, setOtpToken] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpSuccess, setOtpSuccess] = useState(false)



  // Handle Sign-Up Submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {

      if (role === 'estate_admin' && (!newEstateName || !newEstateSubdomain)) {
        throw new Error('Please enter both estate name and desired subdomain')
      }

      // 1. Sign up user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'estate_admin',
            estate_id: null,
          },
        },
      })

      if (signUpError) throw signUpError

      const userId = signUpData.user?.id
      if (!userId) throw new Error('Registration failed, no user ID returned')

      // 2. Create estate if registering as admin/landlord
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

        if (estateData) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ estate_id: estateData.id })
            .eq('id', userId)
          
          if (profileError) throw profileError
        }
      }

      setShowOtpScreen(true)
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP Verification
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
      setTimeout(() => {
        window.location.href = role === 'estate_admin' 
          ? `/estates/${newEstateSubdomain}/admin` 
          : `/login`
      }, 1500)
    } catch (err: any) {
      setOtpError(err.message || 'OTP verification failed. Please try again.')
    } finally {
      setOtpVerifying(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      {/* ===================== NEXTDOOR CO-BRANDED HERO / SIGNUP SPLIT LAYOUT ===================== */}
      <main className="flex-1 flex items-center bg-mesh-light bg-mesh-auto py-12 md:py-20 relative overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            {/* Left Side: Pitch Copy & Testimonial Mockup (Nextdoor Style) */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <Badge variant="outline" className="px-4 py-1.5 text-xs font-semibold rounded-full border-primary/20 bg-primary/5 text-primary shadow-sm inline-flex">
                🇳🇬 Gated Estates Social Platform
              </Badge>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
                Discover your estate. <span className="text-primary">Connect with verified neighbors.</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                Neighborly is the trusted private network for gated communities in Nigeria. Find local trades, generate visitor gate passcodes, pay estate levies, and stay updated on important security notices.
              </p>

              {/* Graphical representation/Mockup of local community interactions */}
              <div className="pt-6 hidden sm:block">
                <div className="glass rounded-2xl p-4 shadow-md border border-border/60 max-w-lg mx-auto lg:mx-0">
                  <div className="flex items-center gap-3 border-b border-border/40 pb-3 mb-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground font-mono">Banana Island Estate Activity Feed</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">A</div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Alhaji Bello <span className="text-[10px] text-muted-foreground font-medium">• Gate A</span></p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Generator maintenance scheduled for Tuesday from 10 AM to 2 PM. Plan accordingly!</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-[10px] shrink-0">C</div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Chinedu Okafor <span className="text-[10px] text-muted-foreground font-medium">• Block 4</span></p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Anyone got recommendations for a reliable electrician in Lekki? Need assistance with inverter setup.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Nextdoor-Style Signup Card */}
            <div className="lg:col-span-6 flex justify-center w-full">
              <Card className="w-full max-w-md shadow-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
                
                {showOtpScreen ? (
                  // OTP SCREEN
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-black text-foreground">Verify Account</h2>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We sent a 6-digit OTP code to <strong className="text-foreground">{email}</strong>. Enter the code below to verify your email.
                      </p>
                    </div>

                    {otpError && (
                      <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-xl border border-destructive/20 font-medium">
                        {otpError}
                      </div>
                    )}
                    {otpSuccess && (
                      <div className="bg-emerald-500/10 text-emerald-600 text-xs p-3 rounded-xl border border-emerald-500/20 font-medium text-center">
                        ✓ Email verified successfully! Redirecting...
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">OTP Verification Code</label>
                      <input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        required
                        value={otpToken}
                        onChange={(e) => setOtpToken(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full text-center tracking-[0.75em] text-2xl font-bold rounded-xl border border-input bg-card py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                      />
                    </div>

                    <Button type="submit" disabled={otpVerifying || otpSuccess} className="w-full font-semibold rounded-xl py-3.5 btn-interactive">
                      {otpVerifying ? 'Verifying...' : 'Verify OTP Code'}
                    </Button>
                  </form>
                ) : (
                  // REGISTRATION SIGN-UP CARD
                  <div className="space-y-5">
                    <div className="space-y-1 text-center">
                      <h2 className="text-2xl font-black text-foreground tracking-tight">Register Your Estate</h2>
                      <p className="text-xs text-muted-foreground font-medium">Create a private portal for your estate and tenants</p>
                    </div>

                    {error && (
                      <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-xl border border-destructive/20 font-medium">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-3.5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
                        />
                      </div>

                      {/* Estate Admin / Landlord input */}
                      <div className="space-y-3.5 border-t border-border/55 pt-3.5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Estate / Community Name</label>
                          <input
                            type="text"
                            required
                            value={newEstateName}
                            onChange={(e) => setNewEstateName(e.target.value)}
                            placeholder="e.g. Lekki Phase 1"
                            className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Desired Subdomain</label>
                          <input
                            type="text"
                            required
                            value={newEstateSubdomain}
                            onChange={(e) => setNewEstateSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            placeholder="e.g. lekki-1"
                            className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
                          />
                          {newEstateSubdomain && (
                            <span className="text-[9px] text-muted-foreground">
                              Portal: <strong className="text-primary font-bold">{newEstateSubdomain}.neighborly.ng</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <Button type="submit" disabled={loading} className="w-full font-semibold rounded-xl py-3.5 btn-interactive mt-2">
                        {loading ? 'Creating Account...' : 'Create Free Account'}
                      </Button>
                    </form>

                    <div className="text-center text-xs text-muted-foreground">
                      Already have an account?{' '}
                      <Link href="/login" className="text-primary hover:underline font-bold">
                        Sign In
                      </Link>
                    </div>
                  </div>
                )}

              </Card>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
