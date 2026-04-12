-- ============================================================
-- Student Portfolio Platform - Initial Schema Migration
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'recruiter', 'organizer')),
  avatar_url TEXT,
  bio TEXT,
  university TEXT,
  program TEXT,
  graduation_year INTEGER,
  gpa NUMERIC(4,2),
  gpa_public BOOLEAN DEFAULT FALSE,
  available_for TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  notification_preferences JSONB DEFAULT '{"email_comments": true, "email_dms": true, "email_team_match": true, "email_events": true, "email_forum_replies": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  github_url TEXT,
  live_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_imported BOOLEAN DEFAULT FALSE,
  github_repo_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- project_screenshots
CREATE TABLE project_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- skills
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'github')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, name)
);

-- certifications
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE,
  credential_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- education
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_date DATE,
  end_date DATE,
  gpa NUMERIC(4,2),
  courses TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- blog_posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content JSONB NOT NULL,
  content_plain TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, slug)
);

-- portfolio_photos
CREATE TABLE portfolio_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- social_links
CREATE TABLE social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('github', 'linkedin', 'website', 'twitter', 'other')),
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, platform)
);

-- portfolio_section_order
CREATE TABLE portfolio_section_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  section_order TEXT[] DEFAULT ARRAY['about', 'projects', 'skills', 'certifications', 'education', 'blog', 'photos', 'social_links'],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- portfolio_snapshots
CREATE TABLE portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  snapshot_data JSONB NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('monthly', 'project_added', 'certification_added', 'manual')),
  trigger_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- comments (polymorphic: project or blog_post)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('project', 'blog_post')),
  target_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_two UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_one, participant_two),
  CHECK (participant_one < participant_two)
);

-- messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- forum_categories
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- forum_posts
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  content_plain TEXT,
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_count INTEGER DEFAULT 0,
  upvote_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- forum_replies
CREATE TABLE forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- forum_post_votes
CREATE TABLE forum_post_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, profile_id)
);

-- forum_post_flags
CREATE TABLE forum_post_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'reply')),
  target_id UUID NOT NULL,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(target_type, target_id, profile_id)
);

-- events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('hackathon', 'academic', 'workshop', 'other')),
  event_date TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ,
  location_type TEXT NOT NULL CHECK (location_type IN ('online', 'offline', 'hybrid')),
  location_details TEXT,
  required_skills TEXT[] DEFAULT '{}',
  registration_url TEXT,
  interest_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- event_interests
CREATE TABLE event_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, profile_id)
);

-- team_posts
CREATE TABLE team_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  team_size_needed INTEGER DEFAULT 1,
  contact_preference TEXT DEFAULT 'dm' CHECK (contact_preference IN ('dm', 'comment', 'both')),
  is_open BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- team_post_comments
CREATE TABLE team_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_post_id UUID NOT NULL REFERENCES team_posts(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- recruiter_bookmarks
CREATE TABLE recruiter_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recruiter_id, student_id)
);

-- notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'dm', 'team_match', 'event_new', 'forum_reply')),
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- github_connections
CREATE TABLE github_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  github_username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

-- profiles
CREATE UNIQUE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_graduation_year ON profiles(graduation_year);
CREATE INDEX idx_profiles_university ON profiles(university);

-- projects
CREATE INDEX idx_projects_profile ON projects(profile_id);

-- project_screenshots
CREATE INDEX idx_screenshots_project ON project_screenshots(project_id);

-- skills
CREATE INDEX idx_skills_profile ON skills(profile_id);
CREATE INDEX idx_skills_name ON skills(name);

-- certifications
CREATE INDEX idx_certifications_profile ON certifications(profile_id);

-- education
CREATE INDEX idx_education_profile ON education(profile_id);

-- blog_posts
CREATE INDEX idx_blog_posts_profile ON blog_posts(profile_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);

-- portfolio_photos
CREATE INDEX idx_photos_profile ON portfolio_photos(profile_id);

-- social_links
CREATE INDEX idx_social_links_profile ON social_links(profile_id);

-- portfolio_snapshots
CREATE INDEX idx_snapshots_profile ON portfolio_snapshots(profile_id);
CREATE INDEX idx_snapshots_created ON portfolio_snapshots(created_at);

-- comments
CREATE INDEX idx_comments_target ON comments(target_type, target_id);
CREATE INDEX idx_comments_profile ON comments(profile_id);

-- conversations
CREATE INDEX idx_conversations_participants ON conversations(participant_one, participant_two);

-- messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_unread ON messages(conversation_id, read_at) WHERE read_at IS NULL;

-- forum_posts
CREATE INDEX idx_forum_posts_category ON forum_posts(category_id, created_at DESC);
CREATE INDEX idx_forum_posts_profile ON forum_posts(profile_id);

-- forum_replies
CREATE INDEX idx_forum_replies_post ON forum_replies(post_id, created_at);

-- events
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_organizer ON events(organizer_id);

-- team_posts
CREATE INDEX idx_team_posts_event ON team_posts(event_id);
CREATE INDEX idx_team_posts_open ON team_posts(is_open, created_at DESC);

-- team_post_comments
CREATE INDEX idx_team_comments_post ON team_post_comments(team_post_id);

-- recruiter_bookmarks
CREATE INDEX idx_bookmarks_recruiter ON recruiter_bookmarks(recruiter_id);

-- notifications
CREATE INDEX idx_notifications_profile ON notifications(profile_id, is_read, created_at DESC);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on ALL tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_section_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_connections ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- profiles policies
-- --------------------------------------------------------
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- --------------------------------------------------------
-- projects policies
-- --------------------------------------------------------
CREATE POLICY "Projects viewable by everyone"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- project_screenshots policies
-- --------------------------------------------------------
CREATE POLICY "Screenshots viewable by everyone"
  ON project_screenshots FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own project screenshots"
  ON project_screenshots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = project_id AND projects.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own project screenshots"
  ON project_screenshots FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = project_id AND projects.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project screenshots"
  ON project_screenshots FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = project_id AND projects.profile_id = auth.uid()
    )
  );

-- --------------------------------------------------------
-- skills policies
-- --------------------------------------------------------
CREATE POLICY "Skills viewable by everyone"
  ON skills FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own skills"
  ON skills FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own skills"
  ON skills FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own skills"
  ON skills FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- certifications policies
-- --------------------------------------------------------
CREATE POLICY "Certifications viewable by everyone"
  ON certifications FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own certifications"
  ON certifications FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own certifications"
  ON certifications FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own certifications"
  ON certifications FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- education policies
-- --------------------------------------------------------
CREATE POLICY "Education viewable by everyone"
  ON education FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own education"
  ON education FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own education"
  ON education FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own education"
  ON education FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- blog_posts policies
-- --------------------------------------------------------
CREATE POLICY "Published blog posts viewable by everyone"
  ON blog_posts FOR SELECT
  USING (status = 'published' OR auth.uid() = profile_id);

CREATE POLICY "Users can insert own blog posts"
  ON blog_posts FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own blog posts"
  ON blog_posts FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own blog posts"
  ON blog_posts FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- portfolio_photos policies
-- --------------------------------------------------------
CREATE POLICY "Photos viewable by everyone"
  ON portfolio_photos FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own photos"
  ON portfolio_photos FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own photos"
  ON portfolio_photos FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own photos"
  ON portfolio_photos FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- social_links policies
-- --------------------------------------------------------
CREATE POLICY "Social links viewable by everyone"
  ON social_links FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own social links"
  ON social_links FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own social links"
  ON social_links FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own social links"
  ON social_links FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- portfolio_section_order policies
-- --------------------------------------------------------
CREATE POLICY "Section order viewable by everyone"
  ON portfolio_section_order FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own section order"
  ON portfolio_section_order FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own section order"
  ON portfolio_section_order FOR UPDATE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- portfolio_snapshots policies
-- --------------------------------------------------------
CREATE POLICY "Users can view own snapshots"
  ON portfolio_snapshots FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own snapshots"
  ON portfolio_snapshots FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- --------------------------------------------------------
-- comments policies
-- --------------------------------------------------------
CREATE POLICY "Comments viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- conversations policies
-- --------------------------------------------------------
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_one OR auth.uid() = participant_two);

-- --------------------------------------------------------
-- messages policies
-- --------------------------------------------------------
CREATE POLICY "Users can read own messages"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE participant_one = auth.uid() OR participant_two = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (
      SELECT id FROM conversations
      WHERE participant_one = auth.uid() OR participant_two = auth.uid()
    )
  );

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE participant_one = auth.uid() OR participant_two = auth.uid()
    )
  );

-- --------------------------------------------------------
-- forum_categories policies
-- --------------------------------------------------------
CREATE POLICY "Forum categories viewable by everyone"
  ON forum_categories FOR SELECT
  USING (true);

-- --------------------------------------------------------
-- forum_posts policies
-- --------------------------------------------------------
CREATE POLICY "Forum posts viewable by everyone"
  ON forum_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own forum posts"
  ON forum_posts FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own forum posts"
  ON forum_posts FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own forum posts"
  ON forum_posts FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- forum_replies policies
-- --------------------------------------------------------
CREATE POLICY "Forum replies viewable by everyone"
  ON forum_replies FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own forum replies"
  ON forum_replies FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own forum replies"
  ON forum_replies FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own forum replies"
  ON forum_replies FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- forum_post_votes policies
-- --------------------------------------------------------
CREATE POLICY "Votes viewable by everyone"
  ON forum_post_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own votes"
  ON forum_post_votes FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own votes"
  ON forum_post_votes FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- forum_post_flags policies
-- --------------------------------------------------------
CREATE POLICY "Users can insert own flags"
  ON forum_post_flags FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can view own flags"
  ON forum_post_flags FOR SELECT
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- events policies
-- --------------------------------------------------------
CREATE POLICY "Events viewable by everyone"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Organizers can insert events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update own events"
  ON events FOR UPDATE
  USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete own events"
  ON events FOR DELETE
  USING (auth.uid() = organizer_id);

-- --------------------------------------------------------
-- event_interests policies
-- --------------------------------------------------------
CREATE POLICY "Event interests viewable by everyone"
  ON event_interests FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own event interests"
  ON event_interests FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own event interests"
  ON event_interests FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- team_posts policies
-- --------------------------------------------------------
CREATE POLICY "Team posts viewable by everyone"
  ON team_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own team posts"
  ON team_posts FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own team posts"
  ON team_posts FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own team posts"
  ON team_posts FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- team_post_comments policies
-- --------------------------------------------------------
CREATE POLICY "Team post comments viewable by everyone"
  ON team_post_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own team post comments"
  ON team_post_comments FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own team post comments"
  ON team_post_comments FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- recruiter_bookmarks policies
-- --------------------------------------------------------
CREATE POLICY "Recruiters can manage own bookmarks"
  ON recruiter_bookmarks FOR SELECT
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can insert own bookmarks"
  ON recruiter_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can update own bookmarks"
  ON recruiter_bookmarks FOR UPDATE
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can delete own bookmarks"
  ON recruiter_bookmarks FOR DELETE
  USING (auth.uid() = recruiter_id);

-- --------------------------------------------------------
-- notifications policies
-- --------------------------------------------------------
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- github_connections policies
-- --------------------------------------------------------
CREATE POLICY "Users can view own github connection"
  ON github_connections FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own github connection"
  ON github_connections FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own github connection"
  ON github_connections FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own github connection"
  ON github_connections FOR DELETE
  USING (auth.uid() = profile_id);

-- ============================================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================================

-- handle_new_user: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- update_updated_at: auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_certifications_updated_at
  BEFORE UPDATE ON certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_education_updated_at
  BEFORE UPDATE ON education
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_forum_replies_updated_at
  BEFORE UPDATE ON forum_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_team_posts_updated_at
  BEFORE UPDATE ON team_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_portfolio_section_order_updated_at
  BEFORE UPDATE ON portfolio_section_order
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- update_conversation_timestamp: update last_message_at on new message
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- update_vote_count: increment/decrement upvote_count
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts
    SET upvote_count = upvote_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts
    SET upvote_count = upvote_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER on_vote_change
  AFTER INSERT OR DELETE ON forum_post_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_vote_count();

-- ============================================================
-- 5. SEED DATA
-- ============================================================

INSERT INTO forum_categories (name, slug, description, display_order) VALUES
  ('Hackathons & Competitions', 'hackathons-competitions', 'Discuss upcoming hackathons, coding competitions, and team formation', 1),
  ('Internships & Jobs', 'internships-jobs', 'Share and discuss internship opportunities, job openings, and career advice', 2),
  ('Course Help', 'course-help', 'Get help with coursework, study groups, and academic resources', 3),
  ('Research Projects', 'research-projects', 'Collaborate on research projects and share findings', 4),
  ('General', 'general', 'General discussions, introductions, and community topics', 5);
