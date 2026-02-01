import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { verifySession } from '@/lib/auth'
import type { Database } from '@/types/database'

type ImageInsert = Database['public']['Tables']['hostel_images']['Insert']
type ImageUpdate = Database['public']['Tables']['hostel_images']['Update']

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
  const category = searchParams.get('category')

  let query = supabase
    .from('hostel_images')
    .select('*')
    .eq('hostel_id', HOSTEL_ID)
    .order('display_order')

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query

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
    .from('hostel_images')
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
      const updateData: ImageUpdate = {
        display_order: fields.display_order,
        category: fields.category,
        alt_text: fields.alt_text,
        alt_text_es: fields.alt_text_es,
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('hostel_images')
        .update(updateData)
        .eq('id', id)
        .eq('hostel_id', HOSTEL_ID)
    }

    return NextResponse.json({ success: true })
  }

  // Single update
  const { id, ...updates } = body
  const updateData: ImageUpdate = updates

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('hostel_images')
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
    .from('hostel_images')
    .delete()
    .eq('id', id)
    .eq('hostel_id', HOSTEL_ID)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
