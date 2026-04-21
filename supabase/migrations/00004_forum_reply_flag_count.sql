-- Add flag_count to forum_replies
ALTER TABLE forum_replies ADD COLUMN flag_count INTEGER DEFAULT 0;

-- Fix existing vote-count trigger to use SECURITY DEFINER so it can bypass RLS
-- when updating upvote_count on posts owned by other users.
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts SET upvote_count = upvote_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts SET upvote_count = upvote_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: increment/decrement reply_count on forum_posts
CREATE OR REPLACE FUNCTION update_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts SET reply_count = reply_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts SET reply_count = reply_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reply_change
  AFTER INSERT OR DELETE ON forum_replies
  FOR EACH ROW EXECUTE FUNCTION update_reply_count();

-- Trigger: increment/decrement flag_count on forum_posts or forum_replies
CREATE OR REPLACE FUNCTION update_flag_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'post' THEN
      UPDATE forum_posts SET flag_count = flag_count + 1 WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'reply' THEN
      UPDATE forum_replies SET flag_count = flag_count + 1 WHERE id = NEW.target_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'post' THEN
      UPDATE forum_posts SET flag_count = flag_count - 1 WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'reply' THEN
      UPDATE forum_replies SET flag_count = flag_count - 1 WHERE id = OLD.target_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_flag_change
  AFTER INSERT OR DELETE ON forum_post_flags
  FOR EACH ROW EXECUTE FUNCTION update_flag_count();
