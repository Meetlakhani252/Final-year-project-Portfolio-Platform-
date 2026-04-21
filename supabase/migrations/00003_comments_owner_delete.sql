-- Allow portfolio owners to delete any comment on their own content
CREATE POLICY "Portfolio owners can delete comments on their content"
  ON comments FOR DELETE
  USING (
    (target_type = 'project' AND EXISTS (
      SELECT 1 FROM projects WHERE id = target_id AND profile_id = auth.uid()
    ))
    OR
    (target_type = 'blog_post' AND EXISTS (
      SELECT 1 FROM blog_posts WHERE id = target_id AND profile_id = auth.uid()
    ))
  );
