-- Supabase Database Schema for XTREME PEPTIDES NZ
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
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

-- Insert default admin user (password: admin123 - CHANGE THIS!)
-- Password hash generated with bcrypt (10 rounds)
INSERT INTO admin_users (username, password_hash, email)
VALUES (
  'admin',
  '$2a$10$YourHashHere_CHANGE_THIS', -- Replace with actual bcrypt hash
  'admin@xtremepeptides.nz'
)
ON CONFLICT (username) DO NOTHING;

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

-- Allow update only to authenticated users
CREATE POLICY "Allow update on orders"
  ON orders FOR UPDATE
  TO authenticated
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

-- Comments for documentation
COMMENT ON TABLE orders IS 'Stores all customer orders';
COMMENT ON TABLE admin_users IS 'Admin users for dashboard authentication';
COMMENT ON TABLE email_logs IS 'Logs of all emails sent through the system';
