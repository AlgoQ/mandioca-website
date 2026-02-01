import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, generateSessionToken } from '@/lib/auth'
import { getPostHogClient } from '@/lib/posthog-server'

// Rate limiting map (in production, use Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0] || 'unknown'
}

function isRateLimited(ip: string): boolean {
  const attempts = loginAttempts.get(ip)
  if (!attempts) return false

  if (Date.now() - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(ip)
    return false
  }

  return attempts.count >= MAX_ATTEMPTS
}

function recordAttempt(ip: string): void {
  const attempts = loginAttempts.get(ip)
  if (attempts) {
    attempts.count++
    attempts.lastAttempt = Date.now()
  } else {
    loginAttempts.set(ip, { count: 1, lastAttempt: Date.now() })
  }
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip)
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)

  // Check rate limiting
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again in 15 minutes.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const isValid = await validateCredentials(username, password)

    if (!isValid) {
      recordAttempt(ip)

      // Track failed login attempt
      const posthogFailed = getPostHogClient()
      posthogFailed.capture({
        distinctId: `admin_${username}`,
        event: 'admin_login_failed',
        properties: {
          username: username,
          ip_address: ip,
          failure_reason: 'invalid_credentials',
        },
      })
      await posthogFailed.shutdown()

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Clear failed attempts on successful login
    clearAttempts(ip)

    // Create session token
    const token = generateSessionToken()

    // Track successful login
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: `admin_${username}`,
      event: 'admin_login_success',
      properties: {
        username: username,
        ip_address: ip,
      },
    })
    // Identify the admin user
    posthog.identify({
      distinctId: `admin_${username}`,
      properties: {
        username: username,
        role: 'admin',
        last_login: new Date().toISOString(),
      },
    })
    await posthog.shutdown()

    // Create response with cookie
    const response = NextResponse.json({ success: true, message: 'Login successful' })

    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
