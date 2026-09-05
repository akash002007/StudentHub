-- Migration: RPSC Phase 1 Core Extensions

-- ==============================================================================
-- 1. Companies Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    website TEXT,
    industry TEXT,
    verification_status TEXT DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure any newly requested columns exist in case the table was already partially created
DO $$ 
BEGIN 
    ALTER TABLE companies ADD COLUMN website TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ 
BEGIN 
    ALTER TABLE companies ADD COLUMN industry TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ 
BEGIN 
    ALTER TABLE companies ADD COLUMN verification_status TEXT DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED'));
EXCEPTION WHEN duplicate_column THEN NULL; END $$;


-- ==============================================================================
-- 2. Company Recruiters Junction Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS company_recruiters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'MEMBER')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_company_user UNIQUE(company_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_company_recruiters_user ON company_recruiters(user_id);
CREATE INDEX IF NOT EXISTS idx_company_recruiters_company ON company_recruiters(company_id);


-- ==============================================================================
-- 3. Alter Internships Table for Structured Eligibility
-- ==============================================================================
DO $$ 
BEGIN 
    ALTER TABLE internships ADD COLUMN min_cgpa NUMERIC(4,2);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ 
BEGIN 
    ALTER TABLE internships ADD COLUMN allowed_branches TEXT[];
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ 
BEGIN 
    ALTER TABLE internships ADD COLUMN graduation_year INT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ 
BEGIN 
    ALTER TABLE internships ADD COLUMN active_backlogs_allowed BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ 
BEGIN 
    -- If company_id wasn't already added, add it
    ALTER TABLE internships ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;


-- ==============================================================================
-- 4. Alter Applications Table to expand pipeline states
-- ==============================================================================
-- Drop the existing CHECK constraint if it exists, to replace it with the expanded one
DO $$ 
BEGIN
    ALTER TABLE applications DROP CONSTRAINT applications_status_check;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE applications 
    ADD CONSTRAINT applications_status_check 
    CHECK (status IN (
        'DRAFT', 
        'SUBMITTED', 
        'ELIGIBILITY_VERIFIED', 
        'UNDER_REVIEW', 
        'SHORTLISTED', 
        'ASSESSMENT', 
        'INTERVIEW', 
        'SELECTED', 
        'OFFER_SENT', 
        'ACCEPTED', 
        'JOINED', 
        'REJECTED'
    ));

-- Set default to SUBMITTED if not already
ALTER TABLE applications ALTER COLUMN status SET DEFAULT 'SUBMITTED';


-- ==============================================================================
-- 5. Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_recruiters ENABLE ROW LEVEL SECURITY;

-- 5.1 Companies Policies
-- Students can only view verified companies
DO $$
BEGIN
    CREATE POLICY "Students can view verified companies" 
        ON companies 
        FOR SELECT 
        TO authenticated 
        USING (verification_status = 'VERIFIED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Recruiters can view their own companies
DO $$
BEGIN
    CREATE POLICY "Recruiters can view their own companies"
        ON companies
        FOR SELECT
        TO authenticated
        USING (
            id IN (SELECT company_id FROM company_recruiters WHERE user_id = auth.uid())
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5.2 Applications Policies (Recruiter Access)
-- Recruiters can only update applications linked to their specific company's opportunities
DO $$
BEGIN
    CREATE POLICY "Recruiters can manage applications for their company"
        ON applications
        FOR ALL
        TO authenticated
        USING (
            internship_id IN (
                SELECT i.id FROM internships i
                JOIN company_recruiters cr ON cr.company_id = i.company_id
                WHERE cr.user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Ensure students can view their own applications (Fallback if missing)
DO $$
BEGIN
    CREATE POLICY "Students can view their own applications"
        ON applications
        FOR SELECT
        TO authenticated
        USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
