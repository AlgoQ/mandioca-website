import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET: Fetch booking by checkin token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token || token.length < 10) {
      return NextResponse.json(
        { error: 'Invalid check-in token' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Fetch booking by token
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: booking, error } = await (supabase as any)
      .from('bookings')
      .select('*')
      .eq('checkin_token', token)
      .single()

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Booking not found. Please check your link or contact the hostel.' },
        { status: 404 }
      )
    }

    // Check if booking is valid for check-in (not cancelled)
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'This booking has been cancelled.' },
        { status: 400 }
      )
    }

    // Fetch hostel rules
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rules } = await (supabase as any)
      .from('hostel_rules')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true })

    return NextResponse.json({
      booking,
      rules: rules || [],
    })
  } catch (error) {
    console.error('Check-in GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Complete check-in registration
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token || token.length < 10) {
      return NextResponse.json(
        { error: 'Invalid check-in token' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Parse form data (supports file upload)
    const formData = await request.formData()

    // Verify booking exists and is valid
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: booking, error: bookingError } = await (supabase as any)
      .from('bookings')
      .select('*')
      .eq('checkin_token', token)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.checkin_completed_at) {
      return NextResponse.json(
        { error: 'Check-in already completed' },
        { status: 400 }
      )
    }

    // Extract form data
    const nationality = formData.get('nationality') as string
    const dateOfBirth = formData.get('dateOfBirth') as string
    const passportNumber = formData.get('passportNumber') as string
    const passportExpiry = formData.get('passportExpiry') as string
    const emergencyName = formData.get('emergencyName') as string
    const emergencyPhone = formData.get('emergencyPhone') as string
    const emergencyRelation = formData.get('emergencyRelation') as string
    const dietaryRestrictions = formData.get('dietaryRestrictions') as string
    const specialRequests = formData.get('specialRequests') as string
    const arrivalTime = formData.get('arrivalTime') as string
    const signatureDataUrl = formData.get('signatureDataUrl') as string
    const rulesAccepted = formData.get('rulesAccepted') === 'true'
    const gdprConsent = formData.get('gdprConsent') === 'true'
    const passportImage = formData.get('passportImage') as File | null

    // Validate required fields
    if (!nationality || !dateOfBirth || !passportNumber) {
      return NextResponse.json(
        { error: 'Missing required identity information' },
        { status: 400 }
      )
    }

    if (!emergencyName || !emergencyPhone) {
      return NextResponse.json(
        { error: 'Missing required emergency contact information' },
        { status: 400 }
      )
    }

    if (!rulesAccepted || !gdprConsent) {
      return NextResponse.json(
        { error: 'You must accept the hostel rules and privacy policy' },
        { status: 400 }
      )
    }

    if (!signatureDataUrl) {
      return NextResponse.json(
        { error: 'Signature is required' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown'

    // Upload passport image to Supabase Storage if provided
    let passportImageUrl = null
    if (passportImage && passportImage.size > 0) {
      try {
        const fileExt = passportImage.name.split('.').pop()
        const fileName = `passport_${booking.id}_${Date.now()}.${fileExt}`
        const filePath = `guest-documents/${fileName}`

        const arrayBuffer = await passportImage.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: uploadError } = await (supabase as any)
          .storage
          .from('guest-documents')
          .upload(filePath, buffer, {
            contentType: passportImage.type,
            upsert: false,
          })

        if (!uploadError) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: publicUrl } = (supabase as any)
            .storage
            .from('guest-documents')
            .getPublicUrl(filePath)
          passportImageUrl = publicUrl?.publicUrl
        }
      } catch (uploadErr) {
        console.error('Passport upload error:', uploadErr)
        // Continue without failing - passport image is optional
      }
    }

    // Upload signature to Supabase Storage
    let signatureUrl = null
    if (signatureDataUrl) {
      try {
        // Convert base64 to buffer
        const base64Data = signatureDataUrl.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')
        const fileName = `signature_${booking.id}_${Date.now()}.png`
        const filePath = `guest-documents/${fileName}`

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: uploadError } = await (supabase as any)
          .storage
          .from('guest-documents')
          .upload(filePath, buffer, {
            contentType: 'image/png',
            upsert: false,
          })

        if (!uploadError) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: publicUrl } = (supabase as any)
            .storage
            .from('guest-documents')
            .getPublicUrl(filePath)
          signatureUrl = publicUrl?.publicUrl
        }
      } catch (sigErr) {
        console.error('Signature upload error:', sigErr)
        // Store base64 in DB as fallback
        signatureUrl = signatureDataUrl
      }
    }

    // Create or update guest record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingGuest } = await (supabase as any)
      .from('guests')
      .select('id')
      .eq('email', booking.guest_email)
      .single()

    let guestId = existingGuest?.id

    const guestData = {
      full_name: booking.guest_name,
      email: booking.guest_email,
      phone: booking.guest_phone,
      nationality,
      date_of_birth: dateOfBirth,
      passport_number: passportNumber,
      passport_expiry: passportExpiry || null,
      emergency_contact_name: emergencyName,
      emergency_contact_phone: emergencyPhone,
      emergency_contact_relation: emergencyRelation || null,
      passport_image_url: passportImageUrl,
      signature_image_url: signatureUrl,
      dietary_restrictions: dietaryRestrictions || null,
      special_requests: specialRequests || null,
      updated_at: now,
    }

    if (guestId) {
      // Update existing guest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('guests')
        .update(guestData)
        .eq('id', guestId)
    } else {
      // Create new guest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newGuest } = await (supabase as any)
        .from('guests')
        .insert(guestData)
        .select('id')
        .single()
      guestId = newGuest?.id
    }

    // Create check-in record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('check_ins')
      .insert({
        booking_id: booking.id,
        guest_id: guestId,
        checked_in_by: 'self',
        device_info: userAgent,
        ip_address: ip,
        signature_url: signatureUrl,
        passport_url: passportImageUrl,
        rules_accepted: rulesAccepted,
        rules_accepted_at: rulesAccepted ? now : null,
        gdpr_consent: gdprConsent,
        gdpr_consent_at: gdprConsent ? now : null,
        arrival_notes: specialRequests || null,
      })

    // Update booking with check-in completion
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('bookings')
      .update({
        guest_id: guestId,
        checkin_completed_at: now,
        arrival_time: arrivalTime || null,
        rules_accepted: rulesAccepted,
        rules_accepted_at: rulesAccepted ? now : null,
        gdpr_consent: gdprConsent,
        gdpr_consent_at: gdprConsent ? now : null,
      })
      .eq('id', booking.id)

    // Log consents for GDPR audit trail
    const consentLogs = [
      {
        guest_id: guestId,
        booking_id: booking.id,
        email: booking.guest_email,
        consent_type: 'rules',
        consent_given: rulesAccepted,
        consent_text: 'I have read and agree to the hostel rules and policies. I understand that violation may result in removal without refund.',
        ip_address: ip,
        user_agent: userAgent,
      },
      {
        guest_id: guestId,
        booking_id: booking.id,
        email: booking.guest_email,
        consent_type: 'gdpr',
        consent_given: gdprConsent,
        consent_text: 'I consent to Mandioca Hostel storing and processing my personal data for accommodation management purposes, in accordance with GDPR.',
        ip_address: ip,
        user_agent: userAgent,
      },
    ]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('consent_logs').insert(consentLogs)

    return NextResponse.json({
      success: true,
      message: 'Check-in completed successfully',
    })
  } catch (error) {
    console.error('Check-in POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
