-- ==============================================================================
-- Migration: IAM System Phase 4 - Backend IAM Security
-- Audit Logging Triggers
-- ==============================================================================

-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    changed_by UUID, -- Usually mapped to auth.uid()
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Protect audit_logs (append-only via RLS)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    CREATE POLICY "Super Admins can view audit logs"
        ON audit_logs FOR SELECT TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM recruiter_profiles 
                WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN')
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Disable normal inserts (only triggers should insert)
DO $$
BEGIN
    CREATE POLICY "Block direct inserts to audit logs"
        ON audit_logs FOR INSERT TO authenticated
        WITH CHECK (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ==============================================================================
-- 2. Create the Generic Audit Trigger Function
-- ==============================================================================
CREATE OR REPLACE FUNCTION process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    changed_fields JSONB;
    old_record JSONB;
    new_record JSONB;
BEGIN
    -- We only care about specific sensitive fields for performance
    -- checking if role, account_status, or verification_status changed
    IF TG_OP = 'UPDATE' THEN
        -- Safely extract fields if they exist
        old_record := row_to_json(OLD)::jsonb;
        new_record := row_to_json(NEW)::jsonb;
        
        -- Check if any sensitive fields actually changed
        IF (old_record->>'role' IS DISTINCT FROM new_record->>'role') OR
           (old_record->>'account_status' IS DISTINCT FROM new_record->>'account_status') OR
           (old_record->>'verification_status' IS DISTINCT FROM new_record->>'verification_status') THEN
            
            INSERT INTO audit_logs (table_name, record_id, action, changed_by, old_data, new_data)
            VALUES (
                TG_TABLE_NAME, 
                NEW.id, 
                'UPDATE', 
                auth.uid(), -- Uses the active Supabase JWT session user ID. If null, it was an internal system change.
                old_record, 
                new_record
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==============================================================================
-- 3. Attach Triggers to Sensitive Tables
-- ==============================================================================

-- Drop existing if re-running
DROP TRIGGER IF EXISTS audit_student_profiles_changes ON student_profiles;
DROP TRIGGER IF EXISTS audit_recruiter_profiles_changes ON recruiter_profiles;
DROP TRIGGER IF EXISTS audit_companies_changes ON companies;

-- student_profiles
CREATE TRIGGER audit_student_profiles_changes
AFTER UPDATE ON student_profiles
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

-- recruiter_profiles
CREATE TRIGGER audit_recruiter_profiles_changes
AFTER UPDATE ON recruiter_profiles
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

-- companies
CREATE TRIGGER audit_companies_changes
AFTER UPDATE ON companies
FOR EACH ROW EXECUTE FUNCTION process_audit_log();
