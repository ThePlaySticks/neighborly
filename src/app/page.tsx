'use client'

import React, { useState, useEffect, useRef } from 'react'
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

interface Estate {
  id: string
  name: string
  subdomain: string
}

export default function NextdoorLandingPage() {
  const supabase = createClient()

  // Form inputs
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'resident' | 'estate_admin'>('resident') // Tenant vs Landlord/Admin
  
  // Estate listings
  const [estates, setEstates] = useState<Estate[]>([])
  const [selectedEstateId, setSelectedEstateId] = useState('')
  
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

  // Fetch estates on mount
  useEffect(() => {
    async function fetchEstates() {
      try {
        const { data } = await supabase
          .from('estates')
          .select('id, name, subdomain')
        if (data) {
          setEstates(data)
        }
      } catch (err) {
        console.error('Failed to load estates:', err)
      }
    }
    fetchEstates()
  }, [])

  // Handle Sign-Up Submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (role === 'resident' && !selectedEstateId) {
        throw new Error('Please select an estate to join')
      }
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
            role: role,
            estate_id: role === 'resident' ? selectedEstateId : null,
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
                      <h2 className="text-2xl font-black text-foreground tracking-tight">Create Account</h2>
                      <p className="text-xs text-muted-foreground">Join your gated neighborhood today</p>
                    </div>

                    {error && (
                      <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-xl border border-destructive/20 font-medium">
                        {error}
                      </div>
                    )}

                    {/* Nextdoor-Style Top Selection Tabs: Resident (Tenant) vs Estate Admin (Landlord) */}
                    <div className="flex border-b border-border">
                      <button
                        onClick={() => setRole('resident')}
                        className={`flex-1 text-center py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                          role === 'resident'
                            ? 'border-primary text-primary font-black'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Register as Resident
                      </button>
                      <button
                        onClick={() => setRole('estate_admin')}
                        className={`flex-1 text-center py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                          role === 'estate_admin'
                            ? 'border-primary text-primary font-black'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Register as Landlord/Admin
                      </button>
                    </div>

                    {/* Social Sign-In Options (Nextdoor Style) */}
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => {}}
                        className="w-full flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-xs font-bold text-foreground bg-card hover:bg-muted/50 transition-all cursor-pointer"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.86-4.53-2.86-4.53z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        Continue with Google
                      </button>
                      <button
                        type="button"
                        onClick={() => {}}
                        className="w-full flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-xs font-bold text-foreground bg-card hover:bg-muted/50 transition-all cursor-pointer"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                        </svg>
                        Continue with Apple
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-[1px] bg-border" />
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">or email signup</span>
                      <div className="flex-1 h-[1px] bg-border" />
                    </div>

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

                      {/* Resident dropdown to select estate */}
                      {role === 'resident' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Select Your Estate</label>
                          <select
                            value={selectedEstateId}
                            required
                            onChange={(e) => setSelectedEstateId(e.target.value)}
                            className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">-- Choose Estate --</option>
                            {estates.map((e) => (
                              <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Estate Admin / Landlord input */}
                      {role === 'estate_admin' && (
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
                      )}

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
