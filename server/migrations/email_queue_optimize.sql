-- Email Queue Optimization Migration
-- Creates PostgreSQL trigger for LISTEN/NOTIFY and covering index

-- Create trigger function to notify on email queue changes
CREATE OR REPLACE FUNCTION email_queue_notify()
RETURNS trigger AS $$
BEGIN
  -- Only notify on INSERT of pending emails or UPDATE to pending status
  IF (TG_OP = 'INSERT' AND NEW.status = 'pending') OR 
     (TG_OP = 'UPDATE' AND NEW.status = 'pending' AND OLD.status != 'pending') THEN
    
    PERFORM pg_notify('email_queue', json_build_object(
      'operation', TG_OP,
      'id', NEW.id,
      'priority', NEW.priority,
      'recipient_email', NEW.recipient_email
    )::text);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger on email_notification_queue table
DROP TRIGGER IF EXISTS email_queue_trigger ON email_notification_queue;
CREATE TRIGGER email_queue_trigger
  AFTER INSERT OR UPDATE ON email_notification_queue
  FOR EACH ROW EXECUTE FUNCTION email_queue_notify();

-- Create covering index for optimal email queue queries
-- This index covers the WHERE clause and ORDER BY, enabling Index Only Scans
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_queue_pending_covering
ON email_notification_queue (status, attempts, priority, created_at)
WHERE status = 'pending' AND attempts <= 3;

-- Create additional index for queue statistics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_queue_status_stats
ON email_notification_queue (status);

-- Analyze table to update query planner statistics
ANALYZE email_notification_queue;

-- Grant necessary permissions for LISTEN/NOTIFY
GRANT USAGE ON SCHEMA public TO public;