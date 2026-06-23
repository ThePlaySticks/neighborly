'use client'

import React, { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Key, Users, Plus, CheckCircle, Copy, AlertTriangle } from 'lucide-react'

interface VisitorLog {
  id: string
  visitor_name: string
  check_in_code: string
  status: string
  created_at: string
}

export default function VisitorManager({ params }: { params: Promise<{ site: string }> }) {
  const { site } = use(params)
  const supabase = createClient()

  const [logs, setLogs] = useState<VisitorLog[]>([])
  const [estateId, setEstateId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  
  const [visitorName, setVisitorName] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
          
          // Get profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('estate_id')
            .eq('id', user.id)
            .single()

          if (profile) {
            setEstateId(profile.estate_id)

            // Fetch visitor logs
            const { data: logsData } = await supabase
              .from('visitor_logs')
              .select('*')
              .eq('resident_id', user.id)
              .order('created_at', { ascending: false })

            if (logsData) {
              setLogs(logsData)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching guest codes:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [site])

  const generatePasscode = () => {
    // Generate a secure 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedCode(code)
  }

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!estateId || !userId || !generatedCode) return
    setSubmitting(true)
    setSuccessMsg('')

    try {
      const { data, error } = await supabase
        .from('visitor_logs')
        .insert({
          estate_id: estateId,
          resident_id: userId,
          visitor_name: visitorName,
          check_in_code: generatedCode,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setLogs([data, ...logs])
        setVisitorName('')
        setGeneratedCode('')
        setSuccessMsg('Access passcode generated successfully!')
        setShowAddForm(false)
      }
    } catch (err) {
      console.error('Failed to generate code:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCodeId(id)
    setTimeout(() => setCopiedCodeId(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="text-center space-y-4">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading Visitor Manager...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-muted/20 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Key className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  Guest Access Codes
                </h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Generate secure, temporary entry codes for your visitors to present at the gate.
              </p>
            </div>
            <Button
              onClick={() => { setShowAddForm(!showAddForm); generatePasscode() }}
              className="font-semibold rounded-xl flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add Visitor
            </Button>
          </div>

          {/* New Code Form */}
          {showAddForm && (
            <Card className="p-6 border-primary/20 bg-primary/5 animate-slide-down max-w-lg mx-auto">
              <h3 className="font-bold text-foreground text-lg mb-4 flex items-center gap-1.5">
                <Users className="h-5 w-5 text-primary" /> Create Visitor Entry Passcode
              </h3>
              <form onSubmit={handleCreateCode} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visitor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kolawole Davies"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Generated Access Passcode</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedCode}
                      className="flex-1 rounded-xl border border-input bg-muted/50 px-4 py-2.5 text-center font-mono font-bold text-lg text-foreground focus:outline-none"
                    />
                    <Button type="button" onClick={generatePasscode} variant="outline">
                      Regenerate
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="font-semibold">
                    {submitting ? 'Generating...' : 'Confirm & Save'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm flex items-center gap-2 animate-fade-in max-w-lg mx-auto">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Active Visitor codes list */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground text-lg">Active Visitor Passcodes</h3>
            {logs.length === 0 ? (
              <Card className="p-12 text-center py-16">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="font-bold text-foreground text-lg">No guest codes generated</h3>
                <p className="text-muted-foreground text-sm mt-1">Generate a passcode when inviting guests for seamless gate check-in.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {logs.map((log) => (
                  <Card key={log.id} className="p-5 border border-border flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
                    <div className="space-y-1">
                      <h4 className="font-bold text-foreground">{log.visitor_name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-primary text-xl tracking-wider">{log.check_in_code}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(log.check_in_code, log.id)}
                          className="h-7 w-7 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        {copiedCodeId === log.id && (
                          <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Issued on {new Date(log.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <Badge variant={
                        log.status === 'checked_in' ? 'success' :
                        log.status === 'checked_out' ? 'default' : 'warning'
                      }>
                        {log.status === 'checked_in' ? 'Inside' :
                         log.status === 'checked_out' ? 'Checked Out' : 'Pending Gate'}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
