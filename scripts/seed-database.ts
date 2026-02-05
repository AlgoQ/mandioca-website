/**
 * Database Seeder Script
 * Run with: npx tsx scripts/seed-database.ts
 *
 * Prerequisites:
 * - Add NEXT_PUBLIC_SUPABASE_URL to .env
 * - Add SUPABASE_SERVICE_ROLE_KEY to .env
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Get content type from extension
function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const mimeTypes: Record<string, string> = {
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.mp4': 'video/mp4',
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

const HOSTEL_DATA = {
  name: 'Mandioca Hostel',
  slug: 'mandioca-hostel',
  city: 'Asunción',
  country: 'Paraguay',
  address: 'Avenida Mcal. López 924 c/ Tacuary',
  description: 'Your home in the heart of Asunción, Paraguay. A cozy hostel with excellent vibes, friendly staff, and the perfect location to explore the city.',
  short_description: 'Cozy hostel in the heart of Asunción',
  rating: 9.6,
  latitude: -25.2855854,
  longitude: -57.6497056,
}

const ROOMS_DATA = [
  {
    name: '4-Bed Mixed Dorm',
    description: 'Comfortable mixed dormitory with 4 beds, personal lockers, and shared bathroom.',
    bed_count: 4,
    room_type: 'dorm',
    price_per_night: 12,
    max_guests: 4,
  },
  {
    name: '6-Bed Mixed Dorm',
    description: 'Spacious mixed dormitory with 6 beds, personal lockers, and shared bathroom.',
    bed_count: 6,
    room_type: 'dorm',
    price_per_night: 10,
    max_guests: 6,
  },
  {
    name: 'Private Double Room',
    description: 'Cozy private room with a double bed, perfect for couples or solo travelers wanting privacy.',
    bed_count: 1,
    room_type: 'private',
    price_per_night: 35,
    max_guests: 2,
  },
  {
    name: 'Private Twin Room',
    description: 'Private room with two single beds, ideal for friends traveling together.',
    bed_count: 2,
    room_type: 'private',
    price_per_night: 38,
    max_guests: 2,
  },
]

const AMENITIES_DATA = [
  { name: 'Free WiFi', icon: 'wifi', category: 'facility' },
  { name: 'Fully Equipped Kitchen', icon: 'utensils', category: 'facility' },
  { name: 'Laundry Service', icon: 'shirt', category: 'service' },
  { name: 'Common Area', icon: 'users', category: 'facility' },
  { name: 'Air Conditioning', icon: 'wind', category: 'facility' },
  { name: 'Lockers', icon: 'lock', category: 'facility' },
  { name: '24h Reception', icon: 'clock', category: 'service' },
  { name: 'Tour Booking', icon: 'map', category: 'service' },
]

const REVIEWS_DATA = [
  { guest_name: 'Sarah M.', rating: 10, comment: 'Amazing hostel! The staff was incredibly friendly and helpful. Perfect location.' },
  { guest_name: 'Carlos R.', rating: 10, comment: 'Mejor hostel de Asunción! El ambiente es increíble y conocí gente genial.' },
  { guest_name: 'Emma L.', rating: 9, comment: 'Great atmosphere, clean rooms, and the common area is perfect for meeting other travelers.' },
  { guest_name: 'Marco T.', rating: 10, comment: 'Perfect for solo travelers! Made friends instantly. Will definitely come back.' },
  { guest_name: 'Ana P.', rating: 9, comment: 'Excelente ubicación, cerca de todo. El desayuno estaba delicioso.' },
]

const FAQ_DATA = [
  {
    question: 'What time is check-in and check-out?',
    question_es: '¿A qué hora es el check-in y check-out?',
    answer: 'Check-in is from 2:00 PM and check-out is until 11:00 AM. Early check-in or late check-out may be available upon request.',
    answer_es: 'El check-in es a partir de las 14:00 y el check-out hasta las 11:00. Check-in temprano o check-out tardío pueden estar disponibles bajo solicitud.',
    display_order: 1,
  },
  {
    question: 'Is breakfast included?',
    question_es: '¿El desayuno está incluido?',
    answer: 'Yes! We offer a complimentary breakfast every morning with coffee, tea, bread, butter, jam, and fruit.',
    answer_es: 'Sí! Ofrecemos un desayuno gratuito cada mañana con café, té, pan, manteca, mermelada y fruta.',
    display_order: 2,
  },
  {
    question: 'Do you have parking?',
    question_es: '¿Tienen estacionamiento?',
    answer: 'We have limited street parking available. Please contact us in advance if you need parking.',
    answer_es: 'Tenemos estacionamiento limitado en la calle. Por favor contáctenos con anticipación si necesita estacionamiento.',
    display_order: 3,
  },
  {
    question: 'Can I store my luggage?',
    question_es: '¿Puedo guardar mi equipaje?',
    answer: 'Yes, we offer free luggage storage for guests before check-in and after check-out.',
    answer_es: 'Sí, ofrecemos almacenamiento de equipaje gratuito para huéspedes antes del check-in y después del check-out.',
    display_order: 4,
  },
]

// All assets to upload - using mandioca-XXXX format
// localPath is the current file location, storageName is the new standardized name
const ASSETS_DATA = [
  // Main hostel images (already in correct format)
  { localPath: 'mandioca-0001.webp', storageName: 'mandioca-0001.webp', alt_text: 'Hostel exterior', alt_text_es: 'Exterior del hostel', category: 'hero', display_order: 1 },
  { localPath: 'mandioca-0002.webp', storageName: 'mandioca-0002.webp', alt_text: 'Common area', alt_text_es: 'Área común', category: 'gallery', display_order: 2 },
  { localPath: 'mandioca-0003.webp', storageName: 'mandioca-0003.webp', alt_text: 'Kitchen', alt_text_es: 'Cocina', category: 'gallery', display_order: 3 },
  { localPath: 'mandioca-0004.webp', storageName: 'mandioca-0004.webp', alt_text: 'Hostel entrance', alt_text_es: 'Entrada del hostel', category: 'gallery', display_order: 4 },
  { localPath: 'mandioca-0005.webp', storageName: 'mandioca-0005.webp', alt_text: 'Reception area', alt_text_es: 'Área de recepción', category: 'gallery', display_order: 5 },
  { localPath: 'mandioca-0006.webp', storageName: 'mandioca-0006.webp', alt_text: 'Outdoor terrace', alt_text_es: 'Terraza exterior', category: 'gallery', display_order: 6 },
  { localPath: 'mandioca-0007.webp', storageName: 'mandioca-0007.webp', alt_text: 'Lounge area', alt_text_es: 'Sala de estar', category: 'gallery', display_order: 7 },
  { localPath: 'mandioca-0008.webp', storageName: 'mandioca-0008.webp', alt_text: 'Garden view', alt_text_es: 'Vista del jardín', category: 'gallery', display_order: 8 },
  { localPath: 'mandioca-0009.webp', storageName: 'mandioca-0009.webp', alt_text: 'Living room', alt_text_es: 'Sala de estar', category: 'gallery', display_order: 9 },
  { localPath: 'mandioca-0010.webp', storageName: 'mandioca-0010.webp', alt_text: 'Shared space', alt_text_es: 'Espacio compartido', category: 'gallery', display_order: 10 },
  { localPath: 'mandioca-0011.webp', storageName: 'mandioca-0011.webp', alt_text: 'Dormitory', alt_text_es: 'Dormitorio', category: 'room', display_order: 11 },
  { localPath: 'mandioca-0012.webp', storageName: 'mandioca-0012.webp', alt_text: 'Dorm beds', alt_text_es: 'Camas del dormitorio', category: 'room', display_order: 12 },
  { localPath: 'mandioca-0013.webp', storageName: 'mandioca-0013.webp', alt_text: 'Private room', alt_text_es: 'Habitación privada', category: 'room', display_order: 13 },
  { localPath: 'mandioca-0014.webp', storageName: 'mandioca-0014.webp', alt_text: 'Private room interior', alt_text_es: 'Interior de habitación privada', category: 'room', display_order: 14 },
  { localPath: 'mandioca-0015.webp', storageName: 'mandioca-0015.webp', alt_text: 'Bathroom', alt_text_es: 'Baño', category: 'gallery', display_order: 15 },
  { localPath: 'mandioca-0016.webp', storageName: 'mandioca-0016.webp', alt_text: 'Hostel cats', alt_text_es: 'Gatos del hostel', category: 'gallery', display_order: 16 },
  // Activity images (renaming from activities/ folder to mandioca-XXXX format)
  { localPath: 'activities/asuncion-palace.jpg', storageName: 'mandioca-0017.jpg', alt_text: 'Asunción Palace', alt_text_es: 'Palacio de Asunción', category: 'activity', display_order: 17 },
  { localPath: 'activities/costanera.jpg', storageName: 'mandioca-0018.jpg', alt_text: 'Costanera waterfront', alt_text_es: 'Costanera de Asunción', category: 'activity', display_order: 18 },
  { localPath: 'activities/historic-center.jpg', storageName: 'mandioca-0019.jpg', alt_text: 'Historic center', alt_text_es: 'Centro histórico', category: 'activity', display_order: 19 },
]

// Video asset
const VIDEO_DATA = {
  localPath: '../videos/videoplayback.mp4',
  storageName: 'mandioca-0001.mp4',
  title: 'Mandioca Hostel Tour',
  title_es: 'Tour del Hostel Mandioca',
  description: 'Take a virtual tour of our hostel',
  description_es: 'Haz un tour virtual de nuestro hostel',
}

async function createBucket() {
  console.log('Checking assets bucket...')

  // Check if bucket exists first
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.log(`  ⚠ Could not list buckets: ${listError.message}`)
  }

  const bucketExists = buckets?.some(b => b.name === 'assets')

  if (bucketExists) {
    console.log('✓ Assets bucket already exists')
    return
  }

  // Try to create bucket
  const { error: createError } = await supabase.storage.createBucket('assets', {
    public: true,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: ['image/webp', 'image/jpeg', 'image/png', 'video/mp4'],
  })

  if (createError) {
    if (createError.message.includes('already exists') || createError.message.includes('Duplicate')) {
      console.log('✓ Assets bucket already exists')
    } else {
      console.log(`  ⚠ Bucket creation issue: ${createError.message}`)
    }
  } else {
    console.log('✓ Assets bucket created')
  }
}

async function uploadAssets() {
  console.log('\nUploading assets...')

  const imagesDir = path.join(process.cwd(), 'public/assets/images')
  const videosDir = path.join(process.cwd(), 'public/assets/videos')

  // Upload images
  for (const asset of ASSETS_DATA) {
    const filePath = path.join(imagesDir, asset.localPath)

    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠ Skipping ${asset.localPath} - file not found`)
      continue
    }

    const fileBuffer = fs.readFileSync(filePath)
    const contentType = getContentType(asset.storageName)

    const { error } = await supabase.storage
      .from('assets')
      .upload(asset.storageName, fileBuffer, {
        contentType,
        upsert: true,
      })

    if (error) {
      console.log(`  ✗ Failed to upload ${asset.storageName}: ${error.message}`)
    } else {
      console.log(`  ✓ Uploaded ${asset.localPath} → ${asset.storageName}`)
    }
  }

  // Upload video
  const videoPath = path.join(videosDir, 'videoplayback.mp4')
  if (fs.existsSync(videoPath)) {
    console.log('\nUploading video...')
    const videoBuffer = fs.readFileSync(videoPath)

    const { error } = await supabase.storage
      .from('assets')
      .upload(VIDEO_DATA.storageName, videoBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      })

    if (error) {
      console.log(`  ✗ Failed to upload video: ${error.message}`)
    } else {
      console.log(`  ✓ Uploaded video → ${VIDEO_DATA.storageName}`)
    }
  } else {
    console.log('  ⚠ Video not found, skipping')
  }
}

async function seedDatabase() {
  console.log('\nSeeding database...')

  // Clear existing data (ignore errors for missing tables)
  console.log('Clearing existing data...')
  await supabase.from('hostel_videos').delete().neq('id', '00000000-0000-0000-0000-000000000000').catch(() => {})
  await supabase.from('hostel_images').delete().neq('id', '00000000-0000-0000-0000-000000000000').catch(() => {})
  await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000').catch(() => {})
  await supabase.from('faq').delete().neq('id', '00000000-0000-0000-0000-000000000000').catch(() => {})
  await supabase.from('amenities').delete().neq('id', '00000000-0000-0000-0000-000000000000').catch(() => {})
  await supabase.from('rooms').delete().neq('id', '00000000-0000-0000-0000-000000000000').catch(() => {})
  await supabase.from('hostels').delete().neq('id', '00000000-0000-0000-0000-000000000000').catch(() => {})

  // Insert hostel
  console.log('Creating hostel...')
  const { data: hostel, error: hostelError } = await supabase
    .from('hostels')
    .insert(HOSTEL_DATA)
    .select()
    .single()

  if (hostelError) throw hostelError
  console.log(`✓ Created hostel: ${hostel.name} (${hostel.id})`)

  const hostelId = hostel.id

  // Insert rooms
  console.log('Creating rooms...')
  const { error: roomsError } = await supabase
    .from('rooms')
    .insert(ROOMS_DATA.map(r => ({ ...r, hostel_id: hostelId })))

  if (roomsError) throw roomsError
  console.log(`✓ Created ${ROOMS_DATA.length} rooms`)

  // Insert amenities
  console.log('Creating amenities...')
  const { error: amenitiesError } = await supabase
    .from('amenities')
    .insert(AMENITIES_DATA.map(a => ({ ...a, hostel_id: hostelId })))

  if (amenitiesError) throw amenitiesError
  console.log(`✓ Created ${AMENITIES_DATA.length} amenities`)

  // Insert reviews
  console.log('Creating reviews...')
  const { error: reviewsError } = await supabase
    .from('reviews')
    .insert(REVIEWS_DATA.map(r => ({ ...r, hostel_id: hostelId })))

  if (reviewsError) throw reviewsError
  console.log(`✓ Created ${REVIEWS_DATA.length} reviews`)

  // Try to insert FAQ (may not exist in remote)
  console.log('Creating FAQ...')
  const { error: faqError } = await supabase
    .from('faq')
    .insert(FAQ_DATA.map(f => ({ ...f, hostel_id: hostelId })))

  if (faqError) {
    console.log(`  ⚠ FAQ not created (table may not exist): ${faqError.message}`)
  } else {
    console.log(`✓ Created ${FAQ_DATA.length} FAQ items`)
  }

  // Try to insert images (may not exist in remote)
  console.log('Creating image records...')
  const storageUrl = `${supabaseUrl}/storage/v1/object/public/assets`
  const { error: imagesError } = await supabase
    .from('hostel_images')
    .insert(ASSETS_DATA.map(img => ({
      hostel_id: hostelId,
      image_url: `${storageUrl}/${img.storageName}`,
      alt_text: img.alt_text,
      category: img.category,
      display_order: img.display_order,
    })))

  if (imagesError) {
    console.log(`  ⚠ Images not created (table may not exist): ${imagesError.message}`)
  } else {
    console.log(`✓ Created ${ASSETS_DATA.length} image records`)
  }

  // Insert video record
  console.log('Creating video record...')
  const { error: videoError } = await supabase
    .from('hostel_videos')
    .insert({
      hostel_id: hostelId,
      video_url: `${storageUrl}/${VIDEO_DATA.storageName}`,
      title: VIDEO_DATA.title,
      description: VIDEO_DATA.description,
      display_order: 1,
    })

  if (videoError) {
    console.log(`  ⚠ Video record not created (table may not exist): ${videoError.message}`)
  } else {
    console.log(`✓ Created video record`)
  }

  return hostelId
}

async function main() {
  console.log('🌱 Mandioca Hostel Database Seeder\n')
  console.log(`Supabase URL: ${supabaseUrl}`)
  console.log('-----------------------------------\n')

  try {
    await createBucket()
    await uploadAssets()
    const hostelId = await seedDatabase()

    console.log('\n-----------------------------------')
    console.log('✅ Seeding complete!')
    console.log(`\nHostel ID: ${hostelId}`)
    console.log('\nAdd this to your .env:')
    console.log(`HOSTEL_ID=${hostelId}`)
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  }
}

main()
