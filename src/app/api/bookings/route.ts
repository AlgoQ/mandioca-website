import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type BookingInsert = Database['public']['Tables']['bookings']['Insert']

// Initialize Resend lazily to avoid build-time errors
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }
  return new Resend(apiKey)
}

// Room type mapping for email
const roomTypes: Record<string, string> = {
  '1': '8 Bed Mixed Dorm ($12/night)',
  '2': '12 Bed Mixed Dorm ($10/night)',
  '3': 'Private Room - King Bed ($30/night)',
  '4': 'Private Twin Room ($35/night)',
}

// Get base URL for check-in links
function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      'hostel_id',
      'room_id',
      'guest_name',
      'guest_email',
      'guest_phone',
      'check_in',
      'check_out',
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.guest_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate dates
    const checkIn = new Date(body.check_in)
    const checkOut = new Date(body.check_out)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkIn < today) {
      return NextResponse.json(
        { error: 'Check-in date cannot be in the past' },
        { status: 400 }
      )
    }

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    // Calculate nights
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    // STEP 1: Save booking to database FIRST (to get checkin_token)
    const supabase = createServerSupabaseClient()
    let savedBooking = null
    let checkinToken = null

    if (supabase) {
      const dbBookingData: BookingInsert & {
        rules_accepted?: boolean
        rules_accepted_at?: string | null
        gdpr_consent?: boolean
        gdpr_consent_at?: string | null
        marketing_consent?: boolean
      } = {
        hostel_id: body.hostel_id,
        room_id: body.room_id,
        guest_name: body.guest_name,
        guest_email: body.guest_email,
        guest_phone: body.guest_phone || null,
        check_in: body.check_in,
        check_out: body.check_out,
        guest_count: body.guest_count || 1,
        total_price: body.total_price || 0,
        status: 'pending',
        payment_status: 'pending',
        // Consent fields
        rules_accepted: body.rules_accepted || false,
        rules_accepted_at: body.rules_accepted ? now : null,
        gdpr_consent: body.gdpr_consent || false,
        gdpr_consent_at: body.gdpr_consent ? now : null,
        marketing_consent: body.marketing_consent || false,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('bookings')
        .insert(dbBookingData)
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        // Continue - we'll send email without check-in link
      } else {
        savedBooking = data
        checkinToken = data.checkin_token
      }
    }

    // Get Resend client
    const resend = getResendClient()
    const baseUrl = getBaseUrl()
    const checkinUrl = checkinToken ? `${baseUrl}/checkin/${checkinToken}` : null

    // STEP 2: Send email notification to hostel
    const { error: emailError } = await resend.emails.send({
      from: 'Mandioca Hostel <bookings@mandiocahostel.com>',
      to: ['info@mandiocahostel.com'],
      replyTo: body.guest_email,
      subject: `🛏️ New Booking Request - ${body.guest_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #0A4843; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🏨 New Booking Request</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Mandioca Hostel</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #e5e5e5;">
            <h2 style="color: #0A4843; margin-top: 0;">Guest Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Name:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;">${body.guest_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><a href="mailto:${body.guest_email}">${body.guest_email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Phone:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><a href="tel:${body.guest_phone}">${body.guest_phone}</a></td>
              </tr>
            </table>

            <h2 style="color: #0A4843; margin-top: 24px;">Booking Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Room:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;">${roomTypes[body.room_id] || body.room_id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Check-in:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;">${body.check_in}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Check-out:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;">${body.check_out}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Nights:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;">${nights}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Guests:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;">${body.guest_count || 1}</td>
              </tr>
              <tr style="background-color: #F7B03D20;">
                <td style="padding: 12px 8px;"><strong style="font-size: 18px;">Total:</strong></td>
                <td style="padding: 12px 8px;"><strong style="font-size: 18px; color: #0A4843;">$${body.total_price || 0}</strong></td>
              </tr>
            </table>

            ${body.rules_accepted ? '<p style="color: green; margin-top: 16px;">✓ Guest accepted hostel rules</p>' : ''}
            ${body.gdpr_consent ? '<p style="color: green;">✓ Guest accepted GDPR consent</p>' : ''}
            ${body.marketing_consent ? '<p style="color: green;">✓ Guest opted in for marketing</p>' : ''}
          </div>

          <div style="background-color: #0A4843; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">Reply to this email to contact the guest directly</p>
          </div>
        </div>
      `,
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      return NextResponse.json(
        { error: 'Failed to send booking notification. Please try again.' },
        { status: 500 }
      )
    }

    // STEP 3: Send confirmation email to guest WITH CHECK-IN LINK
    await resend.emails.send({
      from: 'Mandioca Hostel <bookings@mandiocahostel.com>',
      to: [body.guest_email],
      subject: `✅ Booking Request Received - Mandioca Hostel`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #0A4843; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Thank you, ${body.guest_name}!</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">We've received your booking request</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #e5e5e5;">
            <p style="color: #333; line-height: 1.6;">
              Thank you for choosing Mandioca Hostel! We've received your booking request and will confirm your reservation shortly.
            </p>

            <h2 style="color: #0A4843;">Your Booking Summary</h2>
            <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e5e5;">
              <p style="margin: 8px 0;"><strong>Room:</strong> ${roomTypes[body.room_id] || body.room_id}</p>
              <p style="margin: 8px 0;"><strong>Check-in:</strong> ${body.check_in} (from 1:00 PM)</p>
              <p style="margin: 8px 0;"><strong>Check-out:</strong> ${body.check_out} (by 12:00 PM)</p>
              <p style="margin: 8px 0;"><strong>Guests:</strong> ${body.guest_count || 1}</p>
              <p style="margin: 8px 0;"><strong>Total:</strong> <span style="color: #0A4843; font-weight: bold;">$${body.total_price || 0}</span></p>
            </div>

            ${checkinUrl ? `
            <div style="background-color: #F7B03D; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center;">
              <h3 style="color: #0A4843; margin-top: 0;">📋 Complete Your Check-in Online</h3>
              <p style="color: #333; margin-bottom: 15px;">Save time on arrival! Complete your registration before you arrive.</p>
              <a href="${checkinUrl}" style="display: inline-block; background-color: #0A4843; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                Complete Online Check-in →
              </a>
              <p style="font-size: 12px; color: #666; margin-top: 10px;">This link is unique to your booking</p>
            </div>
            ` : ''}

            <h2 style="color: #0A4843; margin-top: 24px;">What's Next?</h2>
            <ol style="color: #333; line-height: 1.8;">
              <li>We'll review your request and send a confirmation within 24 hours</li>
              ${checkinUrl ? '<li><strong>Complete your online check-in</strong> using the button above</li>' : ''}
              <li>Payment is due upon arrival (cash, credit, or debit card)</li>
              <li>If you have any questions, just reply to this email!</li>
            </ol>

            <div style="background-color: #F7B03D20; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <h3 style="color: #0A4843; margin-top: 0;">📍 Our Location</h3>
              <p style="margin: 0;">Av. Colón 1090, Asunción, Paraguay</p>
              <a href="https://www.google.com/maps/dir/?api=1&destination=-25.2855854,-57.6497056" style="color: #0A4843;">Get Directions →</a>
            </div>
          </div>

          <div style="background-color: #0A4843; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="margin: 0 0 10px;">Questions? Contact us:</p>
            <p style="margin: 0;">
              <a href="https://wa.me/5493704951772" style="color: #F7B03D; text-decoration: none;">WhatsApp</a> |
              <a href="mailto:info@mandiocahostel.com" style="color: #F7B03D; text-decoration: none;">Email</a> |
              <a href="https://instagram.com/hostelmandioca1090" style="color: #F7B03D; text-decoration: none;">Instagram</a>
            </p>
          </div>
        </div>
      `,
    })

    // STEP 4: Log consent for GDPR audit trail
    if (supabase && savedBooking && (body.rules_accepted || body.gdpr_consent || body.marketing_consent)) {
      const consentLogs = []
      const userAgent = request.headers.get('user-agent') || 'Unknown'
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown'

      if (body.rules_accepted) {
        consentLogs.push({
          booking_id: savedBooking.id,
          email: body.guest_email,
          consent_type: 'rules',
          consent_given: true,
          consent_text: 'I have read and accept the hostel rules and policies, including quiet hours, visitor policy, and cancellation terms.',
          ip_address: ip,
          user_agent: userAgent,
        })
      }

      if (body.gdpr_consent) {
        consentLogs.push({
          booking_id: savedBooking.id,
          email: body.guest_email,
          consent_type: 'gdpr',
          consent_given: true,
          consent_text: 'I consent to Mandioca Hostel processing my personal data for booking and accommodation management purposes.',
          ip_address: ip,
          user_agent: userAgent,
        })
      }

      if (body.marketing_consent) {
        consentLogs.push({
          booking_id: savedBooking.id,
          email: body.guest_email,
          consent_type: 'marketing',
          consent_given: true,
          consent_text: 'I would like to receive travel tips, special offers, and updates from Mandioca Hostel.',
          ip_address: ip,
          user_agent: userAgent,
        })
      }

      // Insert consent logs (ignore errors - booking is primary)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('consent_logs').insert(consentLogs)
    }

    return NextResponse.json(
      {
        message: 'Booking request received successfully',
        booking: savedBooking || {
          guest_name: body.guest_name,
          guest_email: body.guest_email,
          check_in: body.check_in,
          check_out: body.check_out,
          total_price: body.total_price,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hostelId = searchParams.get('hostel_id')
    const email = searchParams.get('email')

    const supabase = createServerSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    let query = supabase.from('bookings').select('*')

    if (hostelId) {
      query = query.eq('hostel_id', hostelId)
    }

    if (email) {
      query = query.eq('guest_email', email)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ bookings: data })
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
