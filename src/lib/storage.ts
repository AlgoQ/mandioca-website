/**
 * Supabase Storage URL utilities
 *
 * The assets bucket structure:
 * - /images - hostel photos (gallery, rooms, activities, etc.)
 * - /videos - video content
 * - /internal_docs - internal documents (MD, PDF)
 * - /external_docs - external document links
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vodntjdkxxwtftvvgtyy.supabase.co'
const STORAGE_BUCKET = 'assets'

/**
 * Get the full URL for a file in Supabase storage
 */
export function getStorageUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${cleanPath}`
}

/**
 * Get image URL from storage
 * @param filename - The image filename (e.g., 'mandioca-main-1.webp')
 * @param folder - Optional subfolder (e.g., 'activities')
 */
export function getImageUrl(filename: string, folder?: string): string {
  const path = folder ? `images/${folder}/${filename}` : `images/${filename}`
  return getStorageUrl(path)
}

/**
 * Get video URL from storage
 */
export function getVideoUrl(filename: string): string {
  return getStorageUrl(`videos/${filename}`)
}

/**
 * Get document URL from storage
 * @param filename - The document filename
 * @param type - 'internal' or 'external'
 */
export function getDocumentUrl(filename: string, type: 'internal' | 'external' = 'internal'): string {
  const folder = type === 'internal' ? 'internal_docs' : 'external_docs'
  return getStorageUrl(`${folder}/${filename}`)
}

// Image mappings - map old local paths to Supabase storage paths
export const IMAGE_URLS = {
  // Main hostel images
  'mandioca-main-1': getImageUrl('mandioca-main-1.webp'),
  'mandioca-main-2': getImageUrl('mandioca-main-2.webp'),
  'mandioca-main-3': getImageUrl('mandioca-main-3.webp'),
  'mandioca-main-4': getImageUrl('mandioca-main-4.webp'),
  'mandioca-main-5': getImageUrl('mandioca-main-5.webp'),
  'mandioca-main-6': getImageUrl('mandioca-main-6.webp'),
  'mandioca-main-7': getImageUrl('mandioca-main-7.webp'),
  'mandioca-main-8': getImageUrl('mandioca-main-8.webp'),

  // Living area
  'mandioca-living-1': getImageUrl('mandioca-living-1.webp'),
  'mandioca-living-2': getImageUrl('mandioca-living-2.webp'),

  // Dorm rooms
  'mandioca-dorm-1': getImageUrl('mandioca-dorm-1.webp'),
  'mandioca-dorm-2': getImageUrl('mandioca-dorm-2.webp'),

  // Private rooms
  'mandioca-private-1': getImageUrl('mandioca-private-1.webp'),
  'mandioca-private-2': getImageUrl('mandioca-private-2.webp'),

  // Other areas
  'mandioca-bathroom-2': getImageUrl('mandioca-bathroom-2.webp'),
  'mandioca-cats-1': getImageUrl('mandioca-cats-1.webp'),

  // Floating images (hero section) - aliased from main images
  'mandioca-0001': '/assets/images/mandioca-main-1.webp',
  'mandioca-0002': '/assets/images/mandioca-main-2.webp',
  'mandioca-0003': '/assets/images/mandioca-main-3.webp',
  'mandioca-0004': '/assets/images/mandioca-main-4.webp',
  'mandioca-0005': '/assets/images/mandioca-main-5.webp',
  'mandioca-0006': '/assets/images/mandioca-main-6.webp',
  'mandioca-0007': '/assets/images/mandioca-main-7.webp',
  'mandioca-0008': '/assets/images/mandioca-main-8.webp',
  'mandioca-0009': '/assets/images/mandioca-living-1.webp',
  'mandioca-0010': '/assets/images/mandioca-living-2.webp',
  'mandioca-0011': '/assets/images/mandioca-dorm-1.webp',
  'mandioca-0012': '/assets/images/mandioca-dorm-2.webp',
  'mandioca-0013': '/assets/images/mandioca-private-1.webp',
  'mandioca-0014': '/assets/images/mandioca-private-2.webp',
  'mandioca-0015': '/assets/images/mandioca-bathroom-2.webp',
  'mandioca-0016': '/assets/images/mandioca-cats-1.webp',

  // Activities
  'asuncion-palace': getImageUrl('asuncion-palace.jpg', 'activities'),
  'costanera': getImageUrl('costanera.jpg', 'activities'),
  'historic-center': getImageUrl('historic-center.jpg', 'activities'),
} as const

export type ImageKey = keyof typeof IMAGE_URLS
