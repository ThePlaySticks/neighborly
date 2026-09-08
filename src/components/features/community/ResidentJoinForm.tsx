'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { joinCommunityAction } from '@/lib/actions/community'
import { UserProfile, ResidentType } from '@/lib/dal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function ResidentJoinForm({
  communitySlug,
  currentUser
}: {
  communitySlug: string
  currentUser: UserProfile | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState(currentUser?.fullName || '')
  const [email, setEmail] = useState(currentUser?.email || '')
  const [phone, setPhone] = useState(currentUser?.phone || '')
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
    formData.append('password', password || 'resident123')
    formData.append('block', block)
    formData.append('houseNumber', houseNumber)
    formData.append('residentType', residentType)

    const res = await joinCommunityAction(formData)
    setLoading(false)

    if (res.success) {
      router.push(`/c/${communitySlug}`)
      router.refresh()
    } else {
      setError(res.error || 'Failed to submit registration request')
    }
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

        {!currentUser && (
          <Input
            label="Create Password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        <div className="border-t border-border/60 pt-3 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Estate Residence Details
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
              placeholder="e.g. House 23"
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
              <option value="Owner">Landlord / Property Owner</option>
              <option value="Tenant">Tenant / Resident</option>
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
        Submit Membership Request
      </Button>
    </form>
  )
}
