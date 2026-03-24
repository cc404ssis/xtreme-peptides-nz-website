# XTREME PEPTIDES NZ - Supabase Setup Guide

## Environment Variables Required in Vercel

Add these environment variables in your Vercel project settings:

### Email Configuration (Resend)
- `RESEND_API_KEY` - Your Resend API key (get from https://resend.com)

### Supabase Configuration
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (server-side only)

## Supabase Setup Steps

### 1. Create a Supabase Project
1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Name it "xtreme-peptides-nz"
4. Choose a region close to your users (Sydney for NZ/AU)
5. Wait for the project to be created

### 2. Get Your Credentials
1. Go to Project Settings > API
2. Copy the following:
   - **Project URL**: `https://[your-project].supabase.co`
   - **anon public**: For client-side code
   - **service_role secret**: For server-side API routes (keep this secret!)

### 3. Run the Database Schema
1. Go to the SQL Editor in your Supabase dashboard
2. Open `supabase/schema.sql` from this repo
3. Copy and paste the contents into the SQL Editor
4. Click "Run"

This creates:
- `orders` table - Stores all customer orders
- `admin_users` table - For admin authentication
- `email_logs` table - Tracks all sent emails

### 4. Set Up Admin User
1. In Supabase, go to Table Editor > admin_users
2. Insert a new row:
   - username: `admin`
   - password_hash: Use bcrypt to hash your password (or use plain text for testing)
   - email: your admin email
   - is_active: true

To generate a bcrypt hash, you can use:
```bash
node -e "console.log(require('bcryptjs').hashSync('yourpassword', 10))"
```

## Vercel Deployment

### 1. Add Environment Variables
In your Vercel project:
1. Go to Settings > Environment Variables
2. Add each variable from the list above
3. Redeploy the project

### 2. Verify API Endpoints
After deployment, test the endpoints:

**Send Order Confirmation Email:**
```bash
curl -X POST https://your-domain.com/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "orderData": {
      "orderNumber": "ORD-001",
      "customerEmail": "customer@example.com",
      "customerName": "John Doe",
      "items": [
        {"name": "BPC-157 5mg", "quantity": 1, "price": 89.99}
      ],
      "subtotal": 89.99,
      "shippingCost": 10.00,
      "total": 99.99,
      "shippingAddress": {
        "name": "John Doe",
        "address": "123 Main St",
        "city": "Auckland",
        "postcode": "1010"
      },
      "paymentMethod": "credit_card"
    }
  }'
```

**Send Status Update Email:**
```bash
curl -X POST https://your-domain.com/api/send-status-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "orderNumber": "ORD-001",
    "status": "shipped",
    "trackingNumber": "NZ123456789",
    "message": "Your order has been shipped!"
  }'
```

## Admin Dashboard

Access the admin dashboard at: `https://your-domain.com/admin/`

Default credentials (change immediately):
- Username: `admin`
- Password: `admin123`

## Database Schema Overview

### orders
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_number | VARCHAR | Unique order number |
| customer_email | VARCHAR | Customer email |
| customer_name | VARCHAR | Customer name |
| shipping_address | JSONB | Shipping address object |
| items | JSONB | Array of order items |
| subtotal | DECIMAL | Order subtotal |
| shipping_cost | DECIMAL | Shipping cost |
| total | DECIMAL | Total amount |
| status | VARCHAR | Order status |
| tracking_number | VARCHAR | Shipping tracking number |
| created_at | TIMESTAMP | Order creation time |
| updated_at | TIMESTAMP | Last update time |

### admin_users
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| username | VARCHAR | Admin username |
| password_hash | VARCHAR | Bcrypt hashed password |
| email | VARCHAR | Admin email |
| is_active | BOOLEAN | Account status |

### email_logs
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | Reference to order |
| recipient_email | VARCHAR | Email recipient |
| email_type | VARCHAR | Type of email sent |
| subject | VARCHAR | Email subject |
| status | VARCHAR | sent/failed |
| sent_at | TIMESTAMP | When email was sent |

## Security Notes

1. **Never commit credentials** - Always use environment variables
2. **service_role key** - Only use server-side in API routes
3. **anon key** - Safe for client-side code
4. **RLS policies** - The schema includes Row Level Security policies
5. **Change default password** - Update the admin password immediately after setup

## Troubleshooting

### Emails not sending
- Check `RESEND_API_KEY` is set correctly
- Verify `support@xtremepeptides.nz` is verified in Resend
- Check Vercel function logs for errors

### Supabase connection issues
- Verify all Supabase environment variables
- Check RLS policies allow the required operations
- Ensure the schema was run successfully

### Admin dashboard not loading
- Check browser console for JavaScript errors
- Verify Supabase URL and anon key are correct in admin.js
- Check network tab for failed requests
