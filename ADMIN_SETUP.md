# 🔐 Admin Role Setup - Complete Guide

## ⚠️ IMPORTANT: Database Schema Update Required

The Supabase database currently only allows roles: `patient`, `caretaker`, `donor`

We need to add `admin` to the allowed roles.

---

## Step 1: Update Supabase Database Schema

### Option A: Using Supabase Dashboard (Recommended)

1. Go to https://eprhxuegfxkkkjlrjwsz.supabase.co
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Paste this SQL:

```sql
-- Drop existing role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint with 'admin' role
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('patient', 'caretaker', 'donor', 'admin'));
```

5. Click **Run** (or press Ctrl+Enter)
6. Verify success message appears

### Option B: Using Migration Script

The SQL file is already created at: `scripts/add-admin-role.sql`

Copy and paste it into Supabase SQL Editor.

---

## Step 2: Create Admin User

After updating the database schema, run:

```powershell
cd "C:\Users\Dhruv Lohana\Desktop\Naya Project\CC Backend"
node scripts/seed-admin.js
```

**Expected Output:**
```
🔧 Creating default admin user...

✅ Admin user created successfully!
📧 Email: admin@gmail.com
👤 Role: admin

🔐 Admin Credentials:
Email: admin@gmail.com
Password: Test@123

📝 Note: Please change this password after first login!
```

---

## Step 3: Test Admin Login

```powershell
curl -X POST https://med-backend-gq6h.onrender.com/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"admin@gmail.com\",\"password\":\"Test@123\"}'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "System Administrator",
    "email": "admin@gmail.com",
    "role": "admin"
  }
}
```

---

## Step 4: Test Admin Endpoints

Use the token from Step 3:

```powershell
# Get System Analytics
curl -H "Authorization: Bearer YOUR_TOKEN" https://med-backend-gq6h.onrender.com/api/admin/analytics

# Get All Users
curl -H "Authorization: Bearer YOUR_TOKEN" "https://med-backend-gq6h.onrender.com/api/admin/users?page=1&limit=10"
```

---

## 📁 Files Created

All admin infrastructure is complete:

### Backend Files
- ✅ `middleware/role.middleware.js` - Role authorization
- ✅ `routes/admin.routes.js` - 5 protected admin endpoints
- ✅ `controllers/admin.controller.js` - Business logic with Supabase queries
- ✅ `scripts/seed-admin.js` - Create default admin user
- ✅ `scripts/add-admin-role.sql` - Database schema update
- ✅ `server.js` - Admin routes registered at `/api/admin`

### Documentation
- ✅ `ADMIN_TESTING.md` - Full testing guide with Postman collection

---

## 🛡️ Security Features

- **Double Protection**: All admin routes use both `protect` + `authorizeRoles('admin')`
- **Role Check**: Middleware verifies `req.user.role === 'admin'`
- **Self-Protection**: Admins cannot disable their own account
- **Password Security**: Bcrypt hashing with salt rounds = 10
- **JWT Authentication**: Token-based auth with 7-day expiry

---

## 📊 Admin API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users (pagination, role filter) |
| PATCH | `/api/admin/users/:id/status` | Enable/disable user |
| GET | `/api/admin/analytics` | System statistics |
| GET | `/api/admin/links` | Caretaker-patient relationships |
| GET | `/api/admin/activity` | Recent platform activity |

---

## ❌ Troubleshooting

### Error: "new row violates check constraint users_role_check"
**Solution**: You need to run the SQL migration first (Step 1 above)

### Error: "Missing Supabase environment variables"
**Solution**: Ensure `.env` file has:
```
SUPABASE_URL=https://eprhxuegfxkkkjlrjwsz.supabase.co
SUPABASE_SERVICE_KEY=sb_secret_RMtG7qCvMY_Va-PRvelQVg_uICvtDko
```

### Error: "Admin user already exists"
**Solution**: This is normal! The admin is already created. Use existing credentials to login.

---

## 🎯 Quick Start Checklist

- [ ] Step 1: Run SQL migration in Supabase dashboard
- [ ] Step 2: Run `node scripts/seed-admin.js`
- [ ] Step 3: Test login with admin@gmail.com / Test@123
- [ ] Step 4: Test admin endpoints with token
- [ ] Step 5: Verify non-admin users get 403 errors

---

## 🔑 Default Admin Credentials

```
Email:    admin@gmail.com
Password: Test@123
Role:     admin
```

**⚠️ IMPORTANT**: Change this password after first login in production!

---

## 📖 Full Testing Guide

See [ADMIN_TESTING.md](./ADMIN_TESTING.md) for:
- Complete API documentation
- PowerShell/curl examples
- Postman collection (importable JSON)
- Access control testing
- Troubleshooting guide
