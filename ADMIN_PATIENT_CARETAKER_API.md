# Admin Patient & Caretaker Management API Documentation

## Overview
Complete admin API endpoints for managing patients, caretakers, and their relationships in the MediCare platform.

**Base URL:** `/api/admin`  
**Authentication:** All endpoints require admin role  
**Headers Required:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

---

## 🏥 PATIENT MANAGEMENT

### 1. Get All Patients
Get paginated list of all patients with caretaker counts.

**Endpoint:** `GET /api/admin/patients`

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `search` (optional) - Search by name or email

**Example Request:**
```bash
GET /api/admin/patients?page=1&limit=10&search=john
Authorization: Bearer <token>
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "age": 45,
      "gender": "male",
      "blood_group": "O+",
      "city": "Mumbai",
      "status": "active",
      "created_at": "2026-01-10T...",
      "updated_at": "2026-01-10T...",
      "caretakerCount": 2
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

---

### 2. Get Patient by ID
Get complete patient profile with stats and assigned caretakers.

**Endpoint:** `GET /api/admin/patients/:id`

**Example Request:**
```bash
GET /api/admin/patients/abc-123-def
Authorization: Bearer <token>
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc-123-def",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "age": 45,
    "gender": "male",
    "blood_group": "O+",
    "city": "Mumbai",
    "status": "active",
    "caretakers": [
      {
        "id": "link-id-1",
        "status": "active",
        "created_at": "2026-01-10T...",
        "caretaker": {
          "id": "caretaker-id",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "phone": "9876543210"
        }
      }
    ],
    "stats": {
      "medications": 5,
      "totalDoses": 150,
      "activeCaretakers": 2
    }
  }
}
```

---

### 3. Update Patient
Update patient basic details (name, phone, age, gender, blood_group, city).

**Endpoint:** `PATCH /api/admin/patients/:id`

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "1111111111",
  "age": 46,
  "city": "Delhi"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Patient updated successfully",
  "data": {
    "id": "abc-123-def",
    "name": "John Updated",
    "email": "john@example.com",
    ...
  }
}
```

---

### 4. Get Patient Medications
Get all medications assigned to a patient.

**Endpoint:** `GET /api/admin/patients/:id/medications`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "abc-123-def",
      "name": "John Doe"
    },
    "medications": [
      {
        "id": "med-1",
        "name": "Aspirin",
        "dosage": "100mg",
        "frequency": "daily",
        "timing": ["morning", "night"],
        "created_at": "2026-01-10T..."
      }
    ]
  }
}
```

---

### 5. Get Patient Adherence Statistics
Get medication adherence statistics for a patient over a time period.

**Endpoint:** `GET /api/admin/patients/:id/adherence`

**Query Parameters:**
- `days` (optional) - Number of days to analyze (default: 30)

**Example Request:**
```bash
GET /api/admin/patients/abc-123-def/adherence?days=30
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "abc-123-def",
      "name": "John Doe"
    },
    "period": {
      "days": 30,
      "startDate": "2025-12-11T...",
      "endDate": "2026-01-10T..."
    },
    "statistics": {
      "totalDoses": 120,
      "takenDoses": 108,
      "missedDoses": 10,
      "pendingDoses": 2,
      "adherenceRate": 90.00
    },
    "recentDoses": [...]
  }
}
```

---

## 👥 CARETAKER MANAGEMENT

### 6. Get All Caretakers
Get paginated list of all caretakers with patient counts.

**Endpoint:** `GET /api/admin/caretakers`

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `search` (optional) - Search by name or email

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "caretaker-id",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "9876543210",
      "age": 35,
      "gender": "female",
      "city": "Delhi",
      "status": "active",
      "patientCount": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

---

### 7. Get Caretaker by ID
Get caretaker details with all assigned patients.

**Endpoint:** `GET /api/admin/caretakers/:id`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "caretaker-id",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "9876543210",
    "patients": [
      {
        "id": "link-id-1",
        "status": "active",
        "created_at": "2026-01-10T...",
        "patient": {
          "id": "patient-id",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "1234567890",
          "age": 45,
          "gender": "male"
        }
      }
    ],
    "stats": {
      "totalPatients": 3,
      "activePatients": 3
    }
  }
}
```

---

## 🔗 LINK MANAGEMENT (Patient-Caretaker)

### 8. Assign Patient to Caretaker
Create a new link between a caretaker and patient.

**Endpoint:** `POST /api/admin/links`

**Request Body:**
```json
{
  "caretaker_id": "caretaker-uuid",
  "patient_id": "patient-uuid"
}
```

**Example Response (New Link):**
```json
{
  "success": true,
  "message": "Patient assigned to caretaker successfully",
  "data": {
    "id": "link-id",
    "caretaker_id": "caretaker-uuid",
    "patient_id": "patient-uuid",
    "status": "active",
    "created_at": "2026-01-15T..."
  }
}
```

**Example Response (Reactivated Link):**
```json
{
  "success": true,
  "message": "Existing link reactivated",
  "data": {
    "id": "link-id",
    "status": "active",
    ...
  }
}
```

**Error Responses:**
- `404` - Caretaker or patient not found
- `400` - User is not a caretaker/patient
- `400` - Link already exists (and is active)

---

### 9. Remove Patient-Caretaker Link
Soft delete a link (sets status to inactive).

**Endpoint:** `DELETE /api/admin/links/:linkId`

**Example Response:**
```json
{
  "success": true,
  "message": "Patient-caretaker link removed successfully",
  "data": {
    "id": "link-id",
    "status": "inactive",
    "updated_at": "2026-01-15T..."
  }
}
```

---

## 📊 Common Response Patterns

### Success Response
```json
{
  "success": true,
  "message": "Optional success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad request (validation failed)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (not admin role)
- `404` - Not found
- `500` - Server error

---

## 🔐 Authentication Flow

1. **Login as Admin:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@gmail.com",
  "password": "Test@123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "System Administrator",
    "email": "admin@gmail.com",
    "role": "admin"
  }
}
```

2. **Use Token in Subsequent Requests:**
```bash
GET /api/admin/patients
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Postman Collection Examples

### Get All Patients
```
GET http://localhost:5001/api/admin/patients?page=1&limit=10
Headers:
  Authorization: Bearer <token>
```

### Assign Patient to Caretaker
```
POST http://localhost:5001/api/admin/links
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
Body (raw JSON):
{
  "caretaker_id": "{{caretaker_id}}",
  "patient_id": "{{patient_id}}"
}
```

### Get Patient Adherence
```
GET http://localhost:5001/api/admin/patients/{{patient_id}}/adherence?days=7
Headers:
  Authorization: Bearer <token>
```

---

## 🚀 Testing Workflow

1. **Login as admin** and get token
2. **Get all patients** to see patient list
3. **Get patient details** by ID to see full profile
4. **Get all caretakers** to see caretaker list
5. **Assign patient to caretaker** using their IDs
6. **Verify the link** by getting patient/caretaker details again
7. **View adherence stats** for specific patients
8. **Update patient info** as needed
9. **Remove links** when needed

---

## ⚠️ Important Notes

- All patient-caretaker links are **soft deleted** (status set to 'inactive')
- Reactivating an existing inactive link will update it instead of creating new
- Search is case-insensitive and searches both name and email fields
- Pagination defaults to page=1, limit=10 if not specified
- Admin users cannot disable their own accounts
- All timestamps are in ISO 8601 format (UTC)

---

## 🔄 Migration from Current System

If you already have:
- `/api/admin/users` - Still works (all users, any role)
- `/api/admin/analytics` - Still works (system-wide stats)
- `/api/admin/links` - Now has POST and DELETE methods

New endpoints added:
- `/api/admin/patients` - Patient-specific list
- `/api/admin/patients/:id` - Full patient profile
- `/api/admin/patients/:id/medications` - Patient meds
- `/api/admin/patients/:id/adherence` - Adherence stats
- `/api/admin/caretakers` - Caretaker-specific list
- `/api/admin/caretakers/:id` - Full caretaker profile
- `PATCH /api/admin/patients/:id` - Update patient
- `POST /api/admin/links` - Create link
- `DELETE /api/admin/links/:linkId` - Remove link

All backward compatible! 🎉
