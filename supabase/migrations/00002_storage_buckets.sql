-- ============================================================
-- Storage Buckets for Portfolio Photos and Project Images
-- Run this in Supabase SQL Editor (safe to run multiple times)
-- ============================================================

-- Create buckets (public, 5MB limit, images only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'portfolio-photos',
    'portfolio-photos',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'project-images',
    'project-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS Policies: portfolio-photos (drop first so re-runs work)
-- ============================================================

DROP POLICY IF EXISTS "portfolio_photos_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "portfolio_photos_owner_insert"  ON storage.objects;
DROP POLICY IF EXISTS "portfolio_photos_owner_update"  ON storage.objects;
DROP POLICY IF EXISTS "portfolio_photos_owner_delete"  ON storage.objects;

CREATE POLICY "portfolio_photos_public_read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'portfolio-photos');

CREATE POLICY "portfolio_photos_owner_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "portfolio_photos_owner_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'portfolio-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "portfolio_photos_owner_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'portfolio-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- RLS Policies: project-images (drop first so re-runs work)
-- ============================================================

DROP POLICY IF EXISTS "project_images_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "project_images_owner_insert"  ON storage.objects;
DROP POLICY IF EXISTS "project_images_owner_update"  ON storage.objects;
DROP POLICY IF EXISTS "project_images_owner_delete"  ON storage.objects;

CREATE POLICY "project_images_public_read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'project-images');

CREATE POLICY "project_images_owner_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'project-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "project_images_owner_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'project-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "project_images_owner_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'project-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );