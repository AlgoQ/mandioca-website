-- Add recurring task schedules
-- Run this in Supabase SQL Editor

-- =============================================
-- CREATE RECURRING TASK SCHEDULES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS recurring_task_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  area_type VARCHAR(50) NOT NULL,
  area_name VARCHAR(255) NOT NULL,

  -- Recurrence settings
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  times_per_day INTEGER DEFAULT 1, -- How many times per day (e.g., 2 for bathroom twice daily)
  scheduled_times JSONB DEFAULT '[]', -- Array of times like ["09:00", "18:00"]
  days_of_week JSONB DEFAULT '[]', -- For weekly: ["monday", "wednesday", "friday"]
  day_of_month INTEGER, -- For monthly: 1-31

  -- Template for tasks
  template_id UUID REFERENCES cleaning_templates(id),
  default_assignee VARCHAR(255),

  -- Status
  active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_hostel ON recurring_task_schedules(hostel_id);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_active ON recurring_task_schedules(active);

-- Enable RLS
ALTER TABLE recurring_task_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role full access recurring schedules"
  ON recurring_task_schedules FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view recurring schedules"
  ON recurring_task_schedules FOR SELECT
  USING (true);

-- =============================================
-- INSERT DEFAULT RECURRING SCHEDULES
-- =============================================
-- Bathroom cleaning twice daily (9am and 6pm)
INSERT INTO recurring_task_schedules (hostel_id, name, description, area_type, area_name, frequency, times_per_day, scheduled_times, active)
SELECT
  (SELECT id FROM hostels LIMIT 1),
  'Bathroom Cleaning - Morning & Evening',
  'Daily bathroom cleaning scheduled twice - morning check and evening refresh',
  'bathroom',
  'Shared Bathrooms',
  'daily',
  2,
  '["09:00", "18:00"]'::jsonb,
  true
WHERE EXISTS (SELECT 1 FROM hostels LIMIT 1);

-- Kitchen cleaning daily
INSERT INTO recurring_task_schedules (hostel_id, name, description, area_type, area_name, frequency, times_per_day, scheduled_times, active)
SELECT
  (SELECT id FROM hostels LIMIT 1),
  'Kitchen Cleaning',
  'Daily kitchen cleaning and organization',
  'kitchen',
  'Main Kitchen',
  'daily',
  1,
  '["10:00"]'::jsonb,
  true
WHERE EXISTS (SELECT 1 FROM hostels LIMIT 1);

-- Common area daily
INSERT INTO recurring_task_schedules (hostel_id, name, description, area_type, area_name, frequency, times_per_day, scheduled_times, active)
SELECT
  (SELECT id FROM hostels LIMIT 1),
  'Common Area Cleaning',
  'Daily common area tidying and cleaning',
  'common',
  'Living Room & Lounge',
  'daily',
  1,
  '["11:00"]'::jsonb,
  true
WHERE EXISTS (SELECT 1 FROM hostels LIMIT 1);

-- Pool cleaning daily
INSERT INTO recurring_task_schedules (hostel_id, name, description, area_type, area_name, frequency, times_per_day, scheduled_times, active)
SELECT
  (SELECT id FROM hostels LIMIT 1),
  'Pool Maintenance',
  'Daily pool cleaning and water check',
  'pool',
  'Swimming Pool',
  'daily',
  1,
  '["08:00"]'::jsonb,
  true
WHERE EXISTS (SELECT 1 FROM hostels LIMIT 1);

-- =============================================
-- ADD DOCUMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('internal', 'external')),
  category VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  file_size INTEGER, -- in bytes, for uploaded files
  mime_type VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_documents_hostel ON documents(hostel_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role full access documents"
  ON documents FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view documents"
  ON documents FOR SELECT
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_recurring_schedules_updated_at
  BEFORE UPDATE ON recurring_task_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
