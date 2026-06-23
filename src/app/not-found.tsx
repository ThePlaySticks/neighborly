'use client'

import React from 'react'
import Link from 'next/link'
import { MapPin, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function NotFound() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--primary)/0.05,transparent_60%)] pointer-events-none" />

        <div className="text-center max-w-md space-y-8 relative z-10">
          <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto animate-pulse">
              <MapPin className="h-12 w-12" />
            </div>
            <span className="absolute top-0 right-[35%] flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-6xl font-black tracking-tighter text-foreground">404</h1>
            <h2 className="text-2xl font-extrabold text-foreground">Lost in Transit?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We couldn&apos;t find the page you were looking for. The community portal or resource might have moved or doesn&apos;t exist.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/" className="w-full sm:w-auto">
              <Button className="w-full font-semibold rounded-xl gap-2 shadow-lg shadow-primary/20">
                <Home className="h-4 w-4" /> Back to Home
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="w-full sm:w-auto font-semibold rounded-xl gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Go Back
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
