import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { verifySession } from '@/lib/auth'
import type { Database } from '@/types/database'

type ContentInsert = Database['public']['Tables']['content']['Insert']
type ContentUpdate = Database['public']['Tables']['content']['Update']

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
    .from('content')
    .select('*')
    .eq('hostel_id', HOSTEL_ID)
    .order('section')

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
  const { section, key, value_en, value_es } = body

  const insertData: ContentInsert = {
    hostel_id: HOSTEL_ID,
    section,
    key,
    value_en,
    value_es,
    updated_at: new Date().toISOString(),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('content')
    .upsert(insertData, {
      onConflict: 'hostel_id,section,key',
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
  const { id, ...updates } = body

  const updateData: ContentUpdate = {
    ...updates,
    updated_at: new Date().toISOString(),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('content')
    .update(updateData)
    .eq('id', id)
    .eq('hostel_id', HOSTEL_ID)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
