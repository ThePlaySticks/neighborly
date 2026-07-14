'use client'

import React, { use, useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MessageSquare, Send, User, ChevronRight, Circle, CheckCheck, Shield } from 'lucide-react'

interface Message {
  id: string
  profile_id: string
  sender_name: string
  content: string
  created_at: string
}

interface ChatRoom {
  id: string
  name: string
  type: 'channel' | 'dm'
  avatarText: string
  online?: boolean
  unreadCount?: number
  messages: Message[]
}

export default function CommunityChat({ params }: { params: Promise<{ site: string }> }) {
  const { site } = use(params)
  const supabase = createClient()

  const [activeRoomId, setActiveRoomId] = useState<string>('channel-general')
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  
  const [estateId, setEstateId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  
  const messageEndRef = useRef<HTMLDivElement>(null)

  // Initialize and load channels & simulated DMs
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('estate_id, full_name')
            .eq('id', user.id)
            .single()

          if (profile) {
            setEstateId(profile.estate_id)
            setUserName(profile.full_name || 'Resident')

            // Fetch public channel messages
            const { data: messagesData } = await supabase
              .from('estate_messages')
              .select('*')
              .eq('estate_id', profile.estate_id)
              .order('created_at', { ascending: true })

            const publicMessages = messagesData || []

            // Setup channels list
            const initialRooms: ChatRoom[] = [
              {
                id: 'channel-general',
                name: '📢 Estate Announcements Chat',
                type: 'channel',
                avatarText: '📢',
                messages: publicMessages
              },
              {
                id: 'dm-bello',
                name: 'Alhaji Bello (Gate Security)',
                type: 'dm',
                avatarText: 'AB',
                online: true,
                unreadCount: 1,
                messages: [
                  { id: 'm1', profile_id: 'bello-id', sender_name: 'Alhaji Bello', content: 'Good morning, please confirm if you generated code 495832 for your guest.', created_at: new Date(Date.now() - 3600000).toISOString() }
                ]
              },
              {
                id: 'dm-toyin',
                name: 'Mrs. Toyin Jacobs (Dweller)',
                type: 'dm',
                avatarText: 'TJ',
                online: false,
                messages: [
                  { id: 'm2', profile_id: 'toyin-id', sender_name: 'Mrs. Toyin Jacobs', content: 'Yes, thank you for sharing max photo in the fitness group! We found him.', created_at: new Date(Date.now() - 7200000).toISOString() }
                ]
              }
            ]
            
            setRooms(initialRooms)

            // Real-time subscription for public chat
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
                  setRooms(prev => prev.map(r => {
                    if (r.id === 'channel-general') {
                      return {
                        ...r,
                        messages: [...r.messages, payload.new as Message]
                      }
                    }
                    return r
                  }))
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

  // Scroll to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [rooms, activeRoomId, isTyping])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId) return
    setSending(true)

    const textToSend = newMessage.trim()
    setNewMessage('')

    try {
      if (activeRoomId === 'channel-general' && estateId) {
        // Post to Supabase database for general chat
        const { error } = await supabase
          .from('estate_messages')
          .insert({
            estate_id: estateId,
            profile_id: userId,
            sender_name: userName,
            content: textToSend
          })
        if (error) throw error
      } else {
        // Simulated Direct Message workflow
        const sentMessage: Message = {
          id: `msg-${Date.now()}`,
          profile_id: userId,
          sender_name: userName,
          content: textToSend,
          created_at: new Date().toISOString()
        }

        setRooms(prev => prev.map(r => {
          if (r.id === activeRoomId) {
            return {
              ...r,
              messages: [...r.messages, sentMessage]
            }
          }
          return r
        }))

        // Simulate reply from receiver after 2 seconds
        setIsTyping(true)
        setTimeout(() => {
          setIsTyping(false)
          const replyMessage: Message = {
            id: `reply-${Date.now()}`,
            profile_id: 'simulated-id',
            sender_name: activeRoomId === 'dm-bello' ? 'Alhaji Bello' : 'Mrs. Toyin Jacobs',
            content: 'Received that. Thank you for confirmation!',
            created_at: new Date().toISOString()
          }

          setRooms(prev => prev.map(r => {
            if (r.id === activeRoomId) {
              return {
                ...r,
                messages: [...r.messages, replyMessage]
              }
            }
            return r
          }))
        }, 2000)
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  const activeRoom = rooms.find(r => r.id === activeRoomId)

  const selectRoom = (roomId: string) => {
    setActiveRoomId(roomId)
    // Clear unreads
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return { ...r, unreadCount: undefined }
      }
      return r
    }))
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
        <div className="w-full max-w-6xl px-4 flex flex-col lg:flex-row h-[75vh] gap-6">
          
          {/* Left panel: Channels and DM List */}
          <aside className="w-full lg:w-80 shrink-0 flex flex-col h-full bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border/40 shrink-0">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-primary" /> Conversations
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-1">Channels</p>
              {rooms.filter(r => r.type === 'channel').map(room => (
                <button
                  key={room.id}
                  onClick={() => selectRoom(room.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeRoomId === room.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <span className="text-base shrink-0">{room.avatarText}</span>
                  <span className="truncate flex-1">{room.name}</span>
                </button>
              ))}

              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-2 mt-2">Direct Messages</p>
              {rooms.filter(r => r.type === 'dm').map(room => (
                <button
                  key={room.id}
                  onClick={() => selectRoom(room.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeRoomId === room.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-[10px] text-foreground border border-border">
                      {room.avatarText}
                    </div>
                    {room.online && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                    )}
                  </div>
                  <span className="truncate flex-1">{room.name}</span>
                  {room.unreadCount && (
                    <Badge variant="default" className="text-[8px] px-1.5 py-0">{room.unreadCount}</Badge>
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* Right panel: Active Chat conversation box */}
          <section className="flex-1 flex flex-col h-full bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            {activeRoom ? (
              <>
                {/* Chat window Header */}
                <div className="p-4 border-b border-border/40 shrink-0 flex justify-between items-center bg-muted/20">
                  <div className="flex items-center gap-3">
                    {activeRoom.type === 'dm' && (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-foreground">
                        {activeRoom.avatarText}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{activeRoom.name}</h4>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        {activeRoom.type === 'channel' ? 'Public estate bulletin chat' : activeRoom.online ? 'Active Now' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages board */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-muted/[0.03]">
                  {activeRoom.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                      <MessageSquare className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-xs">No messages yet. Say hello to get started!</p>
                    </div>
                  ) : (
                    activeRoom.messages.map((message) => {
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
                            className={`max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                              isMe
                                ? 'bg-primary text-white rounded-tr-none'
                                : 'bg-card text-foreground border border-border/60 rounded-tl-none'
                            }`}
                          >
                            {message.content}
                          </div>
                          <div className="flex items-center gap-1 px-1">
                            <span className="text-[8px] text-muted-foreground">
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && <CheckCheck className="h-3 w-3 text-primary shrink-0" />}
                          </div>
                        </div>
                      )
                    })
                  )}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pl-1">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" />
                        <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                      <span>Neighbor is typing...</span>
                    </div>
                  )}

                  <div ref={messageEndRef} />
                </div>

                {/* Message Send Form input bar */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-border/40 shrink-0 bg-card flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full rounded-xl border border-input bg-card px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()} className="font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-1">
                    <Send className="h-3.5 w-3.5" /> Send
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-3 opacity-40" />
                <h4 className="font-bold text-foreground">No Conversation Selected</h4>
                <p className="text-muted-foreground text-xs max-w-xs mt-1">Select a discussion channel or start a private direct chat on the left.</p>
              </div>
            )}
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
