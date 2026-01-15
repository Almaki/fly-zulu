-- Admin Messages table for user-admin communication
CREATE TYPE message_type AS ENUM ('solicitud', 'bug', 'felicitacion', 'otro');

CREATE TABLE admin_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  content TEXT NOT NULL,
  type message_type DEFAULT 'otro',
  is_from_admin BOOLEAN DEFAULT FALSE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_messages_user ON admin_messages(user_id);
CREATE INDEX idx_admin_messages_read ON admin_messages(read) WHERE read = FALSE;
CREATE INDEX idx_admin_messages_created ON admin_messages(created_at DESC);

-- Enable RLS
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

-- Users can view and create their own messages
CREATE POLICY "Users can view own messages" ON admin_messages
  FOR SELECT USING (user_id = auth.uid() OR is_superadmin(auth.uid()));

CREATE POLICY "Users can insert own messages" ON admin_messages
  FOR INSERT WITH CHECK (user_id = auth.uid() AND is_from_admin = FALSE);

-- Only admin can send admin messages
CREATE POLICY "Admin can insert admin messages" ON admin_messages
  FOR INSERT WITH CHECK (is_superadmin(auth.uid()) AND is_from_admin = TRUE);

-- Admin can update message read status
CREATE POLICY "Admin can update messages" ON admin_messages
  FOR UPDATE USING (is_superadmin(auth.uid()));
