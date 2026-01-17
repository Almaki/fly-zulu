-- Pilot Forum: Internal social network for pilots
-- Posts can be anonymous (only visible to SUPERADMIN who posted)
-- Comments follow same anonymity rules

-- Forum posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum comments table
CREATE TABLE IF NOT EXISTS forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum likes table (for both posts and comments)
CREATE TABLE IF NOT EXISTS forum_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT like_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  CONSTRAINT unique_post_like UNIQUE (user_id, post_id),
  CONSTRAINT unique_comment_like UNIQUE (user_id, comment_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_author ON forum_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_user ON forum_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_post ON forum_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_comment ON forum_likes(comment_id);

-- Full text search index for posts
CREATE INDEX IF NOT EXISTS idx_forum_posts_search ON forum_posts USING gin(to_tsvector('spanish', content));

-- RLS Policies
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_likes ENABLE ROW LEVEL SECURITY;

-- Posts: Only PILOT category users can view and create
-- SUPERADMIN can see all including anonymous author info
CREATE POLICY "Pilots can view posts" ON forum_posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (categoria = 'FLIGHT' OR role = 'SUPERADMIN')
    )
  );

CREATE POLICY "Pilots and admins can create posts" ON forum_posts
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (categoria = 'FLIGHT' OR role = 'SUPERADMIN')
    )
  );

CREATE POLICY "Authors can update own posts" ON forum_posts
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and admins can delete posts" ON forum_posts
  FOR DELETE
  USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SUPERADMIN'
    )
  );

-- Comments: Same rules as posts
CREATE POLICY "Pilots can view comments" ON forum_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (categoria = 'FLIGHT' OR role = 'SUPERADMIN')
    )
  );

CREATE POLICY "Pilots and admins can create comments" ON forum_comments
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (categoria = 'FLIGHT' OR role = 'SUPERADMIN')
    )
  );

CREATE POLICY "Authors can update own comments" ON forum_comments
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and admins can delete comments" ON forum_comments
  FOR DELETE
  USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SUPERADMIN'
    )
  );

-- Likes: Pilots can like/unlike
CREATE POLICY "Pilots can view likes" ON forum_likes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (categoria = 'FLIGHT' OR role = 'SUPERADMIN')
    )
  );

CREATE POLICY "Pilots and admins can create likes" ON forum_likes
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (categoria = 'FLIGHT' OR role = 'SUPERADMIN')
    )
  );

CREATE POLICY "Users can delete own likes" ON forum_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update post likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update post comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for post likes (separate INSERT and DELETE to avoid NEW/OLD conflict)
DROP TRIGGER IF EXISTS trigger_insert_post_likes ON forum_likes;
CREATE TRIGGER trigger_insert_post_likes
  AFTER INSERT ON forum_likes
  FOR EACH ROW
  WHEN (NEW.post_id IS NOT NULL)
  EXECUTE FUNCTION update_post_likes_count();

DROP TRIGGER IF EXISTS trigger_delete_post_likes ON forum_likes;
CREATE TRIGGER trigger_delete_post_likes
  AFTER DELETE ON forum_likes
  FOR EACH ROW
  WHEN (OLD.post_id IS NOT NULL)
  EXECUTE FUNCTION update_post_likes_count();

-- Triggers for comment likes (separate INSERT and DELETE)
DROP TRIGGER IF EXISTS trigger_insert_comment_likes ON forum_likes;
CREATE TRIGGER trigger_insert_comment_likes
  AFTER INSERT ON forum_likes
  FOR EACH ROW
  WHEN (NEW.comment_id IS NOT NULL)
  EXECUTE FUNCTION update_comment_likes_count();

DROP TRIGGER IF EXISTS trigger_delete_comment_likes ON forum_likes;
CREATE TRIGGER trigger_delete_comment_likes
  AFTER DELETE ON forum_likes
  FOR EACH ROW
  WHEN (OLD.comment_id IS NOT NULL)
  EXECUTE FUNCTION update_comment_likes_count();

-- Trigger for comments count
DROP TRIGGER IF EXISTS trigger_update_comments_count ON forum_comments;
CREATE TRIGGER trigger_update_comments_count
  AFTER INSERT OR DELETE ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();
