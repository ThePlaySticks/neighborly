'use client'

import React, { useState } from 'react'
import { Community, UserProfile, Membership, Post, Announcement } from '@/lib/dal'
import { createPostAction, likePostAction, addCommentAction } from '@/lib/actions/community'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import {
  MessageSquare, Bell, Users, Calendar, ShoppingBag, Wrench, Shield,
  Send, ThumbsUp, MessageCircle, AlertTriangle, ShieldCheck, CheckCircle2,
  Sparkles, Megaphone, MapPin, Tag, Plus
} from 'lucide-react'
import Link from 'next/link'

export function CommunityFeedView({
  community,
  currentUser,
  membership,
  posts,
  announcements,
  membersCount
}: {
  community: Community
  currentUser: UserProfile
  membership: Membership
  posts: (Post & { commentsCount: number })[]
  announcements: Announcement[]
  membersCount: number
}) {
  const [postContent, setPostContent] = useState('')
  const [isOfficial, setIsOfficial] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')

  const canPostOfficial = membership.role === 'COMMUNITY_ADMIN' || membership.role === 'SUPER_ADMIN'

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postContent.trim()) return
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('communitySlug', community.slug)
    formData.append('content', postContent)
    formData.append('isOfficial', isOfficial ? 'true' : 'false')

    await createPostAction(formData)
    setPostContent('')
    setIsOfficial(false)
    setIsSubmitting(false)
  }

  const handleLike = async (postId: string) => {
    await likePostAction(postId, community.slug)
  }

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return
    const formData = new FormData()
    formData.append('postId', postId)
    formData.append('communitySlug', community.slug)
    formData.append('content', commentText)

    await addCommentAction(formData)
    setCommentText('')
    setActiveCommentPostId(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* NEXTDOOR-STYLE ESTATE COVER BANNER */}
      <div className="relative rounded-2xl overflow-hidden border border-border shadow-md mb-8 bg-muted">
        <div className="relative h-48 sm:h-60 w-full overflow-hidden">
          {community.coverImage ? (
            <img
              src={community.coverImage}
              alt={community.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/20 via-background to-primary/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-card border-2 border-white/20 text-primary flex items-center justify-center font-black text-2xl shadow-xl overflow-hidden shrink-0">
              {community.logo ? (
                <img src={community.logo} alt={community.name} className="w-full h-full object-cover" />
              ) : (
                community.name[0]
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                  {community.name}
                </h1>
                <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-300 border-emerald-400/30 backdrop-blur-sm">
                  Verified Estate
                </Badge>
              </div>
              <p className="text-xs text-white/80 mt-1 flex items-center gap-1.5 drop-shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {community.location}, {community.city} • <strong className="text-white">{membersCount}</strong> verified neighbors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {membership.role === 'COMMUNITY_ADMIN' && (
              <Link href={`/c/${community.slug}/admin`}>
                <Button size="sm" className="rounded-xl text-xs gap-1.5 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  Admin Dashboard
                </Button>
              </Link>
            )}
            <div className="text-right hidden sm:block bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <p className="text-xs font-bold text-white">{currentUser.fullName}</p>
              <p className="text-[10px] text-white/70">{membership.block} • House {membership.houseNumber}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT SIDEBAR NAVIGATION */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-4 border border-border/80 space-y-1 bg-card">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-2">
              Estate Navigation
            </p>
            <Link href={`/c/${community.slug}`} className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground shadow-sm">
              <MessageSquare className="w-4 h-4" /> Community Feed
            </Link>
            <Link href={`/c/${community.slug}/announcements`} className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <Bell className="w-4 h-4" /> Announcements
            </Link>
            <Link href={`/c/${community.slug}/residents`} className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <Users className="w-4 h-4" /> Resident Directory
            </Link>
            <Link href={`/c/${community.slug}/events`} className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <Calendar className="w-4 h-4" /> Events
            </Link>
            <Link href={`/c/${community.slug}/services`} className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <Wrench className="w-4 h-4" /> Trusted Services
            </Link>
            <Link href={`/c/${community.slug}/marketplace`} className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <ShoppingBag className="w-4 h-4" /> Marketplace
            </Link>
          </Card>

          {/* ESTATE VERIFICATION BADGE CARD */}
          <Card className="p-4 border border-primary/20 bg-primary/5 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <p className="text-xs font-bold text-foreground">Verified Resident Status</p>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              You are browsing as an approved resident of <strong>{community.name}</strong> ({membership.block}). All communication inside this feed is isolated and encrypted.
            </p>
          </Card>
        </div>

        {/* MAIN FEED CONTENT */}
        <div className="lg:col-span-6 space-y-6">
          {/* POST COMPOSER */}
          <Card className="p-4 sm:p-5 border border-border shadow-sm space-y-3 bg-card">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.fullName[0]}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{currentUser.fullName}</p>
                <p className="text-[10px] text-muted-foreground">{membership.block} • House {membership.houseNumber}</p>
              </div>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder={`Share an update, recommendation, or question with ${community.name}...`}
                rows={3}
                className="w-full p-3 rounded-xl border border-input bg-card text-xs text-foreground focus:ring-1 focus:ring-primary outline-none resize-none placeholder:text-muted-foreground/60"
              />

              <div className="flex items-center justify-between pt-1">
                <div>
                  {canPostOfficial && (
                    <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isOfficial}
                        onChange={(e) => setIsOfficial(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      Post as Estate Official
                    </label>
                  )}
                </div>

                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSubmitting}
                  disabled={!postContent.trim()}
                  className="rounded-xl px-5 text-xs font-semibold gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Post to Community
                </Button>
              </div>
            </form>
          </Card>

          {/* POSTS STREAM */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card className="p-8 text-center border border-border/80 bg-card space-y-2">
                <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <h3 className="text-sm font-bold text-foreground">No community posts yet</h3>
                <p className="text-xs text-muted-foreground">Be the first verified neighbor to share something!</p>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="p-5 border border-border/80 bg-card space-y-3.5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {post.authorName ? post.authorName[0] : 'R'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{post.authorName}</span>
                          {post.isOfficial && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary text-primary-foreground">
                              Official
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {post.authorBlock ? `${post.authorBlock} • ` : ''}
                          {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {post.images && post.images.length > 0 && (
                    <div className="rounded-xl overflow-hidden border border-border/60 max-h-80 bg-muted">
                      <img
                        src={post.images[0]}
                        alt="Post media"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.likesCount || 0} Likes</span>
                    </button>

                    <button
                      onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                      className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{post.commentsCount || 0} Comments</span>
                    </button>
                  </div>

                  {activeCommentPostId === post.id && (
                    <div className="pt-3 border-t border-border/40 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a comment..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-input bg-card text-foreground focus:ring-1 focus:ring-primary outline-none"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(post.id)}
                          className="rounded-xl text-xs px-3"
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: OFFICIAL ANNOUNCEMENTS & INFO */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-4 border border-border space-y-3 bg-card">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground">Official Notices</h3>
              </div>
              <Link href={`/c/${community.slug}/announcements`} className="text-[10px] text-primary hover:underline font-semibold">
                View All
              </Link>
            </div>

            {announcements.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No active announcements</p>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((ann) => (
                  <div key={ann.id} className="space-y-1 p-2.5 rounded-xl bg-muted/40 border border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-primary">
                        {ann.category}
                      </span>
                      {ann.priority === 'high' || ann.priority === 'urgent' ? (
                        <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                          Urgent
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs font-bold text-foreground">{ann.title}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
