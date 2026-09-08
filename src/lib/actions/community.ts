'use server'

import { dal, ResidentType } from '@/lib/dal'
import { getCurrentUser, setSessionUser, clearSessionUser } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

// Auth actions
export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Please enter both email and password' }
  }

  const user = dal.findUserByEmail(email)
  if (!user || user.passwordHash !== password) {
    return { success: false, error: 'Invalid email or password' }
  }

  await setSessionUser(user.id)

  // Determine appropriate redirect destination based on user's memberships
  const memberships = dal.getUserMemberships(user.id)
  let defaultRedirect = '/'
  const adminMembership = memberships.find(m => m.role === 'COMMUNITY_ADMIN' || m.role === 'SUPER_ADMIN')
  if (adminMembership) {
    defaultRedirect = '/manager/dashboard'
  } else if (memberships.length > 0) {
    const residentMembership = memberships.find(m => m.status === 'APPROVED') || memberships[0]
    defaultRedirect = `/c/${residentMembership.community.slug}`
  }

  return { success: true, user, defaultRedirect }
}

export async function logoutAction() {
  await clearSessionUser()
  return { success: true }
}

// Community Registration Action
export async function createCommunityAction(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const communityType = (formData.get('communityType') as string) || 'Gated Estate'
    const location = formData.get('location') as string
    const city = formData.get('city') as string
    const state = formData.get('state') as string
    const country = (formData.get('country') as string) || 'Nigeria'
    const adminFullName = formData.get('adminFullName') as string
    const adminEmail = formData.get('adminEmail') as string
    const adminPhone = (formData.get('adminPhone') as string) || ''
    const adminPassword = formData.get('adminPassword') as string

    if (!name || !slug || !location || !city || !state || !adminFullName || !adminEmail || !adminPassword) {
      return { success: false, error: 'Please fill in all required fields' }
    }

    const { community, adminUser } = dal.createCommunityWithAdmin({
      name,
      slug,
      communityType,
      location,
      city,
      state,
      country,
      adminFullName,
      adminEmail,
      adminPhone,
      adminPassword
    })

    // Log the new admin in immediately
    await setSessionUser(adminUser.id)

    return { success: true, slug: community.slug }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create community' }
  }
}

// Resident Join Action
export async function joinCommunityAction(formData: FormData) {
  try {
    const slug = formData.get('slug') as string
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string
    const block = formData.get('block') as string
    const houseNumber = formData.get('houseNumber') as string
    const residentType = formData.get('residentType') as ResidentType

    if (!slug || !fullName || !email || !password || !block || !houseNumber || !residentType) {
      return { success: false, error: 'Please fill in all required resident registration fields' }
    }

    const community = dal.getCommunityBySlug(slug)
    if (!community) {
      return { success: false, error: 'Estate not found' }
    }

    // Find or create user
    let user = dal.findUserByEmail(email)
    if (!user) {
      user = dal.registerUser(fullName, email, password, phone)
    }

    // Create membership request (status: PENDING)
    const membership = dal.requestResidentMembership({
      userId: user.id,
      communityId: community.id,
      block,
      houseNumber,
      residentType
    })

    await setSessionUser(user.id)
    revalidatePath(`/c/${slug}`)

    return {
      success: true,
      membershipStatus: membership.status,
      communitySlug: community.slug
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit membership request' }
  }
}

// Admin approve/reject resident action
export async function updateResidentStatusAction(params: {
  membershipId: string
  status: 'APPROVED' | 'REJECTED'
  communitySlug: string
  rejectionReason?: string
}) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Unauthorized. Please sign in.' }
    }

    dal.updateMembershipStatus({
      membershipId: params.membershipId,
      status: params.status,
      adminUserId: user.id,
      rejectionReason: params.rejectionReason
    })

    revalidatePath(`/c/${params.communitySlug}/admin`)
    revalidatePath(`/c/${params.communitySlug}`)

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update resident status' }
  }
}

// Create post action
export async function createPostAction(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'You must be signed in to post.' }

    const communitySlug = formData.get('communitySlug') as string
    const content = formData.get('content') as string
    const isOfficial = formData.get('isOfficial') === 'true'

    if (!communitySlug || !content?.trim()) {
      return { success: false, error: 'Post content cannot be empty.' }
    }

    const comm = dal.getCommunityBySlug(communitySlug)
    if (!comm) return { success: false, error: 'Community not found.' }

    const post = dal.createPost({
      communityId: comm.id,
      authorId: user.id,
      content,
      isOfficial
    })

    revalidatePath(`/c/${communitySlug}`)
    revalidatePath(`/c/${communitySlug}/feed`)

    return { success: true, post }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create post.' }
  }
}

// Like post action
export async function likePostAction(postId: string, communitySlug: string) {
  try {
    const comm = dal.getCommunityBySlug(communitySlug)
    if (!comm) return { success: false, error: 'Community not found.' }

    const post = dal.likePost(postId, comm.id)
    revalidatePath(`/c/${communitySlug}`)
    return { success: true, likesCount: post.likesCount }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// Add comment action
export async function addCommentAction(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Please sign in to comment.' }

    const postId = formData.get('postId') as string
    const communitySlug = formData.get('communitySlug') as string
    const content = formData.get('content') as string

    if (!postId || !content?.trim()) {
      return { success: false, error: 'Comment cannot be empty.' }
    }

    const comm = dal.getCommunityBySlug(communitySlug)
    if (!comm) return { success: false, error: 'Community not found.' }

    const comment = dal.addComment({
      postId,
      communityId: comm.id,
      authorId: user.id,
      content
    })

    revalidatePath(`/c/${communitySlug}`)
    return { success: true, comment }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// Create announcement action
export async function createAnnouncementAction(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Please sign in.' }

    const communitySlug = formData.get('communitySlug') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const category = (formData.get('category') as any) || 'General'
    const priority = (formData.get('priority') as any) || 'normal'

    if (!communitySlug || !title?.trim() || !content?.trim()) {
      return { success: false, error: 'Title and content are required.' }
    }

    const comm = dal.getCommunityBySlug(communitySlug)
    if (!comm) return { success: false, error: 'Community not found.' }

    const ann = dal.createAnnouncement({
      communityId: comm.id,
      authorId: user.id,
      title,
      content,
      category,
      priority
    })

    revalidatePath(`/c/${communitySlug}/announcements`)
    revalidatePath(`/c/${communitySlug}`)
    return { success: true, announcement: ann }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
