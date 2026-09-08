'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCommunityAction } from '@/lib/actions/community'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { PlusCircle, Building, Check, ArrowRight } from 'lucide-react'

export function CommunityRegisterModal({ buttonText = 'Register Your Estate' }: { buttonText?: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [step, setStep] = useState<1 | 2>(1)
  const [estateName, setEstateName] = useState('')
  const [slug, setSlug] = useState('')
  const [communityType, setCommunityType] = useState('Gated Estate')
  const [location, setLocation] = useState('')
  const [city, setCity] = useState('Lagos')
  const [state, setState] = useState('Lagos')
  const [adminFullName, setAdminFullName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPhone, setAdminPhone] = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  const handleNameChange = (name: string) => {
    setEstateName(name)
    // auto suggest slug
    const generatedSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    setSlug(generatedSlug)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData()
    formData.append('name', estateName)
    formData.append('slug', slug)
    formData.append('communityType', communityType)
    formData.append('location', location)
    formData.append('city', city)
    formData.append('state', state)
    formData.append('country', 'Nigeria')
    formData.append('adminFullName', adminFullName)
    formData.append('adminEmail', adminEmail)
    formData.append('adminPhone', adminPhone)
    formData.append('adminPassword', adminPassword)

    const res = await createCommunityAction(formData)
    setLoading(false)

    if (res.success && res.slug) {
      setIsOpen(false)
      router.push('/manager/dashboard')
    } else {
      setError(res.error || 'Failed to create community.')
    }
  }

  const NIGERIAN_STATES = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
    'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
    'Taraba', 'Yobe', 'Zamfara'
  ]

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="rounded-xl px-6 py-3 font-semibold text-sm shadow-md gap-2"
      >
        <Building className="w-4 h-4" />
        {buttonText}
      </Button>

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Register Your Estate on Neighborly">
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-xl border border-destructive/20 font-medium">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-3.5">
              <p className="text-xs text-muted-foreground">Step 1: Community Profile</p>
              <Input
                label="Estate / Community Name"
                placeholder="e.g. Victoria Garden City"
                required
                value={estateName}
                onChange={(e) => handleNameChange(e.target.value)}
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Community Slug / Portal URL</label>
                <div className="flex items-center">
                  <span className="bg-muted px-3 py-2 text-xs rounded-l-xl border border-r-0 border-border text-muted-foreground">
                    neighborly.ng/c/
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="vgc"
                    className="flex-1 px-3 py-2 rounded-r-xl border border-border bg-card text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Location / Area"
                  placeholder="e.g. Lekki-Epe Expressway"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <Input
                  label="City"
                  placeholder="e.g. Lekki"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs focus:ring-1 focus:ring-primary outline-none"
                  >
                    {NIGERIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Community Type</label>
                  <select
                    value={communityType}
                    onChange={(e) => setCommunityType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="Gated Estate">Gated Estate</option>
                    <option value="Residents Association">Residents Association</option>
                    <option value="Serviced Apartments">Serviced Apartments</option>
                    <option value="Private Scheme">Private Scheme</option>
                  </select>
                </div>
              </div>

              <Button
                type="button"
                className="w-full rounded-xl py-3 mt-4 gap-1.5"
                disabled={!estateName || !slug || !location}
                onClick={() => setStep(2)}
              >
                Continue to Admin Details <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Step 2: Community Administrator</p>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  ← Back
                </button>
              </div>

              <Input
                label="Administrator Full Name"
                placeholder="e.g. Chief Adebayo Ogunlesi"
                required
                value={adminFullName}
                onChange={(e) => setAdminFullName(e.target.value)}
              />

              <Input
                label="Admin Email Address"
                type="email"
                placeholder="admin@estate.ng"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />

              <Input
                label="Admin Phone Number"
                type="tel"
                placeholder="+234 803 123 4567"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full rounded-xl py-3 font-semibold text-sm"
                >
                  Create &amp; Launch Community Portal
                </Button>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </>
  )
}
