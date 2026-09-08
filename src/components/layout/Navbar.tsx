'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Sun, Moon, Laptop, LogOut, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/providers/ThemeProvider'
import { logoutAction } from '@/lib/actions/community'

export function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [showThemeDropdown, setShowThemeDropdown] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await logoutAction()
    router.push('/')
    router.refresh()
  }

  const mainLinks = [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Features', href: '/#features' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-base shadow-sm">
            N
          </span>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Neighborly
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-6">
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Theme Selector */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg btn-interactive"
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
            >
              {!mounted ? (
                <Sun className="h-4 w-4 text-muted-foreground" />
              ) : theme === 'light' ? (
                <Sun className="h-4 w-4 text-primary" />
              ) : theme === 'dark' ? (
                <Moon className="h-4 w-4 text-primary" />
              ) : (
                <Laptop className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            {showThemeDropdown && (
              <div className="absolute right-0 mt-2 w-32 rounded-lg border border-border bg-card shadow-md p-1 z-50">
                <button
                  onClick={() => { setTheme('light'); setShowThemeDropdown(false) }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold rounded-md hover:bg-muted flex items-center space-x-2 text-foreground cursor-pointer"
                >
                  <Sun className="h-3.5 w-3.5 text-primary" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => { setTheme('dark'); setShowThemeDropdown(false) }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold rounded-md hover:bg-muted flex items-center space-x-2 text-foreground cursor-pointer"
                >
                  <Moon className="h-3.5 w-3.5 text-primary" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => { setTheme('system'); setShowThemeDropdown(false) }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold rounded-md hover:bg-muted flex items-center space-x-2 text-foreground cursor-pointer"
                >
                  <Laptop className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>System</span>
                </button>
              </div>
            )}
          </div>

          <Link href="/login">
            <Button variant="outline" size="sm" className="font-semibold rounded-xl text-xs gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Manager Login
            </Button>
          </Link>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleLogout}
            className="font-semibold rounded-xl text-xs text-muted-foreground hover:text-destructive gap-1"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </Button>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center space-x-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-lg"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {!mounted ? (
              <Sun className="h-4 w-4 text-muted-foreground" />
            ) : theme === 'dark' ? (
              <Sun className="h-4 w-4 text-primary" />
            ) : (
              <Moon className="h-4 w-4 text-primary" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-lg"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pt-2 pb-4 space-y-2">
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-foreground hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border flex flex-col space-y-2">
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full rounded-xl py-2 text-xs font-semibold gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                Manager Login
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => { handleLogout(); setIsOpen(false) }}
              className="w-full rounded-xl py-2 text-xs font-semibold text-destructive"
            >
              Log Out
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
