-- Migration: IAM System Phase 2
-- Adds Colleges, User Profiles, and expands roles

-- ==============================================================================
-- 1. Colleges Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT,
    verification_status TEXT DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ==============================================================================
-- 2. User Profiles Table (Central IAM)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('STUDENT', 'RECRUITER', 'COMPANY_ADMIN', 'COLLEGE_ADMIN', 'VERIFICATION_OFFICER', 'PLATFORM_ADMIN', 'SUPER_ADMIN')),
    account_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION')),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_company ON user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_college ON user_profiles(college_id);


-- ==============================================================================
-- 3. Alter Existing Tables
-- ==============================================================================
DO $$ 
BEGIN 
    ALTER TABLE student_profiles ADD COLUMN college_id UUID REFERENCES colleges(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Alter company_recruiters to allow 'COMPANY_ADMIN'
DO $$ 
BEGIN
    ALTER TABLE company_recruiters DROP CONSTRAINT company_recruiters_role_check;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE company_recruiters 
    ADD CONSTRAINT company_recruiters_role_check 
    CHECK (role IN ('ADMIN', 'MEMBER', 'COMPANY_ADMIN'));


-- ==============================================================================
-- 4. RLS Policies
-- ==============================================================================
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4.1 Colleges
DO $$
BEGIN
    CREATE POLICY "Public read access to verified colleges" 
        ON colleges 
        FOR SELECT 
        USING (verification_status = 'VERIFIED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4.2 User Profiles
DO $$
BEGIN
    CREATE POLICY "Users can read own profile" 
        ON user_profiles 
        FOR SELECT 
        TO authenticated 
        USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$
BEGIN
    CREATE POLICY "Admins can view all profiles"
        ON user_profiles
        FOR SELECT
        TO authenticated
        USING (
            (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('PLATFORM_ADMIN', 'SUPER_ADMIN')
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ==============================================================================
-- 5. Data Backfill
-- ==============================================================================
-- Backfill existing students
INSERT INTO user_profiles (id, role, account_status)
SELECT id, 'STUDENT', 'ACTIVE' FROM student_profiles
ON CONFLICT (id) DO NOTHING;

-- Backfill existing recruiters
INSERT INTO user_profiles (id, role, account_status, company_id)
SELECT id, 'RECRUITER', 'ACTIVE', company_id FROM recruiter_profiles
ON CONFLICT (id) DO NOTHING;
