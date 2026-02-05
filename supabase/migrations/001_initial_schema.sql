-- Mandioca Hostel Database Schema
-- Run this in Supabase SQL Editor at: https://supabase.com/dashboard/project/vodntjdkxxwtftvvgtyy/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- HOSTELS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS hostels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  rating DECIMAL(3,1) DEFAULT 0,
  hero_image TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROOMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  bed_count INTEGER DEFAULT 1,
  room_type VARCHAR(20) CHECK (room_type IN ('dorm', 'private', 'suite')) DEFAULT 'dorm',
  price_per_night DECIMAL(10,2) DEFAULT 0,
  max_guests INTEGER DEFAULT 1,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AMENITIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_es VARCHAR(255), -- Spanish translation
  icon VARCHAR(50),
  category VARCHAR(20) CHECK (category IN ('facility', 'service', 'activity')) DEFAULT 'facility',
  description TEXT,
  description_es TEXT, -- Spanish translation
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- HOSTEL IMAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS hostel_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  alt_text_es VARCHAR(255), -- Spanish translation
  width INTEGER,
  height INTEGER,
  file_size INTEGER, -- in bytes
  display_order INTEGER DEFAULT 0,
  category VARCHAR(50) DEFAULT 'gallery', -- gallery, hero, room, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- HOSTEL VIDEOS TABLE (NEW)
-- =============================================
CREATE TABLE IF NOT EXISTS hostel_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title VARCHAR(255),
  title_es VARCHAR(255), -- Spanish translation
  description TEXT,
  description_es TEXT, -- Spanish translation
  duration INTEGER, -- in seconds
  file_size INTEGER, -- in bytes
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BOOKINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guest_count INTEGER DEFAULT 1,
  total_price DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  guest_name VARCHAR(255) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10) DEFAULT 10,
  comment TEXT,
  country VARCHAR(100),
  review_date VARCHAR(50), -- e.g., "January 2026"
  display_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FAQ TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_es TEXT, -- Spanish translation
  answer TEXT NOT NULL,
  answer_es TEXT, -- Spanish translation
  display_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CONTENT TABLE (for dynamic text content)
-- =============================================
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  section VARCHAR(50) NOT NULL, -- 'hero', 'about', 'contact', etc.
  key VARCHAR(100) NOT NULL,
  value_en TEXT NOT NULL,
  value_es TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hostel_id, section, key)
);

-- =============================================
-- ACTIVITIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_es VARCHAR(255), -- Spanish translation
  subtitle VARCHAR(255),
  subtitle_es VARCHAR(255),
  description TEXT,
  description_es TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_rooms_hostel_id ON rooms(hostel_id);
CREATE INDEX IF NOT EXISTS idx_amenities_hostel_id ON amenities(hostel_id);
CREATE INDEX IF NOT EXISTS idx_hostel_images_hostel_id ON hostel_images(hostel_id);
CREATE INDEX IF NOT EXISTS idx_hostel_videos_hostel_id ON hostel_videos(hostel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hostel_id ON bookings(hostel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_reviews_hostel_id ON reviews(hostel_id);
CREATE INDEX IF NOT EXISTS idx_faq_hostel_id ON faq(hostel_id);
CREATE INDEX IF NOT EXISTS idx_content_hostel_section ON content(hostel_id, section);
CREATE INDEX IF NOT EXISTS idx_activities_hostel_id ON activities(hostel_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- Enable RLS on all tables
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Public read access for display data
CREATE POLICY "Public can view hostels" ON hostels FOR SELECT USING (true);
CREATE POLICY "Public can view rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Public can view amenities" ON amenities FOR SELECT USING (true);
CREATE POLICY "Public can view images" ON hostel_images FOR SELECT USING (true);
CREATE POLICY "Public can view videos" ON hostel_videos FOR SELECT USING (true);
CREATE POLICY "Public can view reviews" ON reviews FOR SELECT USING (visible = true);
CREATE POLICY "Public can view faq" ON faq FOR SELECT USING (visible = true);
CREATE POLICY "Public can view content" ON content FOR SELECT USING (true);
CREATE POLICY "Public can view activities" ON activities FOR SELECT USING (visible = true);

-- Public can create bookings
CREATE POLICY "Public can create bookings" ON bookings FOR INSERT WITH CHECK (true);

-- Service role has full access (for admin operations)
CREATE POLICY "Service role full access hostels" ON hostels FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access rooms" ON rooms FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access amenities" ON amenities FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access images" ON hostel_images FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access videos" ON hostel_videos FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access bookings" ON bookings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access reviews" ON reviews FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access faq" ON faq FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access content" ON content FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access activities" ON activities FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- TRIGGERS for updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hostels_updated_at
  BEFORE UPDATE ON hostels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
