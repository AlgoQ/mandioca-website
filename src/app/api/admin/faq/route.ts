import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { verifySession } from '@/lib/auth'
import type { Database } from '@/types/database'

type FAQUpdate = Database['public']['Tables']['faq']['Update']

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

  const { data, error } = await supabase
    .from('faq')
    .select('*')
    .eq('hostel_id', HOSTEL_ID)
    .order('display_order')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createAdminSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('faq')
    .insert({
      hostel_id: HOSTEL_ID,
      ...body,
    })
    .select()

  if (error) {
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

  // Handle batch update for reordering
  if (Array.isArray(body)) {
    for (const item of body) {
      const { id, ...fields } = item
      const updateData: FAQUpdate = fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('faq')
        .update(updateData)
        .eq('id', id)
        .eq('hostel_id', HOSTEL_ID)
    }
    return NextResponse.json({ success: true })
  }

  // Single update
  const { id, ...updates } = body
  const updateData: FAQUpdate = updates

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('faq')
    .update(updateData)
    .eq('id', id)
    .eq('hostel_id', HOSTEL_ID)
    .select()

  if (error) {
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
    .from('faq')
    .delete()
    .eq('id', id)
    .eq('hostel_id', HOSTEL_ID)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
