'use client'

import React, { use, useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MessageSquare, Send, User } from 'lucide-react'

interface Message {
  id: string
  profile_id: string
  sender_name: string
  content: string
  created_at: string
}

export default function CommunityChat({ params }: { params: Promise<{ site: string }> }) {
  const { site } = use(params)
  const supabase = createClient()

  const [messages, setMessages] = useState<Message[]>([])
  const [estateId, setEstateId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messageEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
          
          // Get profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('estate_id, full_name')
            .eq('id', user.id)
            .single()

          if (profile) {
            setEstateId(profile.estate_id)
            setUserName(profile.full_name || 'Resident')

            // Fetch recent messages
            const { data: messagesData } = await supabase
              .from('estate_messages')
              .select('*')
              .eq('estate_id', profile.estate_id)
              .order('created_at', { ascending: true })

            if (messagesData) {
              setMessages(messagesData)
            }

            // Subscribe to real-time chat messages
            const channel = supabase
              .channel(`estate-chat-${profile.estate_id}`)
              .on(
                'postgres_changes',
                {
                  event: 'INSERT',
                  schema: 'public',
                  table: 'estate_messages',
                  filter: `estate_id=eq.${profile.estate_id}`
                },
                (payload: any) => {
                  setMessages((prev) => [...prev, payload.new as Message])
                }
              )
              .subscribe()

            return () => {
              supabase.removeChannel(channel)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching chat messages:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [site])

  // Scroll to bottom when messages update
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !estateId || !userId) return
    setSending(true)

    try {
      const { error } = await supabase
        .from('estate_messages')
        .insert({
          estate_id: estateId,
          profile_id: userId,
          sender_name: userName,
          content: newMessage.trim()
        })

      if (error) throw error
      setNewMessage('')
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="text-center space-y-4">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading Community Chat...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-muted/20 py-8 flex flex-col items-center">
        <div className="w-full max-w-3xl px-4 flex flex-col h-[70vh] space-y-4">
          
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border pb-3 shrink-0">
            <MessageSquare className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">Community Chat</h1>
              <p className="text-muted-foreground text-xs">Chat live with your verified neighbors.</p>
            </div>
          </div>

          {/* Messages Area */}
          <Card className="flex-1 overflow-y-auto p-4 space-y-4 border border-border min-h-0 bg-card">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <MessageSquare className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm">No messages yet. Send a message to start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isMe = message.profile_id === userId
                return (
                  <div
                    key={message.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <span className="text-[10px] font-bold text-muted-foreground px-1">
                      {isMe ? 'You' : message.sender_name}
                    </span>
                    <div
                      className={`max-w-md rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${
                        isMe
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-muted text-foreground rounded-tl-none'
                      }`}
                    >
                      {message.content}
                    </div>
                    <span className="text-[9px] text-muted-foreground px-1">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })
            )}
            <div ref={messageEndRef} />
          </Card>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0">
            <input
              type="text"
              required
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" disabled={sending} className="rounded-xl px-5 font-semibold flex items-center gap-1.5">
              <Send className="h-4 w-4" /> Send
            </Button>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  )
}
