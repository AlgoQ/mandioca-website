import { cookies } from 'next/headers'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'acoidnam'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
const SESSION_NAME = 'admin_session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Generate a simple session token (timestamp + random hex)
export function generateSessionToken(): string {
  const timestamp = Date.now().toString(16)
  const random = Math.random().toString(16).substring(2, 10)
  return `${timestamp}_${random}`
}

// Verify session token format and expiry
function verifySessionToken(token: string): boolean {
  try {
    const parts = token.split('_')
    if (parts.length !== 2) return false

    const timestamp = parseInt(parts[0], 16)
    if (isNaN(timestamp)) return false

    // Check if token is not expired (24 hours)
    if (Date.now() - timestamp > SESSION_DURATION) return false

    return true
  } catch {
    return false
  }
}

// Validate admin credentials
export async function validateCredentials(
  username: string,
  password: string
): Promise<boolean> {
  if (!ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD environment variable is not set')
    return false
  }

  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

// Verify admin session
export async function verifySession(): Promise<boolean> {
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

// Destroy admin session
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_NAME)
}
