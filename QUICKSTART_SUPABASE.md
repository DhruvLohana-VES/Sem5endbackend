# 🚀 Quick Start Guide - Supabase Backend

## ✅ Migration Status: COMPLETE

All 9 controller files are now using Supabase PostgreSQL!

---

## Step 1: Deploy Database Schema

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project: `yckneogtcskchgfifuhz`
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy all contents from `database/schema.sql`
6. Paste into the SQL editor
7. Click **Run** to execute

**Expected Result**: 7 tables created (users, medications, doses, notifications, links, donation_requests, donations)

---

## Step 2: Install Dependencies

```powershell
cd "c:\Users\Dhruv Lohana\Desktop\Naya Project\CC Backend"
npm install
```

**This will install**:
- @supabase/supabase-js@2.39.0 (NEW)
- express, cors, helmet, morgan
- jsonwebtoken, bcryptjs
- express-validator
- uuid (NEW)

---

## Step 3: Verify Environment Variables

Check that `.env` file contains:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Supabase Configuration
SUPABASE_URL=https://yckneogtcskchgfifuhz.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here
```

---

## Step 4: Start the Server

```powershell
npm run dev
```

**Expected Output**:
```
Server running on port 5000
✅ Supabase connected successfully
```

---

## Step 5: Test the API

### Register a Test User (Patient)
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Test1234!",
  "role": "patient",
  "phone": "1234567890"
}
```

### Register a Caretaker
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "Test1234!",
  "role": "caretaker",
  "phone": "0987654321"
}
```

### Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Test1234!"
}
```

**Save the JWT token from the response!**

### Get Current User (Protected Route)
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

## Verify in Supabase Dashboard

1. Go to **Table Editor** in Supabase
2. Click on `users` table
3. You should see the registered users

---

## Available Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Patients (Protected)
- `GET /api/patients` - Get all linked patients (caretaker)
- `GET /api/patients/:id` - Get patient by ID

### Medications (Protected)
- `POST /api/medications` - Create medication (caretaker)
- `GET /api/medications` - Get my medications (patient)
- `GET /api/medications/patient/:patientId` - Get patient's medications
- `PATCH /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication

### Doses (Protected - Patient)
- `GET /api/doses/today` - Get today's doses
- `GET /api/doses/history` - Get dose history
- `PATCH /api/doses/:id/take` - Mark dose as taken
- `PATCH /api/doses/:id/miss` - Mark dose as missed

### Notifications (Protected)
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Links (Protected)
- `POST /api/links/invite` - Send invitation (caretaker)
- `GET /api/links/pending` - Get pending invitations (patient)
- `POST /api/links/:id/accept` - Accept invitation (patient)
- `DELETE /api/links/:patientId` - Unlink patient (caretaker)

### Reports (Protected)
- `GET /api/reports/adherence/:patientId` - Get adherence report

### Donor (Protected - Donor role)
- `GET /api/donor/profile` - Get donor profile
- `PATCH /api/donor/profile` - Update donor profile
- `PATCH /api/donor/availability/toggle` - Toggle availability
- `GET /api/donor/stats` - Get donor stats
- `GET /api/donor/requests/active` - Get active donation requests
- `POST /api/donor/requests/:requestId/accept` - Accept request
- `GET /api/donor/donations` - Get all donations
- `GET /api/donor/donations/recent` - Get recent donations (last 3)

---

## Testing Tools

### Option 1: VS Code REST Client
Install the "REST Client" extension and use the `.http` files in the `tests/` folder (if created)

### Option 2: Postman
Import the API collection (if available) or manually create requests

### Option 3: cURL (PowerShell)
```powershell
# Register
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"Test User","email":"test@example.com","password":"Test1234!","role":"patient","phone":"1234567890"}'
```

---

## Troubleshooting

### Error: "Cannot find module '@supabase/supabase-js'"
**Solution**: Run `npm install`

### Error: "Supabase connection failed"
**Solution**: 
1. Check `.env` file has correct Supabase credentials
2. Verify SUPABASE_URL and SUPABASE_SERVICE_KEY are correct

### Error: "relation 'users' does not exist"
**Solution**: Run the SQL schema from `database/schema.sql` in Supabase SQL Editor

### Error: "Invalid JWT token"
**Solution**: 
1. Make sure you're sending `Authorization: Bearer YOUR_TOKEN` header
2. Token expires after 30 days - login again to get new token

---

## Next Steps

1. ✅ Deploy schema to Supabase
2. ✅ Install dependencies  
3. ✅ Start server
4. ✅ Test authentication endpoints
5. ⏳ Test all other endpoints
6. ⏳ Update frontend to use new Supabase backend
7. ⏳ Deploy to production

---

**Need Help?**
- Check `MIGRATION_COMPLETE.md` for migration details
- Review `API_REFERENCE.md` for complete API documentation
- Check server console logs for detailed errors
