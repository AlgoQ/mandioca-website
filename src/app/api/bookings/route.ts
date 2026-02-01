import { NextRequest, NextResponse } from 'next/server'

// Room type mapping
const roomTypes: Record<string, string> = {
  '1': '8 Bed Mixed Dorm ($12/night)',
  '2': '12 Bed Mixed Dorm ($10/night)',
  '3': 'Private Room - King Bed ($30/night)',
  '4': 'Private Twin Room ($35/night)',
}

// Optional email notification - fails silently if Resend not configured
async function sendEmailNotification(bookingData: {
  guest_name: string
  guest_email: string
  guest_phone: string
  room_id: string
  check_in: string
  check_out: string
  guest_count: number
  total_price: number
  nights: number
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log('📧 Email skipped - RESEND_API_KEY not configured')
    console.log('📋 Booking details:', JSON.stringify(bookingData, null, 2))
    return { sent: false, reason: 'not_configured' }
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    // Send to hostel
    await resend.emails.send({
      from: 'Mandioca Hostel <bookings@mandiocahostel.com>',
      to: ['info@mandiocahostel.com'],
      replyTo: bookingData.guest_email,
      subject: `🛏️ New Booking Request - ${bookingData.guest_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #0A4843; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🏨 New Booking Request</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #e5e5e5;">
            <h2 style="color: #0A4843;">Guest: ${bookingData.guest_name}</h2>
            <p><strong>Email:</strong> ${bookingData.guest_email}</p>
            <p><strong>Phone:</strong> ${bookingData.guest_phone}</p>
            <p><strong>Room:</strong> ${roomTypes[bookingData.room_id]}</p>
            <p><strong>Check-in:</strong> ${bookingData.check_in}</p>
            <p><strong>Check-out:</strong> ${bookingData.check_out}</p>
            <p><strong>Nights:</strong> ${bookingData.nights}</p>
            <p><strong>Guests:</strong> ${bookingData.guest_count}</p>
            <p><strong>Total:</strong> $${bookingData.total_price}</p>
          </div>
        </div>
      `,
    })

    // Send confirmation to guest
    await resend.emails.send({
      from: 'Mandioca Hostel <bookings@mandiocahostel.com>',
      to: [bookingData.guest_email],
      subject: `✅ Booking Request Received - Mandioca Hostel`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #0A4843; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0;">Thank you, ${bookingData.guest_name}!</h1>
            <p style="margin: 10px 0 0;">We've received your booking request</p>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #e5e5e5;">
            <h2 style="color: #0A4843;">Your Booking Summary</h2>
            <p><strong>Room:</strong> ${roomTypes[bookingData.room_id]}</p>
            <p><strong>Check-in:</strong> ${bookingData.check_in} (from 1:00 PM)</p>
            <p><strong>Check-out:</strong> ${bookingData.check_out} (by 12:00 PM)</p>
            <p><strong>Guests:</strong> ${bookingData.guest_count}</p>
            <p><strong>Total:</strong> $${bookingData.total_price}</p>
            <h3 style="color: #0A4843;">What's Next?</h3>
            <ol>
              <li>We'll confirm your reservation within 24 hours</li>
              <li>Payment is due at check-in (cash or card)</li>
              <li>Questions? Reply to this email or WhatsApp us!</li>
            </ol>
            <p style="margin-top: 20px;">
              <strong>📍 Location:</strong> Av. Colón 1090, Asunción, Paraguay<br/>
              <a href="https://wa.me/5493704951772" style="color: #0A4843;">WhatsApp</a> |
              <a href="mailto:info@mandiocahostel.com" style="color: #0A4843;">Email</a>
            </p>
          </div>
        </div>
      `,
    })

    return { sent: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { sent: false, reason: 'send_failed' }
  }
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

    // Calculate nights
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    const bookingData = {
      hostel_id: body.hostel_id,
      room_id: body.room_id,
      guest_name: body.guest_name,
      guest_email: body.guest_email,
      guest_phone: body.guest_phone || 'Not provided',
      check_in: body.check_in,
      check_out: body.check_out,
      guest_count: body.guest_count || 1,
      total_price: body.total_price || 0,
      nights,
    }

    // Send email notification (non-blocking, won't fail the request)
    const emailResult = await sendEmailNotification(bookingData)

    console.log('✅ Booking received:', {
      guest: bookingData.guest_name,
      email: bookingData.guest_email,
      room: roomTypes[bookingData.room_id],
      checkIn: bookingData.check_in,
      checkOut: bookingData.check_out,
      emailSent: emailResult.sent,
    })

    return NextResponse.json(
      {
        message: 'Booking request received successfully',
        booking: bookingData,
        emailSent: emailResult.sent,
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
