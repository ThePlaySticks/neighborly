'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Sun, Moon, Laptop, Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/providers/ThemeProvider'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [showThemeDropdown, setShowThemeDropdown] = useState(false)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  const [isSubdomain, setIsSubdomain] = useState(false)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const rootDomains = [
        'localhost',
        'neighborly.ng',
        'www.neighborly.ng',
        'neighborly-zeta.vercel.app',
        'neighborly-gamma.vercel.app',
      ]
      const isRoot = rootDomains.includes(hostname)
      setIsSubdomain(!isRoot)
    }
  }, [])

  const mainLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
  ]

  const subdomainLinks = [
    { label: 'Portal Home', href: '/' },
    { label: 'Notices', href: '/notices' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Services', href: '/services' },
    { label: 'Chat', href: '/chat' },
    { label: 'Support', href: '/support' },
  ]

  const links = isSubdomain ? subdomainLinks : mainLinks

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

        {/* Desktop Nav Links - Single Line (Height Cap compliant) */}
        <nav className="hidden md:flex items-center space-x-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Global Search Bar (Desktop only) */}
        <div className="hidden lg:flex items-center relative max-w-xs w-full mx-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search residents, posts, groups..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-muted/40 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:bg-card transition-all"
          />
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Notifications Bell */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg btn-interactive relative"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            >
              <Bell className="h-4.5 w-4.5 text-muted-foreground hover:text-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-card" />
            </Button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-card shadow-lg p-2 z-50 animate-fade-in-scale">
                <div className="p-2 border-b border-border/40 flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">Notifications</span>
                  <span className="text-[9px] text-primary font-bold cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="p-1 max-h-64 overflow-y-auto space-y-1 mt-1">
                  {[
                    { text: 'Alhaji Bello requested gate check-in approval for guest Kola Alabi.', time: '5m ago' },
                    { text: 'Obinna O. commented on your marketplace post "Biometric upgrades".', time: '1h ago' },
                    { text: 'New estate notice: Upgraded maintenance fee billing parameters set.', time: '1d ago' }
                  ].map((notif, idx) => (
                    <div key={idx} className="p-2 hover:bg-muted/50 rounded-xl transition-all text-xs text-foreground/90 leading-relaxed flex flex-col gap-0.5">
                      <p>{notif.text}</p>
                      <span className="text-[8px] text-muted-foreground font-mono">{notif.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
              <div className="absolute right-0 mt-2 w-32 rounded-lg border border-border bg-card shadow-md p-1 z-50 animate-fade-in-scale">
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

          {isSubdomain ? (
            <>
              <Link href="/visitors">
                <Button variant="outline" size="sm" className="font-semibold rounded-xl btn-interactive text-xs">Guest Codes</Button>
              </Link>
              <Link href="/login">
                <Button size="sm" className="font-semibold rounded-xl btn-interactive text-xs">Sign In</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm" className="font-semibold rounded-xl btn-interactive text-xs">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="font-semibold rounded-xl btn-interactive text-xs">Register Estate</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center space-x-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-lg btn-interactive"
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
            className="h-9 w-9 p-0 rounded-lg btn-interactive"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pt-2 pb-4 space-y-1.5 animate-slide-down">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-foreground hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-border flex flex-col space-y-2">
            {isSubdomain ? (
              <>
                <Link href="/visitors" onClick={() => setIsOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full rounded-xl py-2.5 text-xs font-semibold">Guest Codes</Button>
                </Link>
                <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                  <Button className="w-full rounded-xl py-2.5 text-xs font-semibold">Sign In</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full rounded-xl py-2.5 text-xs font-semibold">Sign In</Button>
                </Link>
                <Link href="/signup" onClick={() => setIsOpen(false)} className="w-full">
                  <Button className="w-full rounded-xl py-2.5 text-xs font-semibold">Register Estate</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
