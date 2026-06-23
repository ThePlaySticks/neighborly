'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Sun, Moon, Laptop } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/providers/ThemeProvider'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [showThemeDropdown, setShowThemeDropdown] = useState(false)
  const [isSubdomain, setIsSubdomain] = useState(false)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      // Full list of root domain hostnames (no port)
      const rootDomains = [
        'localhost',
        'neighborly.ng',
        'www.neighborly.ng',
        'neighborly-zeta.vercel.app',
        'neighborly-gamma.vercel.app',
      ]
      // If the hostname exactly matches any root domain, it's NOT a subdomain
      const isRoot = rootDomains.includes(hostname)
      setIsSubdomain(!isRoot)
    }
  }, [])

  // Links for the main SaaS product landing page (root domain)
  const mainLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
  ]

  // Links for residents on a specific estate subdomain
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
          <span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
            N
          </span>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            {isSubdomain ? 'Neighborly' : 'Neighborly'}
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Theme Selector */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
            >
              {theme === 'light' ? (
                <Sun className="h-4 w-4 text-amber-500" />
              ) : theme === 'dark' ? (
                <Moon className="h-4 w-4 text-emerald-400" />
              ) : (
                <Laptop className="h-4 w-4" />
              )}
            </Button>
            {showThemeDropdown && (
              <div className="absolute right-0 mt-2 w-32 rounded-md border border-border bg-card shadow-lg ring-1 ring-black/5 p-1">
                <button
                  onClick={() => { setTheme('light'); setShowThemeDropdown(false) }}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium rounded hover:bg-muted flex items-center space-x-2 text-foreground"
                >
                  <Sun className="h-3 w-3 text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => { setTheme('dark'); setShowThemeDropdown(false) }}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium rounded hover:bg-muted flex items-center space-x-2 text-foreground"
                >
                  <Moon className="h-3 w-3 text-emerald-400" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => { setTheme('system'); setShowThemeDropdown(false) }}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium rounded hover:bg-muted flex items-center space-x-2 text-foreground"
                >
                  <Laptop className="h-3 w-3" />
                  <span>System</span>
                </button>
              </div>
            )}
          </div>

          {isSubdomain ? (
            <>
              <Link href="/visitors">
                <Button variant="outline" size="sm" className="font-semibold">Guest Codes</Button>
              </Link>
              <Link href="/login">
                <Button size="sm" className="font-semibold">Sign In</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm" className="font-semibold">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="font-semibold">Register Estate</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center space-x-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-emerald-400" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pt-2 pb-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-border flex flex-col space-y-2">
            {isSubdomain ? (
              <>
                <Link href="/visitors" onClick={() => setIsOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full">Guest Codes</Button>
                </Link>
                <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                  <Button className="w-full">Sign In</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/signup" onClick={() => setIsOpen(false)} className="w-full">
                  <Button className="w-full">Register Estate</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
