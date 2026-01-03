# CareCue Backend API Documentation

Complete REST API for the CareCue medication management and blood donation system. This API supports both web and mobile applications.

## 🚀 Quick Start

### Installation

```bash
cd "CC Backend"
npm install
```

### Environment Setup

Create a `.env` file:

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/carecue
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

## 📡 Base URL

```
Development: http://localhost:5001/api
Production: https://your-domain.com/api
```

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- `patient` - Patients managing their medications
- `caretaker` - Healthcare providers managing patient medications
- `donor` - Blood donors

---

## 📋 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient",
  "phone": "+91 98765 43210",
  "age": 35,
  "gender": "male"
}
```

**For Donor Registration:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "donor",
  "phone": "+91 98765 43210",
  "bloodGroup": "O+",
  "dateOfBirth": "1990-01-15",
  "city": "Mumbai",
  "address": "123 Main St"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    "phone": "+91 98765 43210"
  }
}
```

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "patient",
  "phone": "+91 98765 43210",
  "age": 35,
  "gender": "male"
}
```

---

### Patients

#### Get All Patients (Caretaker Only)
```http
GET /api/patients
Authorization: Bearer <caretaker-token>
```

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 98765 43210",
    "age": 35,
    "gender": "male",
    "status": "active",
    "adherenceRate": 85
  }
]
```

#### Get Patient By ID
```http
GET /api/patients/:id
Authorization: Bearer <token>
```

---

### Medications

#### Create Medication (Caretaker Only)
```http
POST /api/medications
Authorization: Bearer <caretaker-token>
```

**Request Body:**
```json
{
  "patientId": "507f1f77bcf86cd799439011",
  "name": "Aspirin",
  "dosage": "75mg",
  "frequency": "once daily",
  "timing": ["08:00"],
  "instructions": "Take after breakfast",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "patientId": "507f1f77bcf86cd799439011",
  "caretakerId": "507f1f77bcf86cd799439010",
  "name": "Aspirin",
  "dosage": "75mg",
  "frequency": "once daily",
  "timing": ["08:00"],
  "instructions": "Take after breakfast",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-12-31T00:00:00.000Z",
  "isActive": true,
  "createdAt": "2025-01-01T10:00:00.000Z"
}
```

#### Get All Medications (Current Patient)
```http
GET /api/medications
Authorization: Bearer <patient-token>
```

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Aspirin",
    "dosage": "75mg",
    "frequency": "once daily",
    "timing": ["08:00"],
    "instructions": "Take after breakfast",
    "isActive": true
  }
]
```

#### Get Medications By Patient ID
```http
GET /api/medications/patient/:patientId
Authorization: Bearer <token>
```

#### Update Medication (Caretaker Only)
```http
PATCH /api/medications/:id
Authorization: Bearer <caretaker-token>
```

**Request Body:**
```json
{
  "dosage": "100mg",
  "timing": ["08:00", "20:00"]
}
```

#### Delete Medication (Caretaker Only)
```http
DELETE /api/medications/:id
Authorization: Bearer <caretaker-token>
```

---

### Doses

#### Get Today's Doses (Patient Only)
```http
GET /api/doses/today
Authorization: Bearer <patient-token>
```

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439013",
    "medicationId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Aspirin",
      "dosage": "75mg"
    },
    "patientId": "507f1f77bcf86cd799439011",
    "scheduledTime": "2025-12-14T08:00:00.000Z",
    "status": "pending",
    "takenAt": null
  }
]
```

#### Get Dose History (Patient Only)
```http
GET /api/doses/history?days=30&page=1&limit=50
Authorization: Bearer <patient-token>
```

**Query Parameters:**
- `days` - Number of days to retrieve (default: 30)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Response:**
```json
{
  "doses": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "pages": 3
  }
}
```

#### Mark Dose as Taken (Patient Only)
```http
PATCH /api/doses/:id/take
Authorization: Bearer <patient-token>
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439013",
  "status": "taken",
  "takenAt": "2025-12-14T08:15:00.000Z",
  "medicationId": {
    "name": "Aspirin",
    "dosage": "75mg"
  }
}
```

#### Mark Dose as Missed (Patient Only)
```http
PATCH /api/doses/:id/miss
Authorization: Bearer <patient-token>
```

---

### Notifications

#### Get All Notifications
```http
GET /api/notifications?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "507f1f77bcf86cd799439014",
      "userId": "507f1f77bcf86cd799439011",
      "type": "dose_reminder",
      "message": "Time to take Aspirin 75mg",
      "isRead": false,
      "createdAt": "2025-12-14T07:55:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

**Notification Types:**
- `dose_reminder` - Medication reminder
- `medication_added` - New medication added
- `medication_updated` - Medication updated
- `adherence_alert` - Low adherence warning
- `adherence_success` - Good adherence
- `patient_linked` - Patient accepted invitation
- `link_request` - Caretaker invitation received
- `donation_request` - Blood donation request
- `system` - System notifications

#### Get Unread Count
```http
GET /api/notifications/unread/count
Authorization: Bearer <token>
```

**Response:**
```json
{
  "count": 5
}
```

#### Mark as Read
```http
PATCH /api/notifications/:id/read
Authorization: Bearer <token>
```

#### Mark All as Read
```http
PATCH /api/notifications/read-all
Authorization: Bearer <token>
```

#### Delete Notification
```http
DELETE /api/notifications/:id
Authorization: Bearer <token>
```

---

### Reports

#### Get Adherence Report
```http
GET /api/reports/adherence/:patientId?days=30
Authorization: Bearer <token>
```

**Query Parameters:**
- `days` - Number of days for report (default: 30)

**Response:**
```json
{
  "patientId": "507f1f77bcf86cd799439011",
  "patientName": "John Doe",
  "period": 30,
  "overallAdherence": 85,
  "totalDoses": 60,
  "takenDoses": 51,
  "missedDoses": 9,
  "dailyData": [
    {
      "date": "2025-12-01",
      "taken": 2,
      "missed": 0,
      "total": 2,
      "adherence": 100
    }
  ],
  "medicationWise": [
    {
      "medicationName": "Aspirin",
      "total": 30,
      "taken": 27,
      "missed": 3,
      "adherence": 90
    }
  ]
}
```

---

### Patient-Caretaker Links

#### Send Invitation (Caretaker Only)
```http
POST /api/links/invite
Authorization: Bearer <caretaker-token>
```

**Request Body:**
```json
{
  "patientEmail": "patient@example.com"
}
```

**Response:**
```json
{
  "message": "Invitation sent successfully",
  "invitationId": "507f1f77bcf86cd799439015"
}
```

#### Get Pending Invitations (Patient Only)
```http
GET /api/links/pending
Authorization: Bearer <patient-token>
```

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439015",
    "caretakerName": "Dr. Smith",
    "caretakerEmail": "dr.smith@example.com",
    "caretakerPhone": "+91 98765 43210",
    "status": "pending",
    "createdAt": "2025-12-10T10:00:00.000Z"
  }
]
```

#### Accept Invitation (Patient Only)
```http
POST /api/links/:id/accept
Authorization: Bearer <patient-token>
```

**Response:**
```json
{
  "message": "Invitation accepted successfully"
}
```

#### Unlink Patient (Caretaker Only)
```http
DELETE /api/links/:patientId
Authorization: Bearer <caretaker-token>
```

---

### Donor Module

#### Get Donor Profile (Donor Only)
```http
GET /api/donor/profile
Authorization: Bearer <donor-token>
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439016",
  "fullName": "John Donor",
  "email": "donor@example.com",
  "phone": "+91 98765 43210",
  "bloodGroup": "O+",
  "dateOfBirth": "1990-01-15",
  "city": "Mumbai",
  "address": "123 Main Street",
  "isAvailable": true,
  "totalDonations": 8,
  "memberSince": "2022-05-10T00:00:00.000Z"
}
```

#### Update Donor Profile (Donor Only)
```http
PATCH /api/donor/profile
Authorization: Bearer <donor-token>
```

**Request Body:**
```json
{
  "phone": "+91 98765 43211",
  "city": "Delhi",
  "address": "456 New Street"
}
```

#### Toggle Availability (Donor Only)
```http
PATCH /api/donor/availability/toggle
Authorization: Bearer <donor-token>
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439016",
  "isAvailable": false
}
```

#### Get Donor Stats (Donor Only)
```http
GET /api/donor/stats
Authorization: Bearer <donor-token>
```

**Response:**
```json
{
  "totalDonations": 8,
  "livesSaved": 24
}
```

#### Get Active Donation Requests (Donor Only)
```http
GET /api/donor/requests/active
Authorization: Bearer <donor-token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439017",
    "hospitalName": "City Hospital",
    "location": "Downtown, Mumbai",
    "bloodGroup": "O+",
    "unitsNeeded": 2,
    "urgencyLevel": "High",
    "contactNumber": "+91 22 1234 5678",
    "notes": "Urgent surgery patient",
    "status": "active",
    "createdAt": "2025-12-14T08:00:00.000Z"
  }
]
```

#### Accept Donation Request (Donor Only)
```http
POST /api/donor/requests/:requestId/accept
Authorization: Bearer <donor-token>
```

**Response:**
```json
{
  "message": "Request accepted successfully!",
  "requestId": "507f1f77bcf86cd799439017",
  "donationId": "DON-2025-123"
}
```

#### Get All Donations (Donor Only)
```http
GET /api/donor/donations
Authorization: Bearer <donor-token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439018",
    "donorId": "507f1f77bcf86cd799439016",
    "hospitalName": "City Hospital",
    "location": "Downtown, Mumbai",
    "bloodGroup": "O+",
    "units": 1,
    "date": "2025-12-05T09:00:00.000Z",
    "donationId": "DON-2025-105",
    "notes": "Emergency donation"
  }
]
```

#### Get Recent Donations (Donor Only)
```http
GET /api/donor/donations/recent
Authorization: Bearer <donor-token>
```

**Response:** Last 3 donations

---

## 📱 Mobile App Integration Guide

### Authentication Flow

1. **User Registration/Login**
   ```javascript
   // Register
   const response = await fetch('http://localhost:5001/api/auth/register', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       name: 'John Doe',
       email: 'john@example.com',
       password: 'password123',
       role: 'patient'
     })
   });
   const { token, user } = await response.json();
   // Store token securely (AsyncStorage, SecureStore, etc.)
   ```

2. **Making Authenticated Requests**
   ```javascript
   const response = await fetch('http://localhost:5001/api/medications', {
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     }
   });
   ```

### Push Notifications Integration

The API provides notification endpoints. Integrate with:
- Firebase Cloud Messaging (FCM) for Android
- Apple Push Notification Service (APNS) for iOS
- Expo Notifications for React Native

### Real-time Updates

Consider implementing WebSocket connections or polling for:
- Live dose reminders
- New medication notifications
- Adherence alerts

### Offline Support

Implement local caching for:
- Today's doses
- Medication list
- Recent notifications

Sync when connection is restored.

---

## 🔒 Security Best Practices

1. **Never store JWT tokens in plain text**
2. **Use HTTPS in production**
3. **Implement token refresh mechanism**
4. **Validate all user inputs**
5. **Handle errors gracefully**

---

## 🧪 Testing

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-12-14T10:00:00.000Z",
  "uptime": 3600
}
```

---

## 📝 Error Responses

All errors follow this format:

```json
{
  "message": "Error description"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🚀 Production Deployment

1. Set up MongoDB Atlas or your preferred database
2. Update `.env` with production values
3. Set `NODE_ENV=production`
4. Use a process manager (PM2, systemd)
5. Set up SSL/TLS certificates
6. Configure CORS for your domain
7. Implement rate limiting
8. Set up monitoring and logging

---

## 📞 Support

For issues or questions about the API, please contact the development team.

## 📄 License

Copyright © 2025 CareCue. All rights reserved.
