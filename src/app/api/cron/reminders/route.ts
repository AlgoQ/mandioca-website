import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerSupabaseClient } from '@/lib/supabase'

// Room type mapping for email
const roomTypes: Record<string, string> = {
  '1': '8 Bed Mixed Dorm',
  '2': '12 Bed Mixed Dorm',
  '3': 'Private Room - King Bed',
  '4': 'Private Twin Room',
}

// Initialize Resend
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not set')
  }
  return new Resend(apiKey)
}

// Get base URL
function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
}

// Verify cron secret (Vercel Cron)
function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // If no secret configured, allow in development
  if (!cronSecret) {
    return process.env.NODE_ENV !== 'production'
  }

  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron request
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const resend = getResendClient()
    const baseUrl = getBaseUrl()
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    const todayStr = now.toISOString().split('T')[0]

    const results = {
      checkin_reminders: 0,
      checkout_reminders: 0,
      errors: [] as string[],
    }

    // ===== CHECK-IN REMINDERS (1 day before) =====
    // Find bookings with check-in tomorrow that haven't received reminder
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: checkinBookings } = await (supabase as any)
      .from('bookings')
      .select('*')
      .eq('check_in', tomorrowStr)
      .eq('status', 'confirmed')
      .is('checkin_completed_at', null)

    if (checkinBookings && checkinBookings.length > 0) {
      for (const booking of checkinBookings) {
        try {
          // Check if reminder already sent
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: existingReminder } = await (supabase as any)
            .from('email_reminders')
            .select('id')
            .eq('booking_id', booking.id)
            .eq('reminder_type', 'checkin_1day')
            .eq('status', 'sent')
            .single()

          if (existingReminder) continue

          const checkinUrl = booking.checkin_token
            ? `${baseUrl}/checkin/${booking.checkin_token}`
            : null

          // Send reminder
          await resend.emails.send({
            from: 'Mandioca Hostel <bookings@mandiocahostel.com>',
            to: [booking.guest_email],
            subject: `🏨 Your stay starts tomorrow! - Mandioca Hostel`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #0A4843; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">See you tomorrow, ${booking.guest_name}! 🎉</h1>
                </div>

                <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #e5e5e5;">
                  <p style="color: #333; line-height: 1.6;">
                    Just a friendly reminder that your stay at Mandioca Hostel begins <strong>tomorrow</strong>!
                  </p>

                  <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e5e5; margin: 20px 0;">
                    <p style="margin: 8px 0;"><strong>Room:</strong> ${roomTypes[booking.room_id] || booking.room_id}</p>
                    <p style="margin: 8px 0;"><strong>Check-in:</strong> ${booking.check_in} (from 1:00 PM to 11:00 PM)</p>
                    <p style="margin: 8px 0;"><strong>Check-out:</strong> ${booking.check_out} (by 12:00 PM)</p>
                    <p style="margin: 8px 0;"><strong>Guests:</strong> ${booking.guest_count}</p>
                  </div>

                  ${checkinUrl ? `
                  <div style="background-color: #F7B03D; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                    <h3 style="color: #0A4843; margin-top: 0;">⏰ Save time - Check in online!</h3>
                    <p style="color: #333; margin-bottom: 15px;">Complete your registration now to skip the paperwork when you arrive.</p>
                    <a href="${checkinUrl}" style="display: inline-block; background-color: #0A4843; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                      Complete Online Check-in →
                    </a>
                  </div>
                  ` : ''}

                  <h3 style="color: #0A4843;">📍 Finding Us</h3>
                  <p style="margin: 0 0 10px;">Av. Colón 1090, Asunción, Paraguay</p>
                  <a href="https://www.google.com/maps/dir/?api=1&destination=-25.2855854,-57.6497056" style="color: #0A4843;">Get Directions →</a>

                  <h3 style="color: #0A4843; margin-top: 20px;">📱 Need help?</h3>
                  <p>Message us on <a href="https://wa.me/5493704951772" style="color: #0A4843;">WhatsApp</a> and we'll help you out!</p>
                </div>

                <div style="background-color: #0A4843; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0;">We can't wait to welcome you! 🌴</p>
                </div>
              </div>
            `,
          })

          // Log the reminder
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('email_reminders').insert({
            booking_id: booking.id,
            reminder_type: 'checkin_1day',
            scheduled_for: now.toISOString(),
            sent_at: now.toISOString(),
            status: 'sent',
          })

          results.checkin_reminders++
        } catch (err) {
          console.error(`Error sending check-in reminder for ${booking.id}:`, err)
          results.errors.push(`checkin:${booking.id}`)
        }
      }
    }

    // ===== CHECK-OUT REMINDERS (morning of checkout) =====
    // Send at 8 AM on checkout day
    const currentHour = now.getHours()
    if (currentHour >= 7 && currentHour <= 10) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: checkoutBookings } = await (supabase as any)
        .from('bookings')
        .select('*')
        .eq('check_out', todayStr)
        .in('status', ['confirmed', 'pending'])

      if (checkoutBookings && checkoutBookings.length > 0) {
        for (const booking of checkoutBookings) {
          try {
            // Check if reminder already sent
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: existingReminder } = await (supabase as any)
              .from('email_reminders')
              .select('id')
              .eq('booking_id', booking.id)
              .eq('reminder_type', 'checkout_morning')
              .eq('status', 'sent')
              .single()

            if (existingReminder) continue

            // Send reminder
            await resend.emails.send({
              from: 'Mandioca Hostel <bookings@mandiocahostel.com>',
              to: [booking.guest_email],
              subject: `🧳 Check-out reminder - Mandioca Hostel`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background-color: #0A4843; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Good morning, ${booking.guest_name}! ☀️</h1>
                  </div>

                  <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #e5e5e5;">
                    <p style="color: #333; line-height: 1.6;">
                      Just a friendly reminder that today is your check-out day!
                    </p>

                    <div style="background-color: #F7B03D20; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="color: #0A4843; margin-top: 0;">⏰ Check-out by 12:00 PM</h3>
                      <p style="margin: 0; color: #333;">Please return your key to reception before noon.</p>
                    </div>

                    <h3 style="color: #0A4843;">Before you go:</h3>
                    <ul style="color: #333; line-height: 1.8;">
                      <li>Check you have all your belongings</li>
                      <li>Return any borrowed items</li>
                      <li>Let us know if you need luggage storage</li>
                    </ul>

                    <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e5e5; margin-top: 20px;">
                      <h3 style="color: #0A4843; margin-top: 0;">⭐ Enjoyed your stay?</h3>
                      <p style="color: #333; margin-bottom: 15px;">We'd love to hear your feedback!</p>
                      <a href="https://www.google.com/search?q=mandioca+hostel+asuncion+review" style="display: inline-block; background-color: #0A4843; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
                        Leave a Review
                      </a>
                    </div>
                  </div>

                  <div style="background-color: #0A4843; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0;">Thank you for staying with us! Safe travels! 🌴</p>
                  </div>
                </div>
              `,
            })

            // Log the reminder
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('email_reminders').insert({
              booking_id: booking.id,
              reminder_type: 'checkout_morning',
              scheduled_for: now.toISOString(),
              sent_at: now.toISOString(),
              status: 'sent',
            })

            results.checkout_reminders++
          } catch (err) {
            console.error(`Error sending checkout reminder for ${booking.id}:`, err)
            results.errors.push(`checkout:${booking.id}`)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      ...results,
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
