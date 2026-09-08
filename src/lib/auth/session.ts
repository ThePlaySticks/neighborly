import { cookies } from 'next/headers'
import { dal, UserProfile } from '@/lib/dal'

const SESSION_COOKIE = 'neighborly_session_user_id'

export async function getCurrentUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get(SESSION_COOKIE)?.value
  if (!userId) return null
  return dal.getUserById(userId)
}

export async function setSessionUser(userId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })
}

export async function clearSessionUser(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
