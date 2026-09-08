import fs from 'fs'
import path from 'path'

export interface UserProfile {
  id: string
  fullName: string
  email: string
  phone?: string
  avatarUrl?: string
  passwordHash?: string
  createdAt: string
  updatedAt: string
}

export interface Community {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  coverImage?: string
  location: string
  city: string
  state: string
  country: string
  communityType: string
  status: 'active' | 'suspended' | 'pending'
  createdAt: string
  updatedAt: string
}

export type MembershipRole = 'SUPER_ADMIN' | 'COMMUNITY_ADMIN' | 'RESIDENT'
export type MembershipStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
export type ResidentType = 'Owner' | 'Tenant' | 'Family Member' | 'Other'

export interface Membership {
  id: string
  userId: string
  communityId: string
  role: MembershipRole
  status: MembershipStatus
  houseNumber: string
  block: string
  residentType: ResidentType
  verificationStatus: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export interface Post {
  id: string
  communityId: string
  authorId: string
  authorName?: string
  authorBlock?: string
  content: string
  images: string[]
  isOfficial: boolean
  likesCount: number
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  authorName?: string
  content: string
  createdAt: string
}

export interface Announcement {
  id: string
  communityId: string
  authorId: string
  authorName?: string
  title: string
  content: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category: 'General' | 'Security' | 'Maintenance' | 'Emergency' | 'Utilities' | 'Finance'
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: string
  communityId: string
  creatorId: string
  creatorName?: string
  title: string
  description: string
  date: string
  location: string
  createdAt: string
}

export interface ServiceProvider {
  id: string
  communityId: string
  name: string
  category: string
  rating: number
  description: string
  phone: string
  createdAt: string
}

export interface MarketplaceItem {
  id: string
  communityId: string
  sellerId: string
  sellerName?: string
  title: string
  description: string
  price: number
  images: string[]
  status: 'available' | 'sold'
  createdAt: string
}

export interface DatabaseState {
  users: UserProfile[]
  communities: Community[]
  memberships: Membership[]
  posts: Post[]
  comments: Comment[]
  announcements: Announcement[]
  events: Event[]
  serviceProviders: ServiceProvider[]
  marketplaceItems: MarketplaceItem[]
}

const DB_FILE = path.resolve(process.cwd(), '.data', 'neighborly_db.json')

function getInitialState(): DatabaseState {
  return {
    users: [
      {
        id: 'usr-admin-banana',
        fullName: 'Folake Adeleke',
        email: 'admin@bananaisland.ng',
        phone: '+234 802 111 2233',
        passwordHash: 'admin123',
        createdAt: '2026-01-01T08:00:00.000Z',
        updatedAt: '2026-01-01T08:00:00.000Z'
      },
      {
        id: 'usr-resident-chinedu',
        fullName: 'Chinedu Okafor',
        email: 'chinedu@example.com',
        phone: '+234 803 222 3344',
        passwordHash: 'resident123',
        createdAt: '2026-01-05T09:00:00.000Z',
        updatedAt: '2026-01-05T09:00:00.000Z'
      },
      {
        id: 'usr-resident-aisha',
        fullName: 'Aisha Bello',
        email: 'aisha@example.com',
        phone: '+234 805 333 4455',
        passwordHash: 'resident123',
        createdAt: '2026-01-10T10:00:00.000Z',
        updatedAt: '2026-01-10T10:00:00.000Z'
      },
      {
        id: 'usr-admin-lekki',
        fullName: 'Dr. Babatunde Pedro',
        email: 'admin@lekkiphase1.ng',
        phone: '+234 807 444 5566',
        passwordHash: 'admin123',
        createdAt: '2026-01-01T08:00:00.000Z',
        updatedAt: '2026-01-01T08:00:00.000Z'
      }
    ],
    communities: [
      {
        id: 'comm-banana-island',
        name: 'Banana Island Estate',
        slug: 'banana-island',
        description: 'Premier private artificial island residential community off Ikoyi, Lagos.',
        location: 'Ikoyi Peninsula',
        city: 'Ikoyi',
        state: 'Lagos',
        country: 'Nigeria',
        communityType: 'Private Gated Island',
        status: 'active',
        createdAt: '2026-01-01T08:00:00.000Z',
        updatedAt: '2026-01-01T08:00:00.000Z'
      },
      {
        id: 'comm-lekki-1',
        name: 'Lekki Phase 1 Scheme',
        slug: 'lekki-phase-1',
        description: 'Vibrant residential estate community in the heart of Lekki peninsula.',
        location: 'Lekki Peninsula 1',
        city: 'Lekki',
        state: 'Lagos',
        country: 'Nigeria',
        communityType: 'Residential Gated Estate',
        status: 'active',
        createdAt: '2026-01-01T08:00:00.000Z',
        updatedAt: '2026-01-01T08:00:00.000Z'
      },
      {
        id: 'comm-emerald',
        name: 'Emerald Estate',
        slug: 'emerald-estate',
        description: 'Tranquil family-friendly secured estate along Monastery Road, Sangotedo.',
        location: 'Sangotedo Lekki-Epe Expressway',
        city: 'Sangotedo',
        state: 'Lagos',
        country: 'Nigeria',
        communityType: 'Gated Residential Community',
        status: 'active',
        createdAt: '2026-01-02T08:00:00.000Z',
        updatedAt: '2026-01-02T08:00:00.000Z'
      }
    ],
    memberships: [
      {
        id: 'mem-1',
        userId: 'usr-admin-banana',
        communityId: 'comm-banana-island',
        role: 'COMMUNITY_ADMIN',
        status: 'APPROVED',
        houseNumber: '1',
        block: 'Zone A',
        residentType: 'Owner',
        verificationStatus: 'verified',
        createdAt: '2026-01-01T08:00:00.000Z',
        updatedAt: '2026-01-01T08:00:00.000Z'
      },
      {
        id: 'mem-2',
        userId: 'usr-resident-chinedu',
        communityId: 'comm-banana-island',
        role: 'RESIDENT',
        status: 'APPROVED',
        houseNumber: '23',
        block: 'Block 4',
        residentType: 'Tenant',
        verificationStatus: 'verified',
        createdAt: '2026-01-05T09:00:00.000Z',
        updatedAt: '2026-01-05T09:00:00.000Z'
      },
      {
        id: 'mem-3',
        userId: 'usr-resident-aisha',
        communityId: 'comm-banana-island',
        role: 'RESIDENT',
        status: 'APPROVED',
        houseNumber: '12',
        block: 'Block 7',
        residentType: 'Owner',
        verificationStatus: 'verified',
        createdAt: '2026-01-10T10:00:00.000Z',
        updatedAt: '2026-01-10T10:00:00.000Z'
      },
      {
        id: 'mem-4',
        userId: 'usr-admin-lekki',
        communityId: 'comm-lekki-1',
        role: 'COMMUNITY_ADMIN',
        status: 'APPROVED',
        houseNumber: 'Plot 18',
        block: 'Admiralty Way',
        residentType: 'Owner',
        verificationStatus: 'verified',
        createdAt: '2026-01-01T08:00:00.000Z',
        updatedAt: '2026-01-01T08:00:00.000Z'
      }
    ],
    posts: [
      {
        id: 'post-b1',
        communityId: 'comm-banana-island',
        authorId: 'usr-admin-banana',
        authorName: 'Estate Management',
        authorBlock: 'Zone A',
        content: 'Water supply pipeline maintenance scheduled for tomorrow from 10:00 AM to 2:00 PM. Please store water in advance.',
        images: [],
        isOfficial: true,
        likesCount: 14,
        createdAt: '2026-03-01T09:00:00.000Z',
        updatedAt: '2026-03-01T09:00:00.000Z'
      },
      {
        id: 'post-b2',
        communityId: 'comm-banana-island',
        authorId: 'usr-resident-chinedu',
        authorName: 'Chinedu Okafor',
        authorBlock: 'Block 4',
        content: 'Does anyone know a reliable electrician who can assist with an inverter & solar changeover setup today?',
        images: [],
        isOfficial: false,
        likesCount: 5,
        createdAt: '2026-03-02T11:30:00.000Z',
        updatedAt: '2026-03-02T11:30:00.000Z'
      },
      {
        id: 'post-l1',
        communityId: 'comm-lekki-1',
        authorId: 'usr-admin-lekki',
        authorName: 'Lekki 1 Security Committee',
        authorBlock: 'Admiralty',
        content: 'Security briefing: Admiralty Gate 2 access cards are currently undergoing biometric upgrade.',
        images: [],
        isOfficial: true,
        likesCount: 8,
        createdAt: '2026-03-01T10:00:00.000Z',
        updatedAt: '2026-03-01T10:00:00.000Z'
      }
    ],
    comments: [
      {
        id: 'com-1',
        postId: 'post-b2',
        authorId: 'usr-resident-aisha',
        authorName: 'Aisha Bello',
        content: 'Try Tunde Electrical from the Services tab, he installed our 5kVA system last month and was excellent!',
        createdAt: '2026-03-02T12:15:00.000Z'
      }
    ],
    announcements: [
      {
        id: 'ann-1',
        communityId: 'comm-banana-island',
        authorId: 'usr-admin-banana',
        authorName: 'Estate Management',
        title: 'Quarterly Estate Residents General Meeting',
        content: 'The Q1 General Meeting will take place at the Community Clubhouse on Saturday at 10:00 AM. Agenda includes gate security upgrade, road resurfacing, and estate levy reconciliation.',
        priority: 'high',
        category: 'General',
        createdAt: '2026-03-01T08:00:00.000Z',
        updatedAt: '2026-03-01T08:00:00.000Z'
      },
      {
        id: 'ann-2',
        communityId: 'comm-banana-island',
        authorId: 'usr-admin-banana',
        authorName: 'Security Desk',
        title: 'New Visitor QR Code System at Main Gate',
        content: 'All residents are advised to generate visitor gate passcodes via the portal for incoming visitors to minimize queueing at the entrance gate.',
        priority: 'normal',
        category: 'Security',
        createdAt: '2026-02-28T14:00:00.000Z',
        updatedAt: '2026-02-28T14:00:00.000Z'
      }
    ],
    events: [
      {
        id: 'evt-1',
        communityId: 'comm-banana-island',
        creatorId: 'usr-admin-banana',
        creatorName: 'Sports Committee',
        title: 'Annual Banana Island Friendly Football Tournament',
        description: 'Zone A vs Zone B friendly football match at the estate sports complex.',
        date: 'Saturday, March 14, 2026 • 4:00 PM',
        location: 'Estate Sports Pavilion',
        createdAt: '2026-03-01T12:00:00.000Z'
      }
    ],
    serviceProviders: [
      {
        id: 'srv-1',
        communityId: 'comm-banana-island',
        name: 'Tunde Alao Electrical & Solar',
        category: 'Electrician',
        rating: 4.9,
        description: 'Certified installer for inverters, solar panels, and domestic wiring troubleshooting.',
        phone: '+234 802 333 4455',
        createdAt: '2026-01-15T09:00:00.000Z'
      },
      {
        id: 'srv-2',
        communityId: 'comm-banana-island',
        name: 'Chuks Plumbing Solutions',
        category: 'Plumber',
        rating: 4.8,
        description: 'Borehole water treatment, water pump repair, and pipe installation specialist.',
        phone: '+234 803 444 5566',
        createdAt: '2026-01-20T10:00:00.000Z'
      }
    ],
    marketplaceItems: [
      {
        id: 'mkt-1',
        communityId: 'comm-banana-island',
        sellerId: 'usr-resident-chinedu',
        sellerName: 'Chinedu Okafor',
        title: 'Used Samsung 65" 4K Smart TV (QLED)',
        description: 'Like new condition, pristine display, includes wall mount and remote. Relocating sales.',
        price: 450000,
        images: [],
        status: 'available',
        createdAt: '2026-03-02T14:00:00.000Z'
      }
    ]
  }
}

function loadDatabase(): DatabaseState {
  try {
    const dir = path.dirname(DB_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    if (!fs.existsSync(DB_FILE)) {
      const init = getInitialState()
      fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2), 'utf-8')
      return init
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(raw) as DatabaseState
  } catch (err) {
    console.error('Error loading DB file, falling back to memory state:', err)
    return getInitialState()
  }
}

function saveDatabase(state: DatabaseState): void {
  try {
    const dir = path.dirname(DB_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error saving DB file:', err)
  }
}

// ==================== DATA ACCESS METHODS ====================

export const dal = {
  // Communities
  getCommunityBySlug(slug: string): Community | null {
    const db = loadDatabase()
    return db.communities.find(c => c.slug.toLowerCase() === slug.toLowerCase().trim()) || null
  },

  getCommunityById(id: string): Community | null {
    const db = loadDatabase()
    return db.communities.find(c => c.id === id) || null
  },

  getAllCommunities(): Community[] {
    const db = loadDatabase()
    return db.communities.filter(c => c.status === 'active')
  },

  createCommunityWithAdmin(params: {
    name: string
    slug: string
    communityType: string
    location: string
    city: string
    state: string
    country: string
    adminFullName: string
    adminEmail: string
    adminPhone?: string
    adminPassword: string
  }): { community: Community; adminUser: UserProfile; membership: Membership } {
    const db = loadDatabase()

    const cleanSlug = params.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '')
    const existingComm = db.communities.find(c => c.slug === cleanSlug)
    if (existingComm) {
      throw new Error(`A community with slug "${cleanSlug}" already exists. Please choose another slug.`)
    }

    const now = new Date().toISOString()
    const communityId = 'comm-' + cleanSlug + '-' + Math.random().toString(36).substring(2, 7)

    const newCommunity: Community = {
      id: communityId,
      name: params.name.trim(),
      slug: cleanSlug,
      description: `Official digital portal for ${params.name.trim()}`,
      location: params.location.trim(),
      city: params.city.trim(),
      state: params.state.trim(),
      country: params.country.trim() || 'Nigeria',
      communityType: params.communityType || 'Gated Estate',
      status: 'active',
      createdAt: now,
      updatedAt: now
    }

    // Check or create admin user
    let user = db.users.find(u => u.email.toLowerCase() === params.adminEmail.toLowerCase().trim())
    if (!user) {
      user = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        fullName: params.adminFullName.trim(),
        email: params.adminEmail.toLowerCase().trim(),
        phone: params.adminPhone?.trim() || '',
        passwordHash: params.adminPassword,
        createdAt: now,
        updatedAt: now
      }
      db.users.push(user)
    }

    const newMembership: Membership = {
      id: 'mem-' + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      communityId: newCommunity.id,
      role: 'COMMUNITY_ADMIN',
      status: 'APPROVED',
      houseNumber: 'Admin Office',
      block: 'Management',
      residentType: 'Owner',
      verificationStatus: 'verified',
      createdAt: now,
      updatedAt: now
    }

    db.communities.push(newCommunity)
    db.memberships.push(newMembership)

    // Add initial announcement
    db.announcements.push({
      id: 'ann-' + Math.random().toString(36).substring(2, 9),
      communityId: newCommunity.id,
      authorId: user.id,
      authorName: params.adminFullName.trim(),
      title: `Welcome to ${params.name.trim()} Portal!`,
      content: `Welcome to our private digital community. Verified residents can view notices, connect with neighbors, list marketplace items, and discover trusted service providers.`,
      priority: 'high',
      category: 'General',
      createdAt: now,
      updatedAt: now
    })

    saveDatabase(db)
    return { community: newCommunity, adminUser: user, membership: newMembership }
  },

  // Users & Auth
  findUserByEmail(email: string): UserProfile | null {
    const db = loadDatabase()
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null
  },

  getUserById(id: string): UserProfile | null {
    const db = loadDatabase()
    return db.users.find(u => u.id === id) || null
  },

  registerUser(fullName: string, email: string, passwordHash: string, phone?: string): UserProfile {
    const db = loadDatabase()
    const cleanEmail = email.toLowerCase().trim()
    if (db.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('A user with this email address already exists.')
    }
    const now = new Date().toISOString()
    const newUser: UserProfile = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: phone?.trim() || '',
      passwordHash,
      createdAt: now,
      updatedAt: now
    }
    db.users.push(newUser)
    saveDatabase(db)
    return newUser
  },

  // Memberships
  getMembership(userId: string, communityId: string): Membership | null {
    const db = loadDatabase()
    return db.memberships.find(m => m.userId === userId && m.communityId === communityId) || null
  },

  getUserMemberships(userId: string): (Membership & { community: Community })[] {
    const db = loadDatabase()
    const userMems = db.memberships.filter(m => m.userId === userId)
    return userMems.map(mem => ({
      ...mem,
      community: db.communities.find(c => c.id === mem.communityId)!
    })).filter(m => m.community != null)
  },

  requestResidentMembership(params: {
    userId: string
    communityId: string
    block: string
    houseNumber: string
    residentType: ResidentType
  }): Membership {
    const db = loadDatabase()
    const existing = db.memberships.find(m => m.userId === params.userId && m.communityId === params.communityId)
    if (existing) {
      if (existing.status === 'APPROVED') {
        return existing
      }
      // Re-request if rejected/pending
      existing.status = 'PENDING'
      existing.block = params.block.trim()
      existing.houseNumber = params.houseNumber.trim()
      existing.residentType = params.residentType
      existing.updatedAt = new Date().toISOString()
      saveDatabase(db)
      return existing
    }

    const now = new Date().toISOString()
    const newMembership: Membership = {
      id: 'mem-' + Math.random().toString(36).substring(2, 9),
      userId: params.userId,
      communityId: params.communityId,
      role: 'RESIDENT',
      status: 'PENDING',
      houseNumber: params.houseNumber.trim(),
      block: params.block.trim(),
      residentType: params.residentType,
      verificationStatus: 'pending',
      createdAt: now,
      updatedAt: now
    }
    db.memberships.push(newMembership)
    saveDatabase(db)
    return newMembership
  },

  getCommunityMembers(communityId: string, status?: MembershipStatus): (Membership & { user: UserProfile })[] {
    const db = loadDatabase()
    let mems = db.memberships.filter(m => m.communityId === communityId)
    if (status) {
      mems = mems.filter(m => m.status === status)
    }
    return mems.map(m => {
      const user = db.users.find(u => u.id === m.userId)!
      return { ...m, user }
    }).filter(m => m.user != null)
  },

  updateMembershipStatus(params: {
    membershipId: string
    status: MembershipStatus
    adminUserId: string
    rejectionReason?: string
  }): Membership {
    const db = loadDatabase()
    const mem = db.memberships.find(m => m.id === params.membershipId)
    if (!mem) throw new Error('Membership record not found')

    // Verify admin is community admin of this community
    const adminMem = db.memberships.find(m => m.userId === params.adminUserId && m.communityId === mem.communityId)
    if (!adminMem || (adminMem.role !== 'COMMUNITY_ADMIN' && adminMem.role !== 'SUPER_ADMIN')) {
      throw new Error('Unauthorized: You must be an administrator of this estate to approve or reject members.')
    }

    mem.status = params.status
    mem.verificationStatus = params.status === 'APPROVED' ? 'verified' : 'rejected'
    if (params.rejectionReason) {
      mem.rejectionReason = params.rejectionReason
    }
    mem.updatedAt = new Date().toISOString()

    saveDatabase(db)
    return mem
  },

  // Posts & Tenant Isolation
  getCommunityPosts(communityId: string): (Post & { commentsCount: number })[] {
    const db = loadDatabase()
    const commPosts = db.posts.filter(p => p.communityId === communityId)
    // Sort reverse chronological
    commPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return commPosts.map(p => ({
      ...p,
      commentsCount: db.comments.filter(c => c.postId === p.id).length
    }))
  },

  createPost(params: {
    communityId: string
    authorId: string
    content: string
    images?: string[]
    isOfficial?: boolean
  }): Post {
    const db = loadDatabase()
    const mem = db.memberships.find(m => m.userId === params.authorId && m.communityId === params.communityId)
    if (!mem || mem.status !== 'APPROVED') {
      throw new Error('Access denied: You must be an approved resident of this community to post.')
    }

    const user = db.users.find(u => u.id === params.authorId)
    const isOfficial = !!(params.isOfficial && (mem.role === 'COMMUNITY_ADMIN' || mem.role === 'SUPER_ADMIN'))

    const now = new Date().toISOString()
    const newPost: Post = {
      id: 'post-' + Math.random().toString(36).substring(2, 9),
      communityId: params.communityId,
      authorId: params.authorId,
      authorName: user?.fullName || 'Resident',
      authorBlock: mem.block,
      content: params.content.trim(),
      images: params.images || [],
      isOfficial,
      likesCount: 0,
      createdAt: now,
      updatedAt: now
    }
    db.posts.unshift(newPost)
    saveDatabase(db)
    return newPost
  },

  likePost(postId: string, communityId: string): Post {
    const db = loadDatabase()
    const post = db.posts.find(p => p.id === postId && p.communityId === communityId)
    if (!post) throw new Error('Post not found in this community')
    post.likesCount += 1
    saveDatabase(db)
    return post
  },

  deletePost(postId: string, userId: string, communityId: string): boolean {
    const db = loadDatabase()
    const postIndex = db.posts.findIndex(p => p.id === postId && p.communityId === communityId)
    if (postIndex === -1) return false

    const post = db.posts[postIndex]
    const mem = db.memberships.find(m => m.userId === userId && m.communityId === communityId)
    const canDelete = post.authorId === userId || (mem && mem.role === 'COMMUNITY_ADMIN')

    if (!canDelete) throw new Error('Unauthorized to delete this post')
    db.posts.splice(postIndex, 1)
    // remove comments
    db.comments = db.comments.filter(c => c.postId !== postId)
    saveDatabase(db)
    return true
  },

  // Comments
  getPostComments(postId: string): Comment[] {
    const db = loadDatabase()
    return db.comments.filter(c => c.postId === postId)
  },

  addComment(params: {
    postId: string
    communityId: string
    authorId: string
    content: string
  }): Comment {
    const db = loadDatabase()
    const post = db.posts.find(p => p.id === params.postId && p.communityId === params.communityId)
    if (!post) throw new Error('Post not found')

    const mem = db.memberships.find(m => m.userId === params.authorId && m.communityId === params.communityId)
    if (!mem || mem.status !== 'APPROVED') {
      throw new Error('Unauthorized to comment on this post')
    }

    const user = db.users.find(u => u.id === params.authorId)
    const newComment: Comment = {
      id: 'com-' + Math.random().toString(36).substring(2, 9),
      postId: params.postId,
      authorId: params.authorId,
      authorName: user?.fullName || 'Resident',
      content: params.content.trim(),
      createdAt: new Date().toISOString()
    }
    db.comments.push(newComment)
    saveDatabase(db)
    return newComment
  },

  // Announcements
  getAnnouncements(communityId: string): Announcement[] {
    const db = loadDatabase()
    const items = db.announcements.filter(a => a.communityId === communityId)
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return items
  },

  createAnnouncement(params: {
    communityId: string
    authorId: string
    title: string
    content: string
    priority: 'low' | 'normal' | 'high' | 'urgent'
    category: 'General' | 'Security' | 'Maintenance' | 'Emergency' | 'Utilities' | 'Finance'
  }): Announcement {
    const db = loadDatabase()
    const mem = db.memberships.find(m => m.userId === params.authorId && m.communityId === params.communityId)
    if (!mem || (mem.role !== 'COMMUNITY_ADMIN' && mem.role !== 'SUPER_ADMIN')) {
      throw new Error('Unauthorized: Only estate admins can publish announcements.')
    }

    const user = db.users.find(u => u.id === params.authorId)
    const now = new Date().toISOString()
    const newAnn: Announcement = {
      id: 'ann-' + Math.random().toString(36).substring(2, 9),
      communityId: params.communityId,
      authorId: params.authorId,
      authorName: user?.fullName || 'Estate Management',
      title: params.title.trim(),
      content: params.content.trim(),
      priority: params.priority,
      category: params.category,
      createdAt: now,
      updatedAt: now
    }
    db.announcements.unshift(newAnn)
    saveDatabase(db)
    return newAnn
  },

  // Events
  getEvents(communityId: string): Event[] {
    const db = loadDatabase()
    return db.events.filter(e => e.communityId === communityId)
  },

  createEvent(params: {
    communityId: string
    creatorId: string
    title: string
    description: string
    date: string
    location: string
  }): Event {
    const db = loadDatabase()
    const user = db.users.find(u => u.id === params.creatorId)
    const newEvent: Event = {
      id: 'evt-' + Math.random().toString(36).substring(2, 9),
      communityId: params.communityId,
      creatorId: params.creatorId,
      creatorName: user?.fullName || 'Resident',
      title: params.title.trim(),
      description: params.description.trim(),
      date: params.date.trim(),
      location: params.location.trim(),
      createdAt: new Date().toISOString()
    }
    db.events.unshift(newEvent)
    saveDatabase(db)
    return newEvent
  },

  // Services
  getServiceProviders(communityId: string): ServiceProvider[] {
    const db = loadDatabase()
    return db.serviceProviders.filter(s => s.communityId === communityId)
  },

  addServiceProvider(params: {
    communityId: string
    name: string
    category: string
    description: string
    phone: string
  }): ServiceProvider {
    const db = loadDatabase()
    const newService: ServiceProvider = {
      id: 'srv-' + Math.random().toString(36).substring(2, 9),
      communityId: params.communityId,
      name: params.name.trim(),
      category: params.category.trim(),
      rating: 5.0,
      description: params.description.trim(),
      phone: params.phone.trim(),
      createdAt: new Date().toISOString()
    }
    db.serviceProviders.push(newService)
    saveDatabase(db)
    return newService
  },

  // Marketplace
  getMarketplaceItems(communityId: string): MarketplaceItem[] {
    const db = loadDatabase()
    return db.marketplaceItems.filter(m => m.communityId === communityId && m.status === 'available')
  },

  addMarketplaceItem(params: {
    communityId: string
    sellerId: string
    title: string
    description: string
    price: number
    images?: string[]
  }): MarketplaceItem {
    const db = loadDatabase()
    const user = db.users.find(u => u.id === params.sellerId)
    const newItem: MarketplaceItem = {
      id: 'mkt-' + Math.random().toString(36).substring(2, 9),
      communityId: params.communityId,
      sellerId: params.sellerId,
      sellerName: user?.fullName || 'Resident',
      title: params.title.trim(),
      description: params.description.trim(),
      price: params.price,
      images: params.images || [],
      status: 'available',
      createdAt: new Date().toISOString()
    }
    db.marketplaceItems.unshift(newItem)
    saveDatabase(db)
    return newItem
  }
}
