-- Migration: Guest Check-in System
-- Adds: guests table, check-ins, consent tracking, cleaning tasks, guest documents

-- ============================================
-- 1. GUESTS TABLE (Full guest profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Basic info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  -- Identity
  nationality TEXT,
  date_of_birth DATE,
  passport_number TEXT,
  passport_expiry DATE,
  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  -- Documents (stored in Supabase Storage)
  passport_image_url TEXT,
  signature_image_url TEXT,
  -- Preferences
  dietary_restrictions TEXT,
  special_requests TEXT,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for email lookups (returning guests)
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);

-- ============================================
-- 2. ADD CONSENT & CHECKIN FIELDS TO BOOKINGS
-- ============================================
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS guest_id UUID REFERENCES guests(id),
ADD COLUMN IF NOT EXISTS rules_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rules_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS gdpr_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gdpr_consent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS checkin_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS checkin_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS arrival_time TEXT,
ADD COLUMN IF NOT EXISTS checkout_completed_at TIMESTAMP WITH TIME ZONE;

-- Index for checkin token lookups
CREATE INDEX IF NOT EXISTS idx_bookings_checkin_token ON bookings(checkin_token);

-- ============================================
-- 3. CHECK-INS TABLE (Registration records)
-- ============================================
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  -- Check-in data
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checked_in_by TEXT, -- 'self' or admin name
  device_info TEXT, -- Browser/device used for self check-in
  ip_address TEXT,
  -- Documents captured at check-in
  signature_url TEXT,
  passport_url TEXT,
  -- Consents captured at check-in
  rules_accepted BOOLEAN DEFAULT FALSE,
  rules_accepted_at TIMESTAMP WITH TIME ZONE,
  gdpr_consent BOOLEAN DEFAULT FALSE,
  gdpr_consent_at TIMESTAMP WITH TIME ZONE,
  -- Additional info
  arrival_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for booking lookups
CREATE INDEX IF NOT EXISTS idx_check_ins_booking ON check_ins(booking_id);

-- ============================================
-- 4. CONSENT LOGS (GDPR audit trail)
-- ============================================
CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Who consented
  guest_id UUID REFERENCES guests(id),
  booking_id UUID REFERENCES bookings(id),
  email TEXT NOT NULL,
  -- What was consented
  consent_type TEXT NOT NULL, -- 'gdpr', 'marketing', 'rules', 'cookies'
  consent_given BOOLEAN NOT NULL,
  consent_text TEXT, -- The exact text shown to user
  -- When and how
  consented_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  -- Withdrawal tracking
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  withdrawal_reason TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_consent_logs_email ON consent_logs(email);
CREATE INDEX IF NOT EXISTS idx_consent_logs_type ON consent_logs(consent_type);

-- ============================================
-- 5. CLEANING TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cleaning_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id TEXT NOT NULL DEFAULT '1',
  -- What to clean
  room_id TEXT, -- NULL for common areas
  area_type TEXT NOT NULL, -- 'room', 'bathroom', 'kitchen', 'pool', 'terrace', 'common'
  area_name TEXT NOT NULL, -- 'Room 101', 'Main Bathroom', etc.
  -- Task details
  task_type TEXT NOT NULL, -- 'daily', 'checkout', 'deep_clean', 'maintenance'
  checklist JSONB DEFAULT '[]'::jsonb, -- Array of checklist items
  -- Assignment
  assigned_to TEXT, -- Volunteer/staff name
  assigned_at TIMESTAMP WITH TIME ZONE,
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'verified'
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  verified_by TEXT, -- Admin who verified
  verified_at TIMESTAMP WITH TIME ZONE,
  -- Scheduling
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_time TIME,
  -- Notes
  notes TEXT,
  photos JSONB DEFAULT '[]'::jsonb, -- Before/after photos
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_date ON cleaning_tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_status ON cleaning_tasks(status);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_assigned ON cleaning_tasks(assigned_to);

-- ============================================
-- 6. CLEANING CHECKLIST TEMPLATES
-- ============================================
CREATE TABLE IF NOT EXISTS cleaning_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id TEXT NOT NULL DEFAULT '1',
  name TEXT NOT NULL,
  name_es TEXT,
  area_type TEXT NOT NULL,
  task_type TEXT NOT NULL,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example checklist item: {"id": "1", "task": "Change sheets", "task_es": "Cambiar sábanas", "required": true}
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. EMAIL REMINDERS TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS email_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL, -- 'checkin_1day', 'checkout_morning', 'review_request'
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for finding pending reminders
CREATE INDEX IF NOT EXISTS idx_email_reminders_pending
ON email_reminders(scheduled_for)
WHERE status = 'pending';

-- ============================================
-- 8. HOSTEL RULES (Digitized house rules)
-- ============================================
CREATE TABLE IF NOT EXISTS hostel_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id TEXT NOT NULL DEFAULT '1',
  category TEXT NOT NULL, -- 'quiet_hours', 'smoking', 'visitors', 'common_areas', 'safety', 'payment', 'cancellation'
  title TEXT NOT NULL,
  title_es TEXT,
  description TEXT NOT NULL,
  description_es TEXT,
  icon TEXT, -- Lucide icon name
  display_order INTEGER DEFAULT 0,
  required_acceptance BOOLEAN DEFAULT TRUE, -- Must guest explicitly accept this?
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. INSERT DEFAULT HOSTEL RULES
-- ============================================
INSERT INTO hostel_rules (category, title, title_es, description, description_es, icon, display_order, required_acceptance) VALUES
('quiet_hours', 'Quiet Hours', 'Horas de Silencio', 'Please keep noise to a minimum between 11:00 PM and 8:00 AM.', 'Por favor mantenga el ruido al mínimo entre las 23:00 y las 8:00.', 'Moon', 1, true),
('smoking', 'No Smoking', 'Prohibido Fumar', 'Smoking is not allowed inside the hostel. Please use designated outdoor areas.', 'No está permitido fumar dentro del hostel. Por favor use las áreas exteriores designadas.', 'Ban', 2, true),
('visitors', 'Visitors Policy', 'Política de Visitantes', 'Visitors are not allowed in rooms or dorms. Guests may meet visitors in common areas until 10:00 PM.', 'Los visitantes no están permitidos en las habitaciones o dormitorios. Los huéspedes pueden reunirse con visitantes en áreas comunes hasta las 22:00.', 'Users', 3, true),
('common_areas', 'Common Areas', 'Áreas Comunes', 'Please clean up after yourself in the kitchen and common areas. Be respectful of other guests.', 'Por favor limpie después de usar la cocina y áreas comunes. Sea respetuoso con los demás huéspedes.', 'Home', 4, true),
('safety', 'Safety & Security', 'Seguridad', 'Always lock your locker. Keep valuables secured. Report any suspicious activity to staff.', 'Siempre cierre su casillero. Mantenga sus objetos de valor seguros. Reporte cualquier actividad sospechosa al personal.', 'Shield', 5, true),
('damages', 'Damages Policy', 'Política de Daños', 'Guests are responsible for any damages caused during their stay. Damage costs will be charged accordingly.', 'Los huéspedes son responsables de cualquier daño causado durante su estadía. Los costos de daños serán cobrados correspondientemente.', 'AlertTriangle', 6, true),
('checkout', 'Check-out', 'Check-out', 'Check-out is by 12:00 PM. Late check-out may incur additional charges.', 'El check-out es antes de las 12:00. El check-out tardío puede generar cargos adicionales.', 'Clock', 7, true),
('alcohol', 'Alcohol Policy', 'Política de Alcohol', 'Moderate alcohol consumption is allowed in designated areas. Excessive intoxication may result in removal.', 'El consumo moderado de alcohol está permitido en áreas designadas. La intoxicación excesiva puede resultar en expulsión.', 'Wine', 8, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 10. INSERT DEFAULT CLEANING TEMPLATES
-- ============================================
INSERT INTO cleaning_templates (name, name_es, area_type, task_type, checklist) VALUES
('Room Checkout Clean', 'Limpieza de Checkout', 'room', 'checkout', '[
  {"id": "1", "task": "Strip and remake bed with fresh linens", "task_es": "Cambiar sábanas y hacer la cama", "required": true},
  {"id": "2", "task": "Empty and wipe trash bins", "task_es": "Vaciar y limpiar basureros", "required": true},
  {"id": "3", "task": "Dust all surfaces", "task_es": "Quitar polvo de superficies", "required": true},
  {"id": "4", "task": "Sweep and mop floor", "task_es": "Barrer y trapear piso", "required": true},
  {"id": "5", "task": "Check and restock towels", "task_es": "Verificar y reponer toallas", "required": true},
  {"id": "6", "task": "Clean windows and mirrors", "task_es": "Limpiar ventanas y espejos", "required": false},
  {"id": "7", "task": "Check lights and electronics work", "task_es": "Verificar luces y electrónicos", "required": true},
  {"id": "8", "task": "Air out room", "task_es": "Ventilar habitación", "required": true}
]'::jsonb),
('Bathroom Daily Clean', 'Limpieza Diaria de Baño', 'bathroom', 'daily', '[
  {"id": "1", "task": "Clean and disinfect toilet", "task_es": "Limpiar y desinfectar inodoro", "required": true},
  {"id": "2", "task": "Clean sink and counter", "task_es": "Limpiar lavabo y mesada", "required": true},
  {"id": "3", "task": "Clean shower/tub", "task_es": "Limpiar ducha/bañera", "required": true},
  {"id": "4", "task": "Restock toilet paper", "task_es": "Reponer papel higiénico", "required": true},
  {"id": "5", "task": "Restock soap/shampoo", "task_es": "Reponer jabón/shampoo", "required": true},
  {"id": "6", "task": "Clean mirrors", "task_es": "Limpiar espejos", "required": true},
  {"id": "7", "task": "Mop floor", "task_es": "Trapear piso", "required": true},
  {"id": "8", "task": "Empty trash", "task_es": "Vaciar basura", "required": true}
]'::jsonb),
('Kitchen Daily Clean', 'Limpieza Diaria de Cocina', 'kitchen', 'daily', '[
  {"id": "1", "task": "Wash all dishes in sink", "task_es": "Lavar platos en el fregadero", "required": true},
  {"id": "2", "task": "Wipe down counters and stove", "task_es": "Limpiar mesadas y estufa", "required": true},
  {"id": "3", "task": "Clean microwave inside", "task_es": "Limpiar microondas por dentro", "required": true},
  {"id": "4", "task": "Check and clean refrigerator", "task_es": "Revisar y limpiar refrigerador", "required": true},
  {"id": "5", "task": "Sweep and mop floor", "task_es": "Barrer y trapear piso", "required": true},
  {"id": "6", "task": "Empty and replace trash bag", "task_es": "Vaciar y cambiar bolsa de basura", "required": true},
  {"id": "7", "task": "Restock paper towels", "task_es": "Reponer toallas de papel", "required": true}
]'::jsonb),
('Pool Area Clean', 'Limpieza de Área de Piscina', 'pool', 'daily', '[
  {"id": "1", "task": "Skim pool surface", "task_es": "Limpiar superficie de la piscina", "required": true},
  {"id": "2", "task": "Clean and arrange pool furniture", "task_es": "Limpiar y ordenar muebles de piscina", "required": true},
  {"id": "3", "task": "Empty trash bins", "task_es": "Vaciar basureros", "required": true},
  {"id": "4", "task": "Check pool chemical levels", "task_es": "Verificar niveles químicos de piscina", "required": true},
  {"id": "5", "task": "Sweep deck area", "task_es": "Barrer área de deck", "required": true}
]'::jsonb),
('Common Area Clean', 'Limpieza de Áreas Comunes', 'common', 'daily', '[
  {"id": "1", "task": "Vacuum/sweep floors", "task_es": "Aspirar/barrer pisos", "required": true},
  {"id": "2", "task": "Dust surfaces and furniture", "task_es": "Quitar polvo de superficies y muebles", "required": true},
  {"id": "3", "task": "Arrange and straighten furniture", "task_es": "Ordenar y acomodar muebles", "required": true},
  {"id": "4", "task": "Empty trash bins", "task_es": "Vaciar basureros", "required": true},
  {"id": "5", "task": "Clean windows and glass doors", "task_es": "Limpiar ventanas y puertas de vidrio", "required": false},
  {"id": "6", "task": "Check and restock supplies", "task_es": "Verificar y reponer suministros", "required": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================
-- 11. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_rules ENABLE ROW LEVEL SECURITY;

-- Public can read hostel rules (for displaying on website)
CREATE POLICY "Public can read active hostel rules" ON hostel_rules
FOR SELECT USING (active = true);

-- Public can insert guests (self-registration)
CREATE POLICY "Public can insert guests" ON guests
FOR INSERT WITH CHECK (true);

-- Public can insert check_ins (self check-in)
CREATE POLICY "Public can insert check_ins" ON check_ins
FOR INSERT WITH CHECK (true);

-- Public can insert consent_logs (recording consent)
CREATE POLICY "Public can insert consent_logs" ON consent_logs
FOR INSERT WITH CHECK (true);

-- Service role has full access (for admin operations)
CREATE POLICY "Service role full access to guests" ON guests
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to check_ins" ON check_ins
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to consent_logs" ON consent_logs
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to cleaning_tasks" ON cleaning_tasks
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to cleaning_templates" ON cleaning_templates
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to email_reminders" ON email_reminders
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to hostel_rules" ON hostel_rules
FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 12. HELPER FUNCTIONS
-- ============================================

-- Function to generate unique checkin token
CREATE OR REPLACE FUNCTION generate_checkin_token()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..32 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate checkin token on booking insert
CREATE OR REPLACE FUNCTION set_checkin_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.checkin_token IS NULL THEN
    NEW.checkin_token := generate_checkin_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS booking_checkin_token_trigger ON bookings;
CREATE TRIGGER booking_checkin_token_trigger
BEFORE INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION set_checkin_token();

-- Update existing bookings without checkin tokens
UPDATE bookings
SET checkin_token = generate_checkin_token()
WHERE checkin_token IS NULL;
