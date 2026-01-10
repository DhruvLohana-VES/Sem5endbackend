# Admin API Testing Guide

## 🚀 Quick Start

### Step 1: Create Admin User
```bash
cd "C:\Users\Dhruv Lohana\Desktop\Naya Project\CC Backend"
node scripts/seed-admin.js
```

**Default Admin Credentials:**
- Email: `admin@gmail.com`
- Password: `Test@123`

---

## 🔐 Step 2: Get Admin JWT Token

### Using PowerShell (curl):
```powershell
curl -X POST https://med-backend-gq6h.onrender.com/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@gmail.com","password":"Test@123"}'
```

### Using Postman:
**POST** `https://med-backend-gq6h.onrender.com/api/auth/login`

**Body (JSON):**
```json
{
  "email": "admin@gmail.com",
  "password": "Test@123"
}
```

**Response:**
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

**⚠️ Copy the `token` value - you'll need it for all admin requests!**

---

## 📊 Step 3: Test Admin Endpoints

Replace `YOUR_TOKEN_HERE` with the token from Step 2.

### 1. Get All Users (with pagination)
```powershell
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  "https://med-backend-gq6h.onrender.com/api/admin/users?page=1&limit=10"
```

**Postman:**
- **GET** `https://med-backend-gq6h.onrender.com/api/admin/users?page=1&limit=10`
- **Headers:** `Authorization: Bearer YOUR_TOKEN_HERE`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "John Doe",
      "email": "patient@demo.com",
      "role": "patient",
      "status": "active",
      "created_at": "2026-01-08T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 2. Filter Users by Role
```powershell
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  "https://med-backend-gq6h.onrender.com/api/admin/users?role=patient"
```

### 3. Get System Analytics
```powershell
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  "https://med-backend-gq6h.onrender.com/api/admin/analytics"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 25,
      "byRole": {
        "patient": 15,
        "caretaker": 8,
        "donor": 1,
        "admin": 1
      }
    },
    "medications": 42,
    "donations": 8,
    "doses": 156,
    "caretakerPatientLinks": 12
  }
}
```

### 4. Update User Status (Enable/Disable)
```powershell
curl -X PATCH `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{"status":"inactive"}' `
  "https://med-backend-gq6h.onrender.com/api/admin/users/USER_ID_HERE/status"
```

**Valid status values:** `active`, `inactive`, `suspended`

**Response:**
```json
{
  "success": true,
  "message": "User status updated to inactive",
  "data": {
    "id": "...",
    "name": "John Doe",
    "status": "inactive"
  }
}
```

### 5. Get All Caretaker-Patient Links
```powershell
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  "https://med-backend-gq6h.onrender.com/api/admin/links"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "caretaker": {
        "id": "...",
        "name": "Dr. Smith",
        "email": "caretaker@demo.com"
      },
      "patient": {
        "id": "...",
        "name": "John Doe",
        "email": "patient@demo.com"
      },
      "status": "accepted",
      "created_at": "2026-01-05T..."
    }
  ]
}
```

### 6. Get Recent Activity
```powershell
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  "https://med-backend-gq6h.onrender.com/api/admin/activity"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "user_created",
      "timestamp": "2026-01-08T10:30:00.000Z",
      "data": {
        "name": "New User",
        "email": "newuser@example.com",
        "role": "patient"
      }
    },
    {
      "type": "medication_created",
      "timestamp": "2026-01-08T09:15:00.000Z",
      "data": {
        "medication": "Aspirin",
        "patient": "John Doe"
      }
    }
  ]
}
```

---

## 🛡️ Testing Access Control

### Test with Non-Admin User (Should Fail)

1. Login as a regular user:
```powershell
curl -X POST https://med-backend-gq6h.onrender.com/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"patient@demo.com","password":"Demo@123"}'
```

2. Try to access admin endpoint:
```powershell
curl -H "Authorization: Bearer PATIENT_TOKEN_HERE" `
  "https://med-backend-gq6h.onrender.com/api/admin/users"
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Access denied"
}
```

---

## 📱 Using Postman Collection

### Import this Collection:

1. Open Postman
2. Click **Import**
3. Paste this JSON:

```json
{
  "info": {
    "name": "MediCare Admin API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Login as Admin",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"admin@gmail.com\",\"password\":\"Test@123\"}"
        },
        "url": "https://med-backend-gq6h.onrender.com/api/auth/login"
      }
    },
    {
      "name": "2. Get All Users",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
        "url": {
          "raw": "https://med-backend-gq6h.onrender.com/api/admin/users?page=1&limit=10",
          "query": [
            {"key": "page", "value": "1"},
            {"key": "limit", "value": "10"}
          ]
        }
      }
    },
    {
      "name": "3. Get Analytics",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
        "url": "https://med-backend-gq6h.onrender.com/api/admin/analytics"
      }
    },
    {
      "name": "4. Update User Status",
      "request": {
        "method": "PATCH",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"},
          {"key": "Content-Type", "value": "application/json"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"status\":\"inactive\"}"
        },
        "url": "https://med-backend-gq6h.onrender.com/api/admin/users/:userId/status"
      }
    },
    {
      "name": "5. Get Links",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
        "url": "https://med-backend-gq6h.onrender.com/api/admin/links"
      }
    },
    {
      "name": "6. Get Recent Activity",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
        "url": "https://med-backend-gq6h.onrender.com/api/admin/activity"
      }
    }
  ]
}
```

4. After logging in (request #1), copy the token from response
5. Set it as a variable `{{token}}` in Postman environment

---

## ✅ Quick Verification Checklist

- [ ] Admin user created successfully
- [ ] Can login as admin and get JWT token
- [ ] Can access `/api/admin/users` with admin token
- [ ] Cannot access admin routes with patient/caretaker token (403 error)
- [ ] Can view system analytics
- [ ] Can update user status
- [ ] Can view all links
- [ ] Can view recent activity

---

## 🔍 Troubleshooting

### Error: "Not authorized, no token"
- Make sure you include the `Authorization` header
- Format: `Authorization: Bearer YOUR_TOKEN_HERE`

### Error: "Access denied"
- Verify you're using the admin token, not a patient/caretaker token
- Check if user role is "admin" in the token payload

### Error: "User not found"
- Run the seed script again: `node scripts/seed-admin.js`

### Connection Issues
- Make sure backend is running
- Check if Render deployment is awake (first request may be slow)

---

## 📝 Notes

- Token expires based on JWT_SECRET configuration
- Admin cannot disable their own account (safety feature)
- All admin routes require both authentication AND admin role
- Pagination defaults: page=1, limit=10
