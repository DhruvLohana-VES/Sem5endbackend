# 🎯 Supabase Setup - Complete Instructions

## Step 1: Create Database Schema

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/yckneogtcskchgfifuhz
2. Click **SQL Editor** (left sidebar)
3. Click **New query**
4. Copy and paste the entire contents of `database/schema.sql`
5. Click **Run** (or press F5)
6. Verify: Go to **Table Editor** and confirm you see these tables:
   - users
   - medications
   - doses
   - notifications
   - links
   - donation_requests
   - donations

## Step 2: Install Node Packages

```bash
cd "c:\Users\Dhruv Lohana\Desktop\Naya Project\CC Backend"
npm install
```

## Step 3: Verify Environment

Your `.env` file is already configured with:
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_KEY
- ✅ JWT_SECRET

## Step 4: Start the Server

```bash
npm run dev
```

You should see:
```
✅ Supabase Connected Successfully
🚀 Server running on port 5001
```

## Step 5: Test the API

### Register a new user:
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"test123\",\"role\":\"patient\"}"
```

### Login:
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\"}"
```

## Current Status

### ✅ Completed
- [x] Supabase configuration
- [x] Database schema
- [x] Server.js updated
- [x] auth.controller.js migrated
- [x] auth.middleware.js migrated
- [x] patient.controller.js migrated
- [x] Package.json updated

### ⏳ Pending Updates
- [ ] medication.controller.js
- [ ] dose.controller.js
- [ ] notification.controller.js
- [ ] report.controller.js
- [ ] link.controller.js
- [ ] donor.controller.js
- [ ] scripts/seed.js

## Next: Update Remaining Controllers

I can provide the complete, ready-to-use code for all remaining controllers.Would you like me to:

**Option A**: Create complete new files for each controller
**Option B**: Create one master file with all controller code to copy/paste
**Option C**: Auto-replace all controllers at once

Reply with A, B, or C and I'll complete the migration!

## Troubleshooting

### "relation does not exist"
→ Run `database/schema.sql` in Supabase SQL Editor

### "Missing Supabase environment variables"
→ Verify `.env` has SUPABASE_URL and SUPABASE_SERVICE_KEY

### Cannot connect to Supabase
→ Check your internet connection
→ Verify Supabase project is active

## Database Differences

| MongoDB | Supabase (PostgreSQL) |
|---------|----------------------|
| `_id` | `id` (UUID) |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |
| `bloodGroup` | `blood_group` |
| `isActive` | `is_active` |
| camelCase | snake_case |

All API responses still use camelCase for frontend compatibility!
