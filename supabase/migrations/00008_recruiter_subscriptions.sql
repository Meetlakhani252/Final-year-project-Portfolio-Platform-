-- ============================================================
-- recruiter_subscriptions: students follow recruiters for job updates
-- ============================================================

CREATE TABLE IF NOT EXISTS recruiter_subscriptions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recruiter_id UUID      NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, recruiter_id),
  CHECK (student_id <> recruiter_id)
);

CREATE INDEX IF NOT EXISTS idx_recruiter_subs_student
  ON recruiter_subscriptions(student_id);

CREATE INDEX IF NOT EXISTS idx_recruiter_subs_recruiter
  ON recruiter_subscriptions(recruiter_id);

ALTER TABLE recruiter_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'recruiter_subscriptions'
      AND policyname = 'Students can manage own subscriptions'
  ) THEN
    CREATE POLICY "Students can manage own subscriptions"
      ON recruiter_subscriptions
      FOR ALL
      USING (student_id = auth.uid())
      WITH CHECK (student_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'recruiter_subscriptions'
      AND policyname = 'Recruiters can view their subscribers'
  ) THEN
    CREATE POLICY "Recruiters can view their subscribers"
      ON recruiter_subscriptions
      FOR SELECT
      USING (recruiter_id = auth.uid());
  END IF;
END $$;

-- ─── Add job_post to notifications type ──────────────────────────────────────

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'comment', 'dm', 'team_match', 'event_new',
    'forum_reply', 'application', 'job_post'
  ));
