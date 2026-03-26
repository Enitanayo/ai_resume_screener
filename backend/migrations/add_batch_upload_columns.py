"""
Migration: Add batch upload columns to candidates_applications table.

Changes:
  - Make candidate_id nullable (ALTER COLUMN ... DROP NOT NULL)
  - Add source column (default 'self_applied')
  - Add applicant_name column (nullable)
  - Add applicant_email column (nullable)

Run with:  python -m backend.migrations.add_batch_upload_columns
"""

from backend.database import engine


SQL = """
-- 1. Make candidate_id nullable
ALTER TABLE candidates_applications ALTER COLUMN candidate_id DROP NOT NULL;

-- 2. Add source column with default
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'candidates_applications' AND column_name = 'source'
    ) THEN
        ALTER TABLE candidates_applications
            ADD COLUMN source VARCHAR NOT NULL DEFAULT 'self_applied';
    END IF;
END $$;

-- 3. Add applicant_name column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'candidates_applications' AND column_name = 'applicant_name'
    ) THEN
        ALTER TABLE candidates_applications ADD COLUMN applicant_name VARCHAR;
    END IF;
END $$;

-- 4. Add applicant_email column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'candidates_applications' AND column_name = 'applicant_email'
    ) THEN
        ALTER TABLE candidates_applications ADD COLUMN applicant_email VARCHAR;
    END IF;
END $$;
"""


def run_migration():
    with engine.connect() as conn:
        conn.execute(__import__("sqlalchemy").text(SQL))
        conn.commit()
        print("Migration complete: batch upload columns added to candidates_applications.")


if __name__ == "__main__":
    run_migration()
