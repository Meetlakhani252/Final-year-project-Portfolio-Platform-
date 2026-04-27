-- Add 'application' to the notifications type CHECK constraint
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('comment', 'dm', 'team_match', 'event_new', 'forum_reply', 'application'));
