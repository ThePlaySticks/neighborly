'use client'

import React from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function Footer() {
  const [isSubdomain, setIsSubdomain] = React.useState(false)

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

  return (
    <footer className="w-full bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
                N
              </span>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Neighborly
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nigeria&apos;s premium neighborhood platform connecting residents with trusted artisans, local trade, notices, and smart estate management.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Platform</h4>
            <ul className="space-y-2">
              {isSubdomain ? (
                <>
                  <li>
                    <Link href="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Artisans Marketplace
                    </Link>
                  </li>
                  <li>
                    <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Buy/Sell Classifieds
                    </Link>
                  </li>
                  <li>
                    <Link href="/notices" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Notice Board
                    </Link>
                  </li>
                  <li>
                    <Link href="/chat" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Community Chat
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Pricing
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact details */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Contact Us</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@neighborly.ng</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-primary" />
                <span>+234 812 345 6789</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Lekki Peninsula, Lagos, Nigeria</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Stay Updated</h4>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter to receive neighborhood notices and tips.
            </p>
            <form className="flex space-x-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Your email"
                className="bg-background"
                required
              />
              <Button type="submit" size="sm" className="h-10 px-3">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Neighborly NG. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
