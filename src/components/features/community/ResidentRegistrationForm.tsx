'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { joinCommunityAction } from '@/lib/actions/community'
import { ResidentType } from '@/lib/dal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react'

export function ResidentRegistrationForm({
  communitySlug,
  communityName
}: {
  communitySlug: string
  communityName: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [block, setBlock] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [residentType, setResidentType] = useState<ResidentType>('Tenant')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData()
    formData.append('slug', communitySlug)
    formData.append('fullName', fullName)
    formData.append('email', email)
    formData.append('phone', phone)
    formData.append('password', password)
    formData.append('block', block)
    formData.append('houseNumber', houseNumber)
    formData.append('residentType', residentType)

    const res = await joinCommunityAction(formData)
    setLoading(false)

    if (res.success) {
      setSubmitted(true)
    } else {
      setError(res.error || 'Failed to submit registration request')
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">Request Submitted</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Your verification request for <strong className="text-foreground">{communityName}</strong> has been sent to the estate management.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-left text-xs space-y-2 max-w-sm mx-auto">
          <p className="font-semibold text-foreground">What happens next?</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
            <li>Estate admin verifies your residence ({block}, {houseNumber})</li>
            <li>Once approved, you will gain access to announcements, security gate passes, and community feed</li>
            <li>You can log in anytime to check your status</li>
          </ul>
        </div>
        <div className="pt-2">
          <Link
            href={`/c/${communitySlug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Go to Estate Portal <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-xl border border-destructive/20 font-medium">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <Input
          label="Full Name"
          placeholder="e.g. Chinedu Okafor"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="chinedu@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+234 803 123 4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Input
          label="Create Password"
          type="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="border-t border-border/60 pt-3 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Residence Details
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Block / Zone / Street"
              placeholder="e.g. Block 4"
              required
              value={block}
              onChange={(e) => setBlock(e.target.value)}
            />

            <Input
              label="House / Flat Number"
              placeholder="e.g. Flat 3B"
              required
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Resident Type
            </label>
            <select
              value={residentType}
              onChange={(e) => setResidentType(e.target.value as ResidentType)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="Tenant">Tenant / Resident</option>
              <option value="Owner">Landlord / Property Owner</option>
              <option value="Family Member">Family Member</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        isLoading={loading}
        className="w-full rounded-xl py-3 font-semibold text-xs mt-2"
      >
        Submit Registration Request
      </Button>
    </form>
  )
}
