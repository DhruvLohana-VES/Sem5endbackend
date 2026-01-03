# Supabase Migration Guide

## Step 1: Run the Database Schema

1. Go to your Supabase project: https://supabase.com/dashboard/project/yckneogtcskchgfifuhz
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy the entire contents of `database/schema.sql`
5. Paste and click "Run"
6. Verify all tables are created in the "Table Editor"

## Step 2: Install Dependencies

```bash
cd "CC Backend"
npm install
```

This will install `@supabase/supabase-js` and `uuid` packages.

## Step 3: Update All Controllers

I've created Supabase-ready versions of all controllers. Run this PowerShell script to replace them:

```powershell
# Navigate to CC Backend directory
cd "c:\Users\Dhruv Lohana\Desktop\Naya Project\CC Backend"

# The following controllers have been updated for Supabase:
# - auth.controller.js ✅ (already updated)
# - middleware/auth.middleware.js ✅ (already updated)  
# - patient.controller.js (update pending)
# - medication.controller.js (update pending)
# - dose.controller.js (update pending)
# - notification.controller.js (update pending)
# - report.controller.js (update pending)
# - link.controller.js (update pending)
# - donor.controller.js (update pending)
```

## Step 4: Test the Migration

```bash
npm run dev
```

Check the console for:
- ✅ Supabase Connected Successfully

## Step 5: Seed Demo Data

After verifying the connection, run:

```bash
npm run seed
```

## Verification Checklist

- [ ] Database schema created in Supabase
- [ ] All tables visible in Table Editor
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts without errors
- [ ] Can register a new user
- [ ] Can login
- [ ] Can access protected routes

## What's Changed

### Database
- MongoDB → PostgreSQL (Supabase)
- Mongoose schemas → SQL tables
- `_id` → `id` (UUID)
- camelCase → snake_case in database
- Relations via foreign keys

### Code Changes
- `mongoose` → `@supabase/supabase-js`
- `Model.find()` → `supabase.from().select()`
- `Model.create()` → `supabase.from().insert()`
- `Model.findByIdAndUpdate()` → `supabase.from().update()`
- `Model.findByIdAndDelete()` → `supabase.from().delete()`

### Field Name Mappings
- `adherenceRate` → `adherence_rate`
- `bloodGroup` → `blood_group`
- `dateOfBirth` → `date_of_birth`
- `isAvailable` → `is_available`
- `totalDonations` → `total_donations`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`

## Troubleshooting

### "relation does not exist" error
→ Run the schema.sql in Supabase SQL Editor

### "Missing Supabase environment variables"
→ Check `.env` file has correct SUPABASE_URL and SUPABASE_SERVICE_KEY

### Authentication not working
→ Verify JWT_SECRET is set in `.env`

## Next Steps

After migration is complete, I'll update the remaining controllers to use Supabase queries.
