import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { getPostHogClient } from '@/lib/posthog-server'

type BookingInsert = Database['public']['Tables']['bookings']['Insert']

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  }
  return new Stripe(secretKey, {
    apiVersion: '2026-01-28.clover',
  })
}

const HOSTEL_ID = process.env.HOSTEL_ID || 'default-hostel-id'

// Room info for display
const roomInfo: Record<string, { name: string; pricePerNight: number }> = {
  '1': { name: '8 Bed Mixed Dorm', pricePerNight: 12 },
  '2': { name: '12 Bed Mixed Dorm', pricePerNight: 10 },
  '3': { name: 'Private Room - King Bed', pricePerNight: 30 },
  '4': { name: 'Private Twin Room', pricePerNight: 35 },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['room_id', 'guest_name', 'guest_email', 'check_in', 'check_out']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Calculate nights and total
    const checkIn = new Date(body.check_in)
    const checkOut = new Date(body.check_out)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const guestCount = body.guest_count || 1

    const room = roomInfo[body.room_id]
    if (!room) {
      return NextResponse.json({ error: 'Invalid room' }, { status: 400 })
    }

    const totalPrice = room.pricePerNight * nights * guestCount

    // Create booking in database with pending payment status
    const supabase = createServerSupabaseClient()
    let bookingId: string | null = null

    if (supabase) {
      const bookingData: BookingInsert = {
        hostel_id: HOSTEL_ID,
        room_id: body.room_id,
        guest_name: body.guest_name,
        guest_email: body.guest_email,
        guest_phone: body.guest_phone || null,
        check_in: body.check_in,
        check_out: body.check_out,
        guest_count: guestCount,
        total_price: totalPrice,
        status: 'pending',
        payment_status: 'processing',
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('bookings')
        .insert(bookingData)
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
      } else {
        bookingId = data.id
      }
    }

    // Create Stripe Checkout Session
    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${room.name} - ${nights} night${nights > 1 ? 's' : ''}`,
              description: `Check-in: ${body.check_in} | Check-out: ${body.check_out} | Guests: ${guestCount}`,
              images: ['https://mandiocahostel.com/assets/images/mandioca-0001.webp'],
            },
            unit_amount: totalPrice * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking/cancel`,
      customer_email: body.guest_email,
      metadata: {
        booking_id: bookingId || '',
        hostel_id: HOSTEL_ID,
        room_id: body.room_id,
        guest_name: body.guest_name,
        check_in: body.check_in,
        check_out: body.check_out,
        guest_count: String(guestCount),
      },
    })

    // Update booking with Stripe session ID
    if (bookingId && supabase) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('bookings')
        .update({ stripe_session_id: session.id })
        .eq('id', bookingId)
    }

    // Track checkout created event server-side
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: body.guest_email,
      event: 'checkout_created',
      properties: {
        booking_id: bookingId,
        room_id: body.room_id,
        room_name: room.name,
        nights: nights,
        guest_count: guestCount,
        total_price: totalPrice,
        check_in: body.check_in,
        check_out: body.check_out,
        stripe_session_id: session.id,
      },
    })
    await posthog.shutdown()

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    // Track checkout error
    const posthog = getPostHogClient()
    posthog.captureException(error as Error)
    await posthog.shutdown()
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
