'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Zap, Droplets, Hammer, Paintbrush2, Wind, Sparkles,
  BookOpen, Wrench, Scissors, Wifi, Tv, Flower2,
  ChevronDown, Star, Users, Search, CheckCircle,
  Smartphone, ArrowRight, Shield, MessageSquare,
  ShoppingBag, Calendar, AlertTriangle, Quote,
  MapPin, Phone, Mail, TrendingUp, Award,
  Bell, ChevronRight, Send
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/FormControls'
import { Avatar } from '@/components/ui/Avatar'
import { Rating } from '@/components/ui/Rating'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CATEGORIES, FAQS } from '@/config/navigation'

// --- Category icon map ---
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Zap: <Zap className="h-6 w-6" />,
  Droplet: <Droplets className="h-6 w-6" />,
  Hammer: <Hammer className="h-6 w-6" />,
  Paintbrush: <Paintbrush2 className="h-6 w-6" />,
  Wind: <Wind className="h-6 w-6" />,
  Sparkles: <Sparkles className="h-6 w-6" />,
  BookOpen: <BookOpen className="h-6 w-6" />,
  Wrench: <Wrench className="h-6 w-6" />,
  Scissors: <Scissors className="h-6 w-6" />,
  Wifi: <Wifi className="h-6 w-6" />,
  Tv: <Tv className="h-6 w-6" />,
  Flower: <Flower2 className="h-6 w-6" />,
}

// --- Testimonials data ---
const TESTIMONIALS = [
  {
    name: 'Aisha Bello',
    role: 'Resident · Lekki Phase 1',
    avatar: null,
    rating: 5,
    comment: 'Neighborly completely changed how I interact with my estate. Found a plumber in 10 minutes — verified and professional!',
  },
  {
    name: 'Chuka Okafor',
    role: 'Artisan · Electrician · Ikeja',
    avatar: null,
    rating: 5,
    comment: 'Since joining as a provider, my bookings have doubled. The platform brings trusted clients directly to me with zero hassle.',
  },
  {
    name: 'Fatima Usman',
    role: 'Estate Manager · Abuja',
    avatar: null,
    rating: 5,
    comment: 'Managing estate notices, levies, and security alerts used to be a nightmare. Now it\'s all in one place and residents actually pay on time.',
  },
  {
    name: 'Emeka Nnaji',
    role: 'Resident · GRA Port Harcourt',
    avatar: null,
    rating: 4.5,
    comment: 'The panic button feature gives our whole estate peace of mind. We\'ve used it twice and security arrived within minutes both times.',
  },
]

// --- Stats data ---
const STATS = [
  { label: 'Verified Residents', value: '12,000+', icon: <Users className="h-5 w-5" /> },
  { label: 'Service Providers', value: '3,200+', icon: <Award className="h-5 w-5" /> },
  { label: 'Estates Covered', value: '180+', icon: <MapPin className="h-5 w-5" /> },
  { label: 'Successful Bookings', value: '45,000+', icon: <TrendingUp className="h-5 w-5" /> },
]

// --- Features data ---
const FEATURES = [
  {
    icon: <ShoppingBag className="h-7 w-7" />,
    title: 'Estate Marketplace',
    desc: 'Buy, sell, and swap household items with verified neighbors. Free listings, safe local trades.',
    color: 'from-emerald-500/10 to-teal-500/10',
    iconColor: 'text-emerald-600',
  },
  {
    icon: <AlertTriangle className="h-7 w-7" />,
    title: 'Panic & Safety Alerts',
    desc: 'Instantly alert estate security and emergency contacts. Real-time location sharing in one tap.',
    color: 'from-red-500/10 to-orange-500/10',
    iconColor: 'text-red-500',
  },
  {
    icon: <Bell className="h-7 w-7" />,
    title: 'Community Notices',
    desc: 'Stay informed with estate bulletins, water schedules, power cuts, and meeting announcements.',
    color: 'from-blue-500/10 to-indigo-500/10',
    iconColor: 'text-blue-500',
  },
  {
    icon: <Shield className="h-7 w-7" />,
    title: 'Levy & Bill Payments',
    desc: 'Pay security dues, maintenance bills, and utilities online. Instant receipts via Transactpay.',
    color: 'from-violet-500/10 to-purple-500/10',
    iconColor: 'text-violet-500',
  },
  {
    icon: <Calendar className="h-7 w-7" />,
    title: 'Events & Activities',
    desc: 'RSVP to estate social events, AGMs, sports days, and community drives. Stay connected.',
    color: 'from-amber-500/10 to-yellow-500/10',
    iconColor: 'text-amber-500',
  },
  {
    icon: <MessageSquare className="h-7 w-7" />,
    title: 'Resident Chat',
    desc: 'Direct messaging with neighbors, service providers, and estate management — private and group chats.',
    color: 'from-pink-500/10 to-rose-500/10',
    iconColor: 'text-pink-500',
  },
]

// --- Featured Providers ---
const FEATURED_PROVIDERS = [
  {
    name: 'Tunde Alao',
    profession: 'Electrician',
    location: 'Lekki Phase 1',
    rating: 4.9,
    reviews: 127,
    rate: '₦5,000',
    jobs: 312,
    badge: 'Top Rated',
  },
  {
    name: 'Ngozi Madu',
    profession: 'Plumber',
    location: 'Ikeja GRA',
    rating: 4.8,
    reviews: 89,
    rate: '₦4,500',
    jobs: 201,
    badge: 'Verified',
  },
  {
    name: 'Emeka Osei',
    profession: 'AC Technician',
    location: 'Wuse 2, Abuja',
    rating: 4.7,
    reviews: 64,
    rate: '₦7,000',
    jobs: 143,
    badge: 'Fast Response',
  },
]

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [searchVal, setSearchVal] = useState('')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index)
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubscribed(true)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative overflow-hidden py-20 lg:py-36">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-hero pointer-events-none" />
        <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="animate-fade-in">
              <Badge
                variant="success"
                className="px-4 py-1.5 text-xs font-semibold rounded-full uppercase tracking-wider badge-glow-primary"
              >
                🇳🇬 Empowering Gated Communities &amp; Estates Across Nigeria
              </Badge>
            </div>

            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05] animate-fade-in delay-75">
              Your Smart{' '}
              <span className="gradient-text">Neighborhood</span>{' '}
              Companion
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto animate-fade-in delay-150">
              Connect with trusted local artisans, trade inside your estate marketplace,
              stay informed with community notices, and coordinate security alerts — all in one platform.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto animate-fade-in delay-225">
              <div className="flex items-center bg-card border border-border rounded-2xl p-2 shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all gap-2">
                <Search className="h-5 w-5 text-muted-foreground ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search plumbers, electricians, groceries..."
                  className="flex-1 bg-transparent border-0 px-2 py-2 text-sm focus:outline-none text-foreground placeholder:text-muted-foreground"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                />
                <Link href={`/services?search=${encodeURIComponent(searchVal)}`}>
                  <Button className="rounded-xl px-6 font-semibold">Search</Button>
                </Link>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 animate-fade-in delay-300">
              <Link href="/signup">
                <Button size="lg" className="font-semibold px-8 shadow-lg shadow-primary/20">
                  Join Your Estate <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="outline" className="font-semibold px-8">
                  Browse Services
                </Button>
              </Link>
            </div>

            {/* Social proof badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground animate-fade-in delay-450">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Verified residents only</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>12,000+ active users</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>180+ estates covered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== STATS ===================== */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center space-y-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto">
                  {stat.icon}
                </div>
                <div className="text-3xl font-extrabold tracking-tight text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="success" className="text-xs font-semibold rounded-full px-3 py-1">How It Works</Badge>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Up and running in 3 steps
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A simple, secure process to connect you with your neighborhood.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary/30 to-secondary/30" />

            {[
              {
                step: '01',
                color: 'bg-primary text-white',
                title: 'Verify Your Residency',
                desc: 'Sign up and select your local estate or neighborhood. We verify addresses to keep the community safe and trusted.',
              },
              {
                step: '02',
                color: 'bg-secondary text-white',
                title: 'Explore Local Services',
                desc: 'Find verified artisans, browse the marketplace, pay estate levies, or read the community notice board.',
              },
              {
                step: '03',
                color: 'bg-emerald-600 text-white',
                title: 'Collaborate Safely',
                desc: 'Book jobs, trigger panic alerts, organize tool borrowing, and coordinate with neighbors — all from one app.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-5 relative">
                <div
                  className={`h-16 w-16 mx-auto rounded-2xl ${item.color} flex items-center justify-center font-black text-xl shadow-lg`}
                >
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CATEGORIES ===================== */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="success" className="text-xs font-semibold rounded-full px-3 py-1">Service Categories</Badge>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Trusted Artisans &amp; Services
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Find verified professionals ready to serve your local estate or gated community.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link href={`/services?category=${cat.slug}`} key={cat.id}>
                <Card className="hover:border-primary text-center p-6 h-full flex flex-col items-center justify-center space-y-3 cursor-pointer group card-lift">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    {CATEGORY_ICONS[cat.icon] ?? <Wrench className="h-6 w-6" />}
                  </div>
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                    {cat.name}
                  </span>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/services">
              <Button variant="outline" className="font-semibold">
                View All Services <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== FEATURED PROVIDERS ===================== */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="success" className="text-xs font-semibold rounded-full px-3 py-1">Top Providers</Badge>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Featured Professionals
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Highly-rated artisans with verified identities and track records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_PROVIDERS.map((provider) => (
              <Card key={provider.name} className="p-6 space-y-5 card-lift group hover:border-primary">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar name={provider.name} size="lg" ring />
                    <div>
                      <h4 className="font-bold text-foreground">{provider.name}</h4>
                      <p className="text-sm text-muted-foreground">{provider.profession}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3" />
                        <span>{provider.location}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={
                    provider.badge === 'Top Rated' ? 'success' :
                    provider.badge === 'Verified' ? 'default' : 'warning'
                  }>
                    {provider.badge}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <Rating value={provider.rating} size="sm" readonly showValue />
                  <span className="text-muted-foreground">({provider.reviews} reviews)</span>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Starting from</p>
                    <p className="font-bold text-primary">{provider.rate}/hr</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Jobs done</p>
                    <p className="font-bold text-foreground">{provider.jobs}</p>
                  </div>
                  <Link href={`/providers/${provider.name.toLowerCase().replace(' ', '-')}`}>
                    <Button size="sm" className="font-semibold">Book Now</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/services">
              <Button variant="outline" className="font-semibold">
                View All Providers <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== FEATURES GRID ===================== */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="success" className="text-xs font-semibold rounded-full px-3 py-1">Platform Features</Badge>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Everything Your Estate Needs
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              One platform for safety, trade, community, and services — designed for Nigeria.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className={`relative rounded-2xl bg-gradient-to-br ${feature.color} border border-border p-6 space-y-4 card-lift`}
              >
                <div className={`h-12 w-12 rounded-xl bg-card flex items-center justify-center ${feature.iconColor} shadow-sm`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS ===================== */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="success" className="text-xs font-semibold rounded-full px-3 py-1">Testimonials</Badge>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              What Nigerians Are Saying
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Real stories from residents, providers, and estate managers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="p-5 space-y-4 card-lift flex flex-col">
                <Quote className="h-6 w-6 text-primary/40 shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">&quot;{t.comment}&quot;</p>
                <div className="border-t border-border pt-4 space-y-2">
                  <Rating value={t.rating} size="sm" readonly />
                  <div className="flex items-center gap-3">
                    <Avatar name={t.name} size="sm" />
                    <div>
                      <p className="text-sm font-bold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== WHY CHOOSE US ===================== */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="success" className="text-xs font-semibold rounded-full px-3 py-1">Why Neighborly</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
                  Designed for Safety, Local Trade &amp; Community Welfare
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you live in Lekki, Ikeja, Abuja, or Port Harcourt, Neighborly is built from the
                  ground up to address community-specific challenges Nigerians face every day.
                </p>
              </div>

              <div className="space-y-5">
                {[
                  {
                    title: 'Verified Residents Only',
                    desc: 'Addresses are validated before joining notice boards to maintain trust and safety.',
                  },
                  {
                    title: 'Emergency Alerts & Panic Trigger',
                    desc: 'Instantly alert community security and block groups during emergency hazards.',
                  },
                  {
                    title: 'Transactpay Levy Integration',
                    desc: 'Settle security bills and utility expenses directly online with instant receipts.',
                  },
                  {
                    title: 'No Strangers Allowed',
                    desc: 'Only estate-verified users can access your community space, notices, and marketplace.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start space-x-3.5">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/signup">
                <Button size="lg" className="font-semibold">
                  Get Started Today <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Preview card */}
            <div className="relative bg-gradient-to-tr from-primary/5 to-secondary/5 rounded-3xl p-8 border border-border">
              <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-primary animate-pulse" />
              <Card className="w-full shadow-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar name="Tunde Alao" size="md" ring />
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Tunde Alao</h4>
                      <p className="text-xs text-muted-foreground">Verified Electrician • Lekki</p>
                    </div>
                  </div>
                  <Rating value={4.9} size="sm" readonly showValue />
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/50 rounded-xl p-3">
                  &quot;Completed wiring repair in Block C. Highly professional service with quick turnaround.&quot;
                </p>

                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Jobs Done', val: '312' },
                    { label: 'Rating', val: '4.9★' },
                    { label: 'Response', val: '< 1hr' },
                  ].map((s) => (
                    <div key={s.label} className="bg-muted/50 rounded-xl p-2">
                      <p className="text-sm font-bold text-foreground">{s.val}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-sm font-bold text-primary">₦5,000 / hr</span>
                  <Button size="sm" className="font-semibold">Book Now</Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="success" className="text-xs font-semibold rounded-full px-3 py-1">FAQ</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">Find quick answers about using Neighborly.</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <Card
                key={idx}
                className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
                onClick={() => toggleFaq(idx)}
              >
                <div className="p-5 flex items-center justify-between">
                  <h3 className="font-bold text-base text-foreground pr-4">{faq.question}</h3>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-200 shrink-0 ${
                      faqOpen === idx ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </div>
                {faqOpen === idx && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-4 animate-slide-in-up">
                    {faq.answer}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== APP DOWNLOAD ===================== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-95" />
        <div className="absolute -top-20 right-0 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="px-4 py-1.5 text-xs font-semibold rounded-full uppercase tracking-wider">
                Mobile App Coming Soon
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Get Neighborly in Your Pocket
              </h2>
              <p className="text-emerald-100 leading-relaxed text-lg">
                Book providers on the go, chat instantly, and access estate safety controls from anywhere.
                iOS &amp; Android apps launching soon.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-5 py-3.5 transition-all">
                  <Smartphone className="h-6 w-6 text-white" />
                  <div className="text-left">
                    <p className="text-xs text-emerald-100">Get it on</p>
                    <p className="text-sm font-bold text-white">Google Play</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-5 py-3.5 transition-all">
                  <Smartphone className="h-6 w-6 text-white" />
                  <div className="text-left">
                    <p className="text-xs text-emerald-100">Download on the</p>
                    <p className="text-sm font-bold text-white">App Store</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="h-64 w-32 bg-white/10 rounded-[2rem] border border-white/20 flex flex-col items-center justify-center space-y-3 animate-float shadow-2xl">
                  <div className="h-8 w-1 rounded-full bg-white/40" />
                  <div className="h-24 w-24 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-2xl">N</span>
                  </div>
                  <p className="text-white/80 text-xs font-semibold">Neighborly</p>
                  <div className="h-3 w-8 rounded-full bg-white/40" />
                </div>
                {/* Floating notification */}
                <div className="absolute -right-16 top-10 bg-white rounded-xl p-3 shadow-xl animate-bounce-light w-40">
                  <p className="text-xs font-bold text-gray-800">🔔 New Booking!</p>
                  <p className="text-xs text-gray-500 mt-0.5">Tunde accepted your request</p>
                </div>
                <div className="absolute -left-16 bottom-10 bg-white rounded-xl p-3 shadow-xl animate-bounce-light delay-300 w-36">
                  <p className="text-xs font-bold text-gray-800">✅ Payment Done</p>
                  <p className="text-xs text-gray-500 mt-0.5">₦15,000 levy paid</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CONTACT ===================== */}
      <section className="py-24 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="success" className="text-xs font-semibold rounded-full px-3 py-1">Contact Us</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Get in Touch
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Questions about your estate, partnerships, or becoming a verified provider?
                  Our team is here to help.
                </p>
              </div>

              <div className="space-y-5">
                {[
                  {
                    icon: <Phone className="h-5 w-5 text-primary" />,
                    label: 'Phone',
                    value: '+234 801 234 5678',
                  },
                  {
                    icon: <Mail className="h-5 w-5 text-primary" />,
                    label: 'Email',
                    value: 'hello@neighborly.ng',
                  },
                  {
                    icon: <MapPin className="h-5 w-5 text-primary" />,
                    label: 'Address',
                    value: '14B Kofo Abayomi Street, Victoria Island, Lagos',
                  },
                ].map((contact) => (
                  <div key={contact.label} className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      {contact.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{contact.label}</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{contact.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter signup */}
            <Card className="p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Stay in the loop</h3>
                <p className="text-sm text-muted-foreground">
                  Get updates on new features, estate expansions, and tips for your neighborhood.
                </p>
              </div>

              {subscribed ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-foreground">You&apos;re subscribed!</p>
                    <p className="text-xs text-muted-foreground">We&apos;ll keep you posted with the latest updates.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Estate / Neighborhood</label>
                    <input
                      type="text"
                      placeholder="e.g. Lekki Phase 1"
                      className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground transition-all"
                    />
                  </div>
                  <Button type="submit" className="w-full font-semibold" size="lg">
                    <Send className="mr-2 h-4 w-4" /> Subscribe Now
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
