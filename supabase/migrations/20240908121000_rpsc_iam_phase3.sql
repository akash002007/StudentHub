-- ==============================================================================
-- Migration: IAM System Phase 3 - Resource-Level Authorization
-- Safely extending existing User/Profile tables & Enforcing Strict RLS
-- ==============================================================================

-- 1. Alter Existing Profile Tables to include IAM fields safely
DO $$ 
BEGIN 
    -- 1.1 student_profiles
    ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'RECRUITER', 'COMPANY_ADMIN', 'COLLEGE_ADMIN', 'VERIFICATION_OFFICER', 'PLATFORM_ADMIN', 'SUPER_ADMIN'));
    ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'));
    ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
    ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES colleges(id) ON DELETE SET NULL;

    -- 1.2 recruiter_profiles
    ALTER TABLE recruiter_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'RECRUITER' CHECK (role IN ('STUDENT', 'RECRUITER', 'COMPANY_ADMIN', 'COLLEGE_ADMIN', 'VERIFICATION_OFFICER', 'PLATFORM_ADMIN', 'SUPER_ADMIN'));
    ALTER TABLE recruiter_profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'));
    -- company_id already exists on recruiter_profiles
    ALTER TABLE recruiter_profiles ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES colleges(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;


-- ==============================================================================
-- 2. Drop existing conflicting policies for a clean slate
-- ==============================================================================
DROP POLICY IF EXISTS "Students can view their own applications" ON applications;
DROP POLICY IF EXISTS "Students can submit applications for themselves" ON applications;
DROP POLICY IF EXISTS "Recruiters can manage applications for their company" ON applications;
DROP POLICY IF EXISTS "Allow read access to internships for all authenticated users" ON internships;
DROP POLICY IF EXISTS "Allow read access to internships for anon users" ON internships;


-- ==============================================================================
-- 3. Strict Resource-Level Authorization (Level 1-5)
-- ==============================================================================

-- Enable RLS on all relevant tables
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Level 1: Students
-- ------------------------------------------------------------------------------
-- Students can read all active internships
CREATE POLICY "Students can read active internships" 
    ON internships FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM student_profiles WHERE id = auth.uid() AND role = 'STUDENT')
    );

-- Students can read their own private profile data
CREATE POLICY "Students can read own profile" 
    ON student_profiles FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Students can only read their own applications
CREATE POLICY "Students can read own applications" 
    ON applications FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Students can submit applications for themselves
CREATE POLICY "Students can insert own applications" 
    ON applications FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- Level 2: Recruiters & Company Admins
-- ------------------------------------------------------------------------------
-- Recruiters/Company Admins can read internships linked to their company
CREATE POLICY "Company Staff can read their internships"
    ON internships FOR SELECT TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM recruiter_profiles 
            WHERE id = auth.uid() AND role IN ('RECRUITER', 'COMPANY_ADMIN') AND account_status = 'ACTIVE'
        )
    );

-- Recruiters/Company Admins can manage internships for their company
CREATE POLICY "Company Staff can manage their internships"
    ON internships FOR ALL TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM recruiter_profiles 
            WHERE id = auth.uid() AND role IN ('RECRUITER', 'COMPANY_ADMIN') AND account_status = 'ACTIVE'
        )
    );

-- Recruiters/Company Admins can read/update applications for their internships
CREATE POLICY "Company Staff can manage applications for their internships"
    ON applications FOR ALL TO authenticated
    USING (
        internship_id IN (
            SELECT i.id FROM internships i
            JOIN recruiter_profiles rp ON rp.company_id = i.company_id
            WHERE rp.id = auth.uid() AND rp.role IN ('RECRUITER', 'COMPANY_ADMIN') AND rp.account_status = 'ACTIVE'
        )
    );

-- ------------------------------------------------------------------------------
-- Level 3: College Admins
-- ------------------------------------------------------------------------------
-- College Admins can view student profiles belonging to their college
CREATE POLICY "College Admins can view their students"
    ON student_profiles FOR SELECT TO authenticated
    USING (
        college_id IN (
            SELECT college_id FROM recruiter_profiles -- Assuming admins use recruiter_profiles or similar
            WHERE id = auth.uid() AND role = 'COLLEGE_ADMIN' AND account_status = 'ACTIVE'
        )
    );

-- College Admins can view applications made by their students
CREATE POLICY "College Admins can view their student applications"
    ON applications FOR SELECT TO authenticated
    USING (
        user_id IN (
            SELECT id FROM student_profiles sp
            WHERE sp.college_id IN (
                SELECT college_id FROM recruiter_profiles 
                WHERE id = auth.uid() AND role = 'COLLEGE_ADMIN' AND account_status = 'ACTIVE'
            )
        )
    );

-- ------------------------------------------------------------------------------
-- Level 4: Verification Officers
-- ------------------------------------------------------------------------------
-- Verification Officers have isolated access to update verification statuses on companies
CREATE POLICY "Verification Officers can manage companies"
    ON companies FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM recruiter_profiles 
            WHERE id = auth.uid() AND role = 'VERIFICATION_OFFICER' AND account_status = 'ACTIVE'
        )
    );

-- Verification Officers can manage colleges
CREATE POLICY "Verification Officers can manage colleges"
    ON colleges FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM recruiter_profiles 
            WHERE id = auth.uid() AND role = 'VERIFICATION_OFFICER' AND account_status = 'ACTIVE'
        )
    );

-- ------------------------------------------------------------------------------
-- Level 5: Platform / Super Admins
-- ------------------------------------------------------------------------------
-- Super Admins have unrestricted read/write across all tables
CREATE POLICY "Super Admins have full access to student_profiles"
    ON student_profiles FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM recruiter_profiles WHERE id = auth.uid() AND role IN ('PLATFORM_ADMIN', 'SUPER_ADMIN')));

CREATE POLICY "Super Admins have full access to recruiter_profiles"
    ON recruiter_profiles FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM recruiter_profiles WHERE id = auth.uid() AND role IN ('PLATFORM_ADMIN', 'SUPER_ADMIN')));

CREATE POLICY "Super Admins have full access to internships"
    ON internships FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM recruiter_profiles WHERE id = auth.uid() AND role IN ('PLATFORM_ADMIN', 'SUPER_ADMIN')));

CREATE POLICY "Super Admins have full access to applications"
    ON applications FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM recruiter_profiles WHERE id = auth.uid() AND role IN ('PLATFORM_ADMIN', 'SUPER_ADMIN')));
