'use client'

import React, { useState } from 'react'
import { Membership, UserProfile } from '@/lib/dal'
import { updateResidentStatusAction } from '@/lib/actions/community'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Check, X, Shield, Clock, AlertCircle } from 'lucide-react'

export function AdminResidentRequests({
  communitySlug,
  requests
}: {
  communitySlug: string
  requests: (Membership & { user: UserProfile })[]
}) {
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<{ [id: string]: string }>({})
  const [showRejectInput, setShowRejectInput] = useState<{ [id: string]: boolean }>({})

  const handleApprove = async (membershipId: string) => {
    setActioningId(membershipId)
    await updateResidentStatusAction({
      membershipId,
      status: 'APPROVED',
      communitySlug
    })
    setActioningId(null)
  }

  const handleReject = async (membershipId: string) => {
    setActioningId(membershipId)
    await updateResidentStatusAction({
      membershipId,
      status: 'REJECTED',
      communitySlug,
      rejectionReason: rejectReason[membershipId] || 'Resident details could not be verified by estate management.'
    })
    setActioningId(null)
  }

  if (requests.length === 0) {
    return (
      <Card className="p-8 text-center border border-border bg-card space-y-2">
        <Check className="w-8 h-8 text-primary/60 mx-auto" />
        <h3 className="text-sm font-bold text-foreground">All caught up!</h3>
        <p className="text-xs text-muted-foreground">
          There are currently no pending resident verification requests for this estate.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <Card key={req.id} className="p-5 border border-amber-500/20 bg-amber-500/[0.02] shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm shrink-0">
                {req.user.fullName[0]}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">{req.user.fullName}</p>
                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/30">
                    {req.residentType}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong>{req.block}</strong> • House <strong>{req.houseNumber}</strong>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Email: {req.user.email} {req.user.phone ? `• Phone: ${req.user.phone}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => handleApprove(req.id)}
                isLoading={actioningId === req.id}
                className="rounded-xl text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="w-3.5 h-3.5" /> Approve Resident
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRejectInput({ ...showRejectInput, [req.id]: !showRejectInput[req.id] })}
                className="rounded-xl text-xs font-semibold gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/30"
              >
                <X className="w-3.5 h-3.5" /> Reject
              </Button>
            </div>
          </div>

          {showRejectInput[req.id] && (
            <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 space-y-2">
              <input
                type="text"
                placeholder="Optional rejection reason (e.g. Unmatched house number)..."
                value={rejectReason[req.id] || ''}
                onChange={(e) => setRejectReason({ ...rejectReason, [req.id]: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-card text-xs focus:ring-1 focus:ring-destructive outline-none"
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(req.id)}
                  isLoading={actioningId === req.id}
                  className="rounded-lg text-xs"
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
