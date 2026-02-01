import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { verifySession } from '@/lib/auth'
import type { Database } from '@/types/database'

type BookingUpdate = Database['public']['Tables']['bookings']['Update']

const HOSTEL_ID = process.env.HOSTEL_ID || 'default-hostel-id'

export async function GET(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createAdminSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')
  const roomId = searchParams.get('room_id')

  let query = supabase
    .from('bookings')
    .select(`
      *,
      rooms (
        id,
        name,
        room_type,
        price_per_night
      )
    `)
    .eq('hostel_id', HOSTEL_ID)
    .order('check_in', { ascending: true })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (startDate) {
    query = query.gte('check_in', startDate)
  }

  if (endDate) {
    query = query.lte('check_out', endDate)
  }

  if (roomId) {
    query = query.eq('room_id', roomId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createAdminSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
  }

  const body = await request.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: 'ID de reserva requerido' }, { status: 400 })
  }

  const updateData: BookingUpdate = updates

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('bookings')
    .update(updateData)
    .eq('id', id)
    .eq('hostel_id', HOSTEL_ID)
    .select()

  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createAdminSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  }

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id)
    .eq('hostel_id', HOSTEL_ID)

  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
