-- 017_support_tickets.sql
-- Support ticket system for user-admin communication

-- Enum for ticket categories
CREATE TYPE ticket_category AS ENUM ('BUG', 'SUGGESTION', 'OTHER');

-- Enum for ticket status
CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  categories ticket_category[] NOT NULL DEFAULT '{}',
  subject VARCHAR(200),
  status ticket_status NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Ticket messages table (chat-style)
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_admin_message BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'ticket_reply', 'system', 'announcement'
  title VARCHAR(200) NOT NULL,
  message TEXT,
  reference_id UUID, -- ticket_id or other reference
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add notification settings to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS notifications_muted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_notification_check TIMESTAMPTZ;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON user_notifications(user_id, read_at) WHERE read_at IS NULL;

-- Function to create notification when admin replies
CREATE OR REPLACE FUNCTION notify_ticket_reply()
RETURNS TRIGGER AS $$
DECLARE
  v_ticket_user_id UUID;
BEGIN
  -- Only create notification for admin messages
  IF NEW.is_admin_message = TRUE THEN
    -- Get the ticket owner
    SELECT user_id INTO v_ticket_user_id
    FROM support_tickets
    WHERE id = NEW.ticket_id;

    -- Create notification for the user
    INSERT INTO user_notifications (user_id, type, title, message, reference_id)
    VALUES (
      v_ticket_user_id,
      'ticket_reply',
      'Respuesta del Soporte',
      LEFT(NEW.content, 100),
      NEW.ticket_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for admin replies
DROP TRIGGER IF EXISTS trigger_notify_ticket_reply ON ticket_messages;
CREATE TRIGGER trigger_notify_ticket_reply
  AFTER INSERT ON ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_reply();

-- Function to update ticket timestamp
CREATE OR REPLACE FUNCTION update_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE support_tickets
  SET updated_at = NOW()
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ticket timestamp
DROP TRIGGER IF EXISTS trigger_update_ticket_timestamp ON ticket_messages;
CREATE TRIGGER trigger_update_ticket_timestamp
  AFTER INSERT ON ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_timestamp();

-- RLS Policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can see their own tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create tickets
CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can see all tickets
CREATE POLICY "Admins can view all tickets"
  ON support_tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SUPERADMIN'
    )
  );

-- Admins can update tickets
CREATE POLICY "Admins can update tickets"
  ON support_tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SUPERADMIN'
    )
  );

-- Users can see messages from their tickets
CREATE POLICY "Users can view own ticket messages"
  ON ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE id = ticket_messages.ticket_id
      AND user_id = auth.uid()
    )
  );

-- Users can send messages to their tickets
CREATE POLICY "Users can send messages to own tickets"
  ON ticket_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE id = ticket_messages.ticket_id
      AND user_id = auth.uid()
    )
  );

-- Admins can see all messages
CREATE POLICY "Admins can view all messages"
  ON ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SUPERADMIN'
    )
  );

-- Admins can send messages
CREATE POLICY "Admins can send messages"
  ON ticket_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SUPERADMIN'
    )
  );

-- Users can see their own notifications
CREATE POLICY "Users can view own notifications"
  ON user_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON user_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can create notifications
CREATE POLICY "System can create notifications"
  ON user_notifications FOR INSERT
  WITH CHECK (TRUE);

COMMENT ON TABLE support_tickets IS 'Support tickets for user-admin communication';
COMMENT ON TABLE ticket_messages IS 'Chat messages within support tickets';
COMMENT ON TABLE user_notifications IS 'User notification center';
