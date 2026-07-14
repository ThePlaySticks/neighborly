'use client'

import React, { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Users, Plus, Shield, MessageSquare, ArrowLeft, Send, Check, Lock } from 'lucide-react'

interface GroupPost {
  id: string
  sender_name: string
  content: string
  created_at: string
}

interface Group {
  id: string
  name: string
  description: string
  membersCount: number
  isJoined?: boolean
  posts: GroupPost[]
}

const DEFAULT_GROUPS: Group[] = [
  {
    id: 'grp-1',
    name: 'Security Watch & Gate Updates',
    description: 'Coordinating estate safety patrols, reporting suspicious activities, and gate access feedback.',
    membersCount: 142,
    isJoined: true,
    posts: [
      { id: 'gp1', sender_name: 'Lanre S.', content: 'Street lights on Block C are back on. Thanks management.', created_at: '2026-07-13T10:00:00Z' }
    ]
  },
  {
    id: 'grp-2',
    name: 'Fitness & Sports Club',
    description: 'Weekend morning joggers, tennis match arrangements, and general health talks.',
    membersCount: 65,
    isJoined: false,
    posts: []
  },
  {
    id: 'grp-3',
    name: 'Estate Parents Group',
    description: 'Playdates coordination, school bus sharing updates, and local kid activities reviews.',
    membersCount: 88,
    isJoined: false,
    posts: []
  },
  {
    id: 'grp-4',
    name: 'Artisans & Handymen',
    description: 'Verified estate artisan directories reviews, sharing contact lists, and feedback.',
    membersCount: 110,
    isJoined: true,
    posts: []
  }
]

export default function Groups({ params }: { params: Promise<{ site: string }> }) {
  const { site } = use(params)
  const supabase = createClient()

  const [groups, setGroups] = useState<Group[]>(DEFAULT_GROUPS)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  
  // Group feed posting
  const [newGroupPost, setNewGroupPost] = useState('')
  const [userProfile, setUserProfile] = useState<{ full_name: string } | null>(null)

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        if (profile) {
          setUserProfile(profile)
        }
      }
    }
    fetchUser()
  }, [])

  const toggleJoin = (groupId: string) => {
    setGroups(prev => prev.map(grp => {
      if (grp.id === groupId) {
        const nextJoined = !grp.isJoined
        return {
          ...grp,
          isJoined: nextJoined,
          membersCount: grp.membersCount + (nextJoined ? 1 : -1)
        }
      }
      return grp
    }))

    // Sync selectedGroup details
    if (selectedGroup?.id === groupId) {
      setSelectedGroup(prev => {
        if (!prev) return null
        const nextJoined = !prev.isJoined
        return {
          ...prev,
          isJoined: nextJoined,
          membersCount: prev.membersCount + (nextJoined ? 1 : -1)
        }
      })
    }
  }

  const handlePostToGroup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGroup || !newGroupPost.trim()) return

    const newPost: GroupPost = {
      id: `gpost-${Date.now()}`,
      sender_name: userProfile?.full_name || 'Verified Resident',
      content: newGroupPost.trim(),
      created_at: new Date().toISOString()
    }

    setGroups(prev => prev.map(grp => {
      if (grp.id === selectedGroup.id) {
        return {
          ...grp,
          posts: [newPost, ...grp.posts]
        }
      }
      return grp
    }))

    setSelectedGroup(prev => {
      if (!prev) return null
      return {
        ...prev,
        posts: [newPost, ...prev.posts]
      }
    })

    setNewGroupPost('')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-muted/20 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          
          {selectedGroup ? (
            // ============ DETAIL GROUP VIEW ============
            <div className="space-y-6">
              <button 
                onClick={() => setSelectedGroup(null)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> Back to all Groups
              </button>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-black text-foreground">{selectedGroup.name}</h2>
                  </div>
                  <p className="text-xs text-muted-foreground max-w-xl">{selectedGroup.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-semibold">{selectedGroup.membersCount} Members</span>
                  <Button 
                    variant={selectedGroup.isJoined ? 'outline' : 'primary'}
                    onClick={() => toggleJoin(selectedGroup.id)}
                    className="font-semibold text-xs py-1.5 px-4 rounded-xl flex items-center gap-1"
                  >
                    {selectedGroup.isJoined ? (
                      <>
                        <Check className="h-4 w-4" /> Joined
                      </>
                    ) : 'Join Group'}
                  </Button>
                </div>
              </div>

              {/* Group Discussion Feed Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Columns: Feed */}
                <div className="lg:col-span-2 space-y-4">
                  {selectedGroup.isJoined ? (
                    // Composer
                    <Card className="p-4 border border-border/80 bg-card shadow-sm rounded-xl">
                      <form onSubmit={handlePostToGroup} className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {userProfile?.full_name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <textarea
                            rows={2}
                            required
                            placeholder="Share an update with this group..."
                            value={newGroupPost}
                            onChange={(e) => setNewGroupPost(e.target.value)}
                            className="w-full text-xs text-foreground bg-transparent border-0 placeholder:text-muted-foreground/60 focus:outline-none resize-none pt-1"
                          />
                        </div>
                        <div className="flex justify-end pt-2 border-t border-border/40">
                          <Button type="submit" size="sm" className="font-semibold text-xs py-1 px-3">
                            Post to Group
                          </Button>
                        </div>
                      </form>
                    </Card>
                  ) : (
                    <Card className="p-6 text-center border border-dashed border-border bg-card">
                      <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-muted-foreground">You must join this group to read and participate in the discussion board.</p>
                    </Card>
                  )}

                  {/* Group Feed List */}
                  {selectedGroup.isJoined && (
                    <div className="space-y-4">
                      {selectedGroup.posts.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-8">No posts yet. Start the conversation!</p>
                      ) : (
                        selectedGroup.posts.map(gpost => (
                          <Card key={gpost.id} className="p-5 border border-border/70 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-foreground">{gpost.sender_name}</span>
                              <span className="text-[10px] text-muted-foreground">{new Date(gpost.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{gpost.content}</p>
                          </Card>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Right Columns: Rules & About */}
                <div className="space-y-4">
                  <Card className="p-4 border border-border/80 bg-card space-y-3">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Group Rules</h4>
                    <ul className="space-y-2 text-[11px] text-muted-foreground list-disc pl-4 leading-normal">
                      <li>Only verified residents of the estate are allowed in this space.</li>
                      <li>Keep discussions related directly to this group topic.</li>
                      <li>Be respectful and avoid spamming.</li>
                    </ul>
                  </Card>
                </div>

              </div>

            </div>
          ) : (
            // ============ ALL GROUPS LIST VIEW ============
            <div className="space-y-8">
              <div className="border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                    Community Groups
                  </h1>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  Topic-based hubs to connect and align with neighbors sharing similar interests.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.map(group => (
                  <Card key={group.id} className="p-6 border border-border/80 hover:border-primary transition-all flex flex-col justify-between h-full rounded-2xl">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          <h3 className="font-bold text-foreground text-base">{group.name}</h3>
                        </div>
                        {group.isJoined && <Badge variant="success" className="text-[8px]">Joined</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{group.description}</p>
                    </div>

                    <div className="border-t border-border/40 mt-6 pt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-semibold">{group.membersCount} Members</span>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toggleJoin(group.id)}
                          className="font-bold text-xs"
                        >
                          {group.isJoined ? 'Leave' : 'Join'}
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedGroup(group)}
                          className="font-bold text-xs"
                        >
                          Open Board
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
