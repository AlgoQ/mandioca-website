-- User Profiles and Authentication System
-- Supports: Admin, Staff, Volunteer roles with magic link invites

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'volunteer');

-- Create enum for invite status
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

-- Profiles table - extends Supabase auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'volunteer',
  avatar_url TEXT,

  -- Passport/ID tracking for volunteers
  passport_number TEXT,
  passport_expiry DATE,
  nationality TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,

  -- Work tracking
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  invited_by UUID REFERENCES profiles(id)
);

-- Invitations table - for tracking magic link invites
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'volunteer',
  status invite_status DEFAULT 'pending',

  -- Invite metadata
  invited_by UUID REFERENCES profiles(id) NOT NULL,
  message TEXT, -- Optional personal message in invite email

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,

  -- Prevent duplicate pending invites
  CONSTRAINT unique_pending_invite UNIQUE (email, status)
    DEFERRABLE INITIALLY DEFERRED
);

-- Index for faster lookups
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_status ON invitations(status);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert profiles (for invites)
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Staff can view volunteer profiles
CREATE POLICY "Staff can view volunteers"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
    AND role = 'volunteer'
  );

-- RLS Policies for invitations

-- Admins can do everything with invitations
CREATE POLICY "Admins can manage invitations"
  ON invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Staff can create volunteer invitations
CREATE POLICY "Staff can invite volunteers"
  ON invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'staff'
    )
    AND role = 'volunteer'
  );

-- Staff can view their own invitations
CREATE POLICY "Staff can view own invitations"
  ON invitations FOR SELECT
  USING (
    invited_by = auth.uid()
  );

-- Function to handle new user signup (triggered by Supabase Auth)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Check for pending invitation
  SELECT * INTO invite_record
  FROM invitations
  WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    -- Create profile with invited role
    INSERT INTO profiles (id, email, role, invited_by)
    VALUES (NEW.id, NEW.email, invite_record.role, invite_record.invited_by);

    -- Mark invitation as accepted
    UPDATE invitations
    SET status = 'accepted', accepted_at = NOW()
    WHERE id = invite_record.id;
  ELSE
    -- No invitation found - reject or create as minimal role
    -- For security, we don't auto-create profiles for uninvited users
    RAISE EXCEPTION 'No valid invitation found for this email';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update last login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_login_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send magic link invite (called from API)
-- Returns the invitation ID for tracking
CREATE OR REPLACE FUNCTION create_invitation(
  p_email TEXT,
  p_role user_role,
  p_invited_by UUID,
  p_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  invite_id UUID;
BEGIN
  -- Check if inviter has permission
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_invited_by
    AND (
      role = 'admin'
      OR (role = 'staff' AND p_role = 'volunteer')
    )
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to invite this role';
  END IF;

  -- Expire any existing pending invites for this email
  UPDATE invitations
  SET status = 'expired'
  WHERE email = p_email AND status = 'pending';

  -- Create new invitation
  INSERT INTO invitations (email, role, invited_by, message)
  VALUES (p_email, p_role, p_invited_by, p_message)
  RETURNING id INTO invite_id;

  RETURN invite_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to check if user has minimum role
CREATE OR REPLACE FUNCTION has_role(user_id UUID, min_role user_role)
RETURNS BOOLEAN AS $$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val FROM profiles WHERE id = user_id;

  IF user_role_val IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Role hierarchy: admin > staff > volunteer
  CASE min_role
    WHEN 'volunteer' THEN RETURN TRUE;
    WHEN 'staff' THEN RETURN user_role_val IN ('staff', 'admin');
    WHEN 'admin' THEN RETURN user_role_val = 'admin';
    ELSE RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON TYPE user_role TO authenticated;
GRANT USAGE ON TYPE invite_status TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON invitations TO authenticated;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing staff_users to invitations (if table exists)
-- This creates pending invitations for users who haven't signed up via Supabase Auth yet
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'staff_users') THEN
    -- For each existing staff_user without a corresponding profile,
    -- create a pending invitation so they can sign up with magic link
    INSERT INTO invitations (email, role, invited_by, message, status)
    SELECT
      su.email,
      su.role::user_role,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'Migrated from legacy system',
      'pending'::invite_status
    FROM staff_users su
    WHERE NOT EXISTS (
      SELECT 1 FROM profiles p WHERE p.email = su.email
    )
    AND NOT EXISTS (
      SELECT 1 FROM invitations i WHERE i.email = su.email AND i.status = 'pending'
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- View for admin to see all users (both profiles and pending invitations)
CREATE OR REPLACE VIEW all_users AS
SELECT
  p.id,
  p.email,
  p.full_name as name,
  p.role::text as role,
  p.is_active as active,
  'active' as status,
  p.created_at,
  p.last_login_at
FROM profiles p
UNION ALL
SELECT
  i.id,
  i.email,
  '' as name,
  i.role::text as role,
  false as active,
  'invited' as status,
  i.created_at,
  NULL as last_login_at
FROM invitations i
WHERE i.status = 'pending';

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth with roles and hostel-specific data';
COMMENT ON TABLE invitations IS 'Magic link invitations for onboarding new staff and volunteers';
