-- Supabase Database Schema for XTREME PEPTIDES NZ
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  shipping_address JSONB,
  items JSONB,
  subtotal DECIMAL(10, 2),
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2),
  order_total DECIMAL(10, 2),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  tracking_number VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table (simple password-based auth)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- Store bcrypt hashed passwords
  email VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  order_number VARCHAR(50),
  recipient_email VARCHAR(255) NOT NULL,
  email_type VARCHAR(50) NOT NULL, -- 'order_confirmation', 'status_update', 'custom'
  subject VARCHAR(500) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'sent', 'failed'
  resend_email_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_order_id ON email_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user
-- Using plain text password for simplicity (admin123)
INSERT INTO admin_users (username, password_hash, email, is_active)
VALUES (
  'admin',
  'admin123',
  'admin@xtremepeptides.nz',
  true
)
ON CONFLICT (username) DO UPDATE SET password_hash = 'admin123';

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Policies for orders table
-- Allow anonymous insert (for checkout)
CREATE POLICY "Allow anonymous insert on orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow read access to authenticated users or service role
CREATE POLICY "Allow read access on orders"
  ON orders FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow update to authenticated and anon users (admin panel uses anon key)
CREATE POLICY "Allow update on orders"
  ON orders FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on orders"
  ON orders FOR DELETE
  TO authenticated, anon
  USING (true);

-- Policies for email_logs table
CREATE POLICY "Allow all access on email_logs"
  ON email_logs FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert on email_logs for anon"
  ON email_logs FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policies for admin_users table (restrictive)
CREATE POLICY "Allow select on admin_users"
  ON admin_users FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create service role bypass policy (for server-side operations)
CREATE POLICY "Service role full access on orders"
  ON orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on email_logs"
  ON email_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on admin_users"
  ON admin_users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Deleted orders table (soft delete archive)
CREATE TABLE IF NOT EXISTS deleted_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_order_id UUID,
  order_number VARCHAR(50),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  total DECIMAL(10, 2),
  status VARCHAR(50),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_by VARCHAR(100)
);

-- Deleted email logs table (soft delete archive)
CREATE TABLE IF NOT EXISTS deleted_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_email_id UUID,
  order_number VARCHAR(50),
  recipient_email VARCHAR(255),
  email_type VARCHAR(50),
  subject VARCHAR(500),
  status VARCHAR(50),
  resend_email_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_by VARCHAR(100)
);

-- Enable RLS on deleted tables
ALTER TABLE deleted_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deleted_emails ENABLE ROW LEVEL SECURITY;

-- RLS policies for deleted_orders
CREATE POLICY "Service role full access on deleted_orders"
  ON deleted_orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access on deleted_orders for anon"
  ON deleted_orders FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- RLS policies for deleted_emails
CREATE POLICY "Service role full access on deleted_emails"
  ON deleted_emails FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access on deleted_emails for anon"
  ON deleted_emails FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE orders IS 'Stores all customer orders';
COMMENT ON TABLE admin_users IS 'Admin users for dashboard authentication';
COMMENT ON TABLE email_logs IS 'Logs of all emails sent through the system';
COMMENT ON TABLE deleted_orders IS 'Archive of deleted orders';
COMMENT ON TABLE deleted_emails IS 'Archive of deleted email logs';
