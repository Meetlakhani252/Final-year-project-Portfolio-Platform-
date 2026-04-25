-- ============================================================
-- Job Board — job_postings & job_applications tables
-- ============================================================

-- job_postings
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('job', 'internship')),
  location TEXT,
  location_type TEXT NOT NULL DEFAULT 'onsite' CHECK (location_type IN ('onsite', 'remote', 'hybrid')),
  salary_min INTEGER,
  salary_max INTEGER,
  description TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  application_deadline DATE,
  is_active BOOLEAN DEFAULT TRUE,
  application_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- job_applications
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, student_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_job_postings_recruiter ON job_postings(recruiter_id);
CREATE INDEX idx_job_postings_active ON job_postings(is_active, created_at DESC);
CREATE INDEX idx_job_postings_type ON job_postings(type);
CREATE INDEX idx_job_applications_job ON job_applications(job_id);
CREATE INDEX idx_job_applications_student ON job_applications(student_id, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- job_postings: active postings visible to everyone; recruiter sees own inactive ones too
CREATE POLICY "Job postings viewable by everyone"
  ON job_postings FOR SELECT
  USING (is_active = true OR auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can insert own job postings"
  ON job_postings FOR INSERT
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can update own job postings"
  ON job_postings FOR UPDATE
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can delete own job postings"
  ON job_postings FOR DELETE
  USING (auth.uid() = recruiter_id);

-- job_applications: student sees own; recruiter sees apps for their postings
CREATE POLICY "Students see own applications, recruiters see their job's applications"
  ON job_applications FOR SELECT
  USING (
    auth.uid() = student_id
    OR auth.uid() IN (
      SELECT recruiter_id FROM job_postings WHERE id = job_id
    )
  );

CREATE POLICY "Students can insert own applications"
  ON job_applications FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Recruiters can update application status"
  ON job_applications FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT recruiter_id FROM job_postings WHERE id = job_id
    )
  );

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON job_postings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-increment / decrement application_count on job_postings
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE job_postings SET application_count = application_count + 1 WHERE id = NEW.job_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE job_postings SET application_count = GREATEST(application_count - 1, 0) WHERE id = OLD.job_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER on_job_application_change
  AFTER INSERT OR DELETE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_job_application_count();
