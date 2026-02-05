import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient, type User } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { StaffUser, StaffRole } from '@/types/database'

// ============================================
// TYPES
// ============================================

export interface AuthUser extends User {
  staffUser?: StaffUser
}

export interface AuthSession {
  user: AuthUser | null
  role: StaffRole | null
  isAdmin: boolean
  isVolunteer: boolean
}

// ============================================
// SERVER-SIDE SUPABASE CLIENT (for SSR)
// ============================================

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Handle when called from Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Handle when called from Server Component
          }
        },
      },
    }
  )
}

// ============================================
// CLIENT-SIDE SUPABASE CLIENT (for browser)
// ============================================

let browserClient: ReturnType<typeof createClient> | null = null

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient

  browserClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return browserClient
}

// ============================================
// AUTH HELPERS
// ============================================

/**
 * Get the current authenticated session with staff user info
 */
export async function getAuthSession(): Promise<AuthSession> {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, role: null, isAdmin: false, isVolunteer: false }
  }

  // Fetch the staff user profile
  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  const authUser: AuthUser = { ...user, staffUser: staffUser || undefined }
  const role = staffUser?.role as StaffRole | null

  return {
    user: authUser,
    role,
    isAdmin: role === 'admin',
    isVolunteer: role === 'volunteer',
  }
}

/**
 * Get staff user by email
 */
export async function getStaffUserByEmail(email: string): Promise<StaffUser | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('staff_users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !data) return null
  return data as StaffUser
}

/**
 * Get all staff users (admin only)
 */
export async function getAllStaffUsers(): Promise<StaffUser[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('staff_users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching staff users:', error)
    return []
  }

  return data as StaffUser[]
}

/**
 * Get volunteers only
 */
export async function getVolunteers(): Promise<StaffUser[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('staff_users')
    .select('*')
    .eq('role', 'volunteer')
    .eq('active', true)
    .order('name')

  if (error) {
    console.error('Error fetching volunteers:', error)
    return []
  }

  return data as StaffUser[]
}

// ============================================
// LEGACY AUTH COMPATIBILITY
// ============================================

// Keep backward compatibility with the current cookie-based auth
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || ''
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
const SESSION_NAME = 'admin_session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export function generateSessionToken(): string {
  const timestamp = Date.now().toString(16)
  const random = Math.random().toString(16).substring(2, 10)
  return `${timestamp}_${random}`
}

function verifySessionToken(token: string): boolean {
  try {
    const parts = token.split('_')
    if (parts.length !== 2) return false

    const timestamp = parseInt(parts[0], 16)
    if (isNaN(timestamp)) return false

    if (Date.now() - timestamp > SESSION_DURATION) return false

    return true
  } catch {
    return false
  }
}

export async function validateLegacyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  if (!ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD environment variable is not set')
    return false
  }

  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

export async function verifyLegacySession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_NAME)

    if (!sessionCookie?.value) {
      return false
    }

    return verifySessionToken(sessionCookie.value)
  } catch {
    return false
  }
}

export async function destroyLegacySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_NAME)
}

// ============================================
// COMBINED AUTH CHECK
// ============================================

export interface CombinedAuthResult {
  authenticated: boolean
  authType: 'supabase' | 'legacy' | null
  user: AuthUser | null
  role: StaffRole | null
  isAdmin: boolean
  isVolunteer: boolean
}

/**
 * Check both Supabase Auth and legacy cookie auth
 * This allows gradual migration to Supabase Auth
 */
export async function getCombinedAuthSession(): Promise<CombinedAuthResult> {
  // First check Supabase Auth
  const session = await getAuthSession()

  if (session.user) {
    return {
      authenticated: true,
      authType: 'supabase',
      user: session.user,
      role: session.role,
      isAdmin: session.isAdmin,
      isVolunteer: session.isVolunteer,
    }
  }

  // Fall back to legacy cookie auth
  const legacyValid = await verifyLegacySession()

  if (legacyValid) {
    return {
      authenticated: true,
      authType: 'legacy',
      user: null,
      role: 'admin', // Legacy auth is admin-only
      isAdmin: true,
      isVolunteer: false,
    }
  }

  return {
    authenticated: false,
    authType: null,
    user: null,
    role: null,
    isAdmin: false,
    isVolunteer: false,
  }
}

/**
 * Require authentication, returns auth result or throws
 */
export async function requireAuth(): Promise<CombinedAuthResult> {
  const auth = await getCombinedAuthSession()

  if (!auth.authenticated) {
    throw new Error('Unauthorized')
  }

  return auth
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<CombinedAuthResult> {
  const auth = await requireAuth()

  if (!auth.isAdmin) {
    throw new Error('Forbidden: Admin access required')
  }

  return auth
}
