'use client'

import React, { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Shield, Plus, CheckCircle, Clock, AlertTriangle, FileText, Check } from 'lucide-react'

interface Ticket {
  id: string
  subject: string
  description: string
  status: string
  created_at: string
}

export default function SupportTickets({ params }: { params: Promise<{ site: string }> }) {
  const { site } = use(params)
  const supabase = createClient()

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [estateId, setEstateId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [role, setRole] = useState('')

  // Form State
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [actioningId, setActioningId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
          
          // Get profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('estate_id, role')
            .eq('id', user.id)
            .single()

          if (profile) {
            setEstateId(profile.estate_id)
            setRole(profile.role)

            const isAdmin = profile.role === 'estate_admin' || profile.role === 'super_admin'

            // Fetch tickets
            let query = supabase.from('support_tickets').select('*')
            
            if (isAdmin) {
              // Admin gets all tickets for this estate
              query = query.eq('estate_id', profile.estate_id)
            } else {
              // Resident gets only their own tickets
              query = query.eq('resident_id', user.id)
            }

            const { data: ticketsData } = await query.order('created_at', { ascending: false })
            if (ticketsData) {
              setTickets(ticketsData)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching tickets:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [site])

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!estateId || !userId) return
    setSubmitting(true)
    setSuccessMsg('')

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          estate_id: estateId,
          resident_id: userId,
          subject,
          description,
          status: 'open'
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setTickets([data, ...tickets])
        setSubject('')
        setDescription('')
        setSuccessMsg('Support ticket submitted successfully!')
        setShowAddForm(false)
      }
    } catch (err) {
      console.error('Failed to submit ticket:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleResolveTicket = async (ticketId: string) => {
    setActioningId(ticketId)
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'resolved' })
        .eq('id', ticketId)

      if (error) throw error
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: 'resolved' } : t))
    } catch (err) {
      console.error('Failed to resolve ticket:', err)
    } finally {
      setActioningId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="text-center space-y-4">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading Support Tickets...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const isAdmin = role === 'estate_admin' || role === 'super_admin'

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-muted/20 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  Support Tickets
                </h1>
              </div>
              <p className="text-muted-foreground text-sm">
                {isAdmin ? 'Review and resolve resident complaints.' : 'File a complaint or support ticket to estate administrators.'}
              </p>
            </div>
            {!isAdmin && (
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="font-semibold rounded-xl flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Create Ticket
              </Button>
            )}
          </div>

          {/* Add Ticket Form */}
          {showAddForm && (
            <Card className="p-6 border-primary/20 bg-primary/5 animate-slide-down max-w-xl mx-auto">
              <h3 className="font-bold text-foreground text-lg mb-4 flex items-center gap-1.5">
                <FileText className="h-5 w-5 text-primary" /> File Complaint / Ticket
              </h3>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject / Issue Summary</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sewage leak near Block D"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detailed Description</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details of the issue so the estate management can resolve it."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="font-semibold">
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm flex items-center gap-2 animate-fade-in max-w-xl mx-auto">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tickets list */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground text-lg">{isAdmin ? 'Recent Estate Tickets' : 'My Support Tickets'}</h3>
            {tickets.length === 0 ? (
              <Card className="p-12 text-center py-16">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="font-bold text-foreground text-lg">No tickets filed</h3>
                <p className="text-muted-foreground text-sm mt-1">{isAdmin ? 'Everything is running smoothly.' : 'File a ticket if you experience any utility or security issues.'}</p>
              </Card>
            ) : (
              tickets.map((ticket) => (
                <Card key={ticket.id} className="p-6 border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-foreground text-lg">{ticket.subject}</h4>
                      <Badge variant={ticket.status === 'resolved' ? 'success' : 'warning'}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{ticket.description}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Submitted on {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {isAdmin && ticket.status === 'open' && (
                    <Button
                      size="sm"
                      onClick={() => handleResolveTicket(ticket.id)}
                      disabled={actioningId === ticket.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 font-semibold shrink-0"
                    >
                      <Check className="h-4 w-4" /> Resolve Ticket
                    </Button>
                  )}
                </Card>
              ))
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
