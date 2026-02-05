import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

const HOSTEL_ID = process.env.HOSTEL_ID || 'default-hostel-id'

// Default hero images (fallback when database is empty or unavailable)
const DEFAULT_HERO_IMAGES = [
  { id: '1', image_url: '/assets/images/mandioca-main-1.webp', alt_text: 'Hostel entrance', display_order: 1, position_x: 8, position_y: 22, size: 'lg', rotation: -6, show_on_mobile: true },
  { id: '2', image_url: '/assets/images/mandioca-main-2.webp', alt_text: 'Pool area', display_order: 2, position_x: 12, position_y: 55, size: 'xl', rotation: 4, show_on_mobile: false },
  { id: '3', image_url: '/assets/images/mandioca-living-1.webp', alt_text: 'Living space', display_order: 3, position_x: 6, position_y: 82, size: 'lg', rotation: -3, show_on_mobile: false },
  { id: '4', image_url: '/assets/images/mandioca-main-4.webp', alt_text: 'Garden view', display_order: 4, position_x: 88, position_y: 18, size: 'xl', rotation: 5, show_on_mobile: true },
  { id: '5', image_url: '/assets/images/mandioca-private-1.webp', alt_text: 'Private room', display_order: 5, position_x: 92, position_y: 52, size: 'lg', rotation: -4, show_on_mobile: false },
  { id: '6', image_url: '/assets/images/mandioca-main-5.webp', alt_text: 'Exterior', display_order: 6, position_x: 86, position_y: 80, size: 'lg', rotation: 6, show_on_mobile: false },
  { id: '7', image_url: '/assets/images/mandioca-main-3.webp', alt_text: 'Common area', display_order: 7, position_x: 25, position_y: 32, size: 'md', rotation: 8, show_on_mobile: false },
  { id: '8', image_url: '/assets/images/mandioca-dorm-1.webp', alt_text: 'Dorm room', display_order: 8, position_x: 75, position_y: 30, size: 'md', rotation: -7, show_on_mobile: false },
  { id: '9', image_url: '/assets/images/mandioca-main-6.webp', alt_text: 'Hostel view', display_order: 9, position_x: 28, position_y: 72, size: 'md', rotation: -5, show_on_mobile: true },
  { id: '10', image_url: '/assets/images/mandioca-living-2.webp', alt_text: 'Lounge', display_order: 10, position_x: 72, position_y: 74, size: 'md', rotation: 6, show_on_mobile: true },
]

export async function GET() {
  const supabase = createAdminSupabaseClient()

  // Try to fetch from database
  if (supabase) {
    const { data, error } = await supabase
      .from('hostel_images')
      .select('*')
      .eq('hostel_id', HOSTEL_ID)
      .eq('category', 'hero')
      .order('display_order')

    if (!error && data && data.length > 0) {
      return NextResponse.json(data)
    }
  }

  // Return default images as fallback
  return NextResponse.json(DEFAULT_HERO_IMAGES)
}
