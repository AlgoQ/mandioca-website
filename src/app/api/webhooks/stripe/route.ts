import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { Resend } from 'resend'
import { getPostHogClient } from '@/lib/posthog-server'

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  }
  return new Stripe(secretKey, {
    apiVersion: '2026-01-28.clover',
  })
}

// Room type mapping
const roomTypes: Record<string, string> = {
  '1': '8 Bed Mixed Dorm',
  '2': '12 Bed Mixed Dorm',
  '3': 'Private Room - King Bed',
  '4': 'Private Twin Room',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    let event: Stripe.Event

    try {
      const stripe = getStripeClient()
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Update booking status in database
        const supabase = createAdminSupabaseClient()
        if (supabase && session.metadata?.booking_id) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_status: 'paid',
              stripe_payment_intent_id: session.payment_intent as string,
              paid_at: new Date().toISOString(),
            })
            .eq('id', session.metadata.booking_id)

          // Send confirmation emails
          await sendConfirmationEmails(session)
        }

        // Track payment completed event server-side
        const posthog = getPostHogClient()
        const roomName = roomTypes[session.metadata?.room_id || ''] || session.metadata?.room_id
        posthog.capture({
          distinctId: session.customer_email || session.metadata?.guest_name || 'anonymous',
          event: 'payment_completed',
          properties: {
            booking_id: session.metadata?.booking_id,
            room_id: session.metadata?.room_id,
            room_name: roomName,
            guest_name: session.metadata?.guest_name,
            guest_count: session.metadata?.guest_count,
            check_in: session.metadata?.check_in,
            check_out: session.metadata?.check_out,
            amount_total: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency,
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
          },
        })
        await posthog.shutdown()

        console.log('Payment succeeded for booking:', session.metadata?.booking_id)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session

        // Mark booking as failed
        const supabase = createAdminSupabaseClient()
        if (supabase && session.metadata?.booking_id) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('bookings')
            .update({
              payment_status: 'failed',
            })
            .eq('id', session.metadata.booking_id)
        }

        // Track payment failed event server-side
        const posthogExpired = getPostHogClient()
        posthogExpired.capture({
          distinctId: session.customer_email || session.metadata?.guest_name || 'anonymous',
          event: 'payment_failed',
          properties: {
            booking_id: session.metadata?.booking_id,
            room_id: session.metadata?.room_id,
            guest_name: session.metadata?.guest_name,
            failure_reason: 'checkout_expired',
            stripe_session_id: session.id,
          },
        })
        await posthogExpired.shutdown()

        console.log('Payment expired for booking:', session.metadata?.booking_id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Track payment intent failure
        const posthogFailed = getPostHogClient()
        posthogFailed.capture({
          distinctId: paymentIntent.receipt_email || 'anonymous',
          event: 'payment_failed',
          properties: {
            failure_reason: 'payment_intent_failed',
            stripe_payment_intent_id: paymentIntent.id,
            error_message: paymentIntent.last_payment_error?.message,
            error_code: paymentIntent.last_payment_error?.code,
          },
        })
        await posthogFailed.shutdown()

        console.log('Payment failed:', paymentIntent.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function sendConfirmationEmails(session: Stripe.Checkout.Session) {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) return

  const resend = new Resend(resendApiKey)
  const metadata = session.metadata || {}

  const roomName = roomTypes[metadata.room_id] || metadata.room_id
  const totalPaid = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0'

  // Send to hostel
  await resend.emails.send({
    from: 'Mandioca Hostel <bookings@mandiocahostel.com>',
    to: ['info@mandiocahostel.com'],
    subject: `✅ Payment Received - ${metadata.guest_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #22c55e; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">💰 Payment Confirmed!</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #e5e5e5;">
          <h2 style="color: #0A4843;">Booking Details</h2>
          <p><strong>Guest:</strong> ${metadata.guest_name}</p>
          <p><strong>Room:</strong> ${roomName}</p>
          <p><strong>Check-in:</strong> ${metadata.check_in}</p>
          <p><strong>Check-out:</strong> ${metadata.check_out}</p>
          <p><strong>Guests:</strong> ${metadata.guest_count}</p>
          <p style="font-size: 18px; color: #22c55e;"><strong>Total Paid: $${totalPaid}</strong></p>
        </div>
      </div>
    `,
  })

  // Send to guest
  await resend.emails.send({
    from: 'Mandioca Hostel <bookings@mandiocahostel.com>',
    to: [session.customer_email || ''],
    subject: `🎉 Booking Confirmed - Mandioca Hostel`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0A4843; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🎉 You're all set!</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Your booking is confirmed</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #e5e5e5;">
          <div style="background-color: #22c55e20; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <p style="margin: 0; color: #22c55e; font-weight: bold;">✓ Payment Successful - $${totalPaid}</p>
          </div>

          <h2 style="color: #0A4843;">Your Reservation</h2>
          <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e5e5;">
            <p style="margin: 8px 0;"><strong>Room:</strong> ${roomName}</p>
            <p style="margin: 8px 0;"><strong>Check-in:</strong> ${metadata.check_in} (from 1:00 PM)</p>
            <p style="margin: 8px 0;"><strong>Check-out:</strong> ${metadata.check_out} (by 12:00 PM)</p>
            <p style="margin: 8px 0;"><strong>Guests:</strong> ${metadata.guest_count}</p>
          </div>

          <div style="background-color: #F7B03D20; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h3 style="color: #0A4843; margin-top: 0;">📍 How to Find Us</h3>
            <p style="margin: 0;">Av. Colón 1090, Asunción, Paraguay</p>
            <a href="https://www.google.com/maps/dir/?api=1&destination=-25.2855854,-57.6497056" style="color: #0A4843;">Get Directions →</a>
          </div>
        </div>
        <div style="background-color: #0A4843; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="margin: 0;">Questions? Contact us at info@mandiocahostel.com</p>
        </div>
      </div>
    `,
  })
}
