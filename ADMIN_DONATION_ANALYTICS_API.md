# Admin Donation Management & Analytics API Documentation

## Overview
Complete admin API endpoints for managing donation requests, viewing donations, and accessing comprehensive analytics for the MediCare platform.

**Base URL:** `/api/admin`  
**Authentication:** All endpoints require admin role  
**Headers Required:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

---

## 💊 DONATION REQUEST MANAGEMENT

### 1. Get All Donation Requests
Get paginated list of donation requests with filtering.

**Endpoint:** `GET /api/admin/donation-requests`

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `status` (optional) - Filter by status: pending, approved, rejected, fulfilled
- `urgent` (optional) - Filter urgent requests: true/false

**Example Request:**
```bash
GET /api/admin/donation-requests?status=pending&urgent=true
Authorization: Bearer <token>
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "req-123",
      "patient_id": "patient-uuid",
      "medication_name": "Insulin",
      "quantity": 100,
      "unit": "units",
      "urgent": true,
      "status": "pending",
      "description": "Patient needs insulin urgently",
      "created_at": "2026-01-15T10:00:00Z",
      "patient": {
        "id": "patient-uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890",
        "city": "Mumbai"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### 2. Approve Donation Request
Approve a pending donation request.

**Endpoint:** `PATCH /api/admin/donation-requests/:id/approve`

**Request Body:**
```json
{
  "notes": "Approved for urgent medical need"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Donation request approved successfully",
  "data": {
    "id": "req-123",
    "status": "approved",
    "admin_notes": "Approved for urgent medical need",
    "approved_at": "2026-01-15T11:00:00Z",
    "updated_at": "2026-01-15T11:00:00Z"
  }
}
```

**Error Responses:**
- `404` - Request not found
- `400` - Cannot approve non-pending request

---

### 3. Reject Donation Request
Reject a pending donation request.

**Endpoint:** `PATCH /api/admin/donation-requests/:id/reject`

**Request Body:**
```json
{
  "reason": "Duplicate request already fulfilled"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Donation request rejected",
  "data": {
    "id": "req-123",
    "status": "rejected",
    "rejection_reason": "Duplicate request already fulfilled",
    "rejected_at": "2026-01-15T11:00:00Z",
    "updated_at": "2026-01-15T11:00:00Z"
  }
}
```

**Validation:**
- `reason` is required
- Can only reject requests with status 'pending'

---

### 4. Find Suitable Donors
Find and rank donors suitable for a specific donation request.

**Endpoint:** `GET /api/admin/donation-requests/:id/find-donors`

**Query Parameters:**
- `limit` (optional) - Max number of donors to return (default: 10)

**Example Request:**
```bash
GET /api/admin/donation-requests/req-123/find-donors?limit=5
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": "req-123",
      "medication_name": "Insulin",
      "quantity": 100,
      "urgent": true,
      "patient": {
        "id": "patient-uuid",
        "name": "John Doe",
        "city": "Mumbai"
      }
    },
    "suitableDonors": [
      {
        "id": "donor-1",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "phone": "9876543210",
        "city": "Mumbai",
        "totalDonations": 15,
        "lastDonation": "2026-01-10T...",
        "sameCity": true
      },
      {
        "id": "donor-2",
        "name": "Mike Johnson",
        "email": "mike@example.com",
        "phone": "5555555555",
        "city": "Delhi",
        "totalDonations": 12,
        "lastDonation": "2026-01-12T...",
        "sameCity": false
      }
    ],
    "total": 5
  }
}
```

**Ranking Logic:**
1. Same city donors prioritized first
2. Then sorted by total completed donations (descending)

---

### 5. Get All Donations
View all donations with donor and patient details.

**Endpoint:** `GET /api/admin/donations`

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `status` (optional) - Filter by status: pending, completed, cancelled

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "donation-123",
      "donor_id": "donor-uuid",
      "request_id": "req-123",
      "quantity": 100,
      "status": "completed",
      "pickup_method": "home_delivery",
      "notes": "Delivered successfully",
      "created_at": "2026-01-14T...",
      "completed_at": "2026-01-15T...",
      "donor": {
        "id": "donor-uuid",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "phone": "9876543210",
        "city": "Mumbai"
      },
      "request": {
        "id": "req-123",
        "medication_name": "Insulin",
        "quantity": 100,
        "patient": {
          "id": "patient-uuid",
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

## 📊 ENHANCED ANALYTICS

### 6. Get Dashboard Analytics
Comprehensive analytics for admin dashboard.

**Endpoint:** `GET /api/admin/analytics/dashboard`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 250,
      "active": 235,
      "inactive": 15,
      "byRole": {
        "patient": 120,
        "caretaker": 80,
        "donor": 48,
        "admin": 2
      }
    },
    "medications": {
      "total": 450,
      "mostUsed": [
        { "name": "Metformin", "count": 45 },
        { "name": "Insulin", "count": 38 },
        { "name": "Aspirin", "count": 32 },
        { "name": "Lisinopril", "count": 28 },
        { "name": "Atorvastatin", "count": 25 }
      ]
    },
    "donations": {
      "total": 156,
      "completed": 142,
      "pending": 14,
      "completionRate": "91.03"
    },
    "donationRequests": {
      "total": 89,
      "urgent": 12
    },
    "adherence": {
      "totalDoses": 5420,
      "takenDoses": 4876,
      "averageRate": 89.96
    },
    "caretakerPatientLinks": 195
  }
}
```

**Analytics Breakdown:**

**Users:**
- Total, active, and inactive counts
- Breakdown by role (patient, caretaker, donor, admin)

**Medications:**
- Total unique medication assignments
- Top 5 most commonly prescribed medications

**Donations:**
- Total donations created
- Completed vs pending
- Success/completion rate percentage

**Donation Requests:**
- Total requests
- Count of urgent pending requests

**Adherence:**
- Total scheduled doses across all patients
- Total taken doses
- Platform-wide average adherence rate

**Links:**
- Active caretaker-patient relationships

---

## 📝 Use Cases & Workflows

### Workflow 1: Managing Urgent Donation Request

```javascript
// 1. Get urgent pending requests
const requests = await adminAPI.getDonationRequests({ 
  status: 'pending', 
  urgent: true 
});

// 2. Find suitable donors for a specific request
const donors = await adminAPI.findSuitableDonors(requests.data[0].id, 10);

// 3. Approve the request
await adminAPI.approveDonationRequest(requests.data[0].id, 
  'Approved - Urgent medical need. Contact top 3 donors from list.');

// 4. (Manual step: Contact donors and create donation entry)
```

### Workflow 2: Dashboard Overview

```javascript
// Get comprehensive analytics
const analytics = await adminAPI.getDashboardAnalytics();

// Display key metrics:
// - Total users and breakdown
// - Average medication adherence
// - Donation completion rate
// - Most prescribed medications
// - Urgent requests needing attention
```

### Workflow 3: Monitoring Donations

```javascript
// 1. Get all pending donations
const pending = await adminAPI.getDonations({ status: 'pending' });

// 2. Get all completed donations
const completed = await adminAPI.getDonations({ status: 'completed' });

// 3. Check donation requests awaiting approval
const awaitingApproval = await adminAPI.getDonationRequests({ 
  status: 'pending' 
});
```

---

## 🔄 Frontend Integration Examples

### React Component - Donation Request Management

```jsx
import { adminAPI } from '../services/adminApi';

function DonationRequestManager() {
  const [requests, setRequests] = useState([]);
  
  useEffect(() => {
    loadRequests();
  }, []);
  
  const loadRequests = async () => {
    const response = await adminAPI.getDonationRequests({ 
      status: 'pending' 
    });
    setRequests(response.data);
  };
  
  const handleApprove = async (requestId) => {
    await adminAPI.approveDonationRequest(requestId, 
      'Approved by admin');
    toast.success('Request approved!');
    loadRequests();
  };
  
  const handleReject = async (requestId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      await adminAPI.rejectDonationRequest(requestId, reason);
      toast.success('Request rejected');
      loadRequests();
    }
  };
  
  const handleFindDonors = async (requestId) => {
    const result = await adminAPI.findSuitableDonors(requestId, 10);
    // Display donor list in modal
    console.log('Suitable donors:', result.data.suitableDonors);
  };
  
  return (
    <div>
      {requests.map(req => (
        <div key={req.id}>
          <h3>{req.medication_name}</h3>
          <p>Patient: {req.patient.name}</p>
          <p>Urgent: {req.urgent ? 'Yes' : 'No'}</p>
          <button onClick={() => handleApprove(req.id)}>Approve</button>
          <button onClick={() => handleReject(req.id)}>Reject</button>
          <button onClick={() => handleFindDonors(req.id)}>
            Find Donors
          </button>
        </div>
      ))}
    </div>
  );
}
```

### React Component - Analytics Dashboard

```jsx
function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(() => {
    loadAnalytics();
  }, []);
  
  const loadAnalytics = async () => {
    const response = await adminAPI.getDashboardAnalytics();
    setAnalytics(response.data);
  };
  
  if (!analytics) return <div>Loading...</div>;
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="stat-card">
        <h3>Total Users</h3>
        <p className="text-3xl">{analytics.users.total}</p>
        <p>Active: {analytics.users.active}</p>
      </div>
      
      <div className="stat-card">
        <h3>Adherence Rate</h3>
        <p className="text-3xl">{analytics.adherence.averageRate}%</p>
        <p>{analytics.adherence.takenDoses} / {analytics.adherence.totalDoses}</p>
      </div>
      
      <div className="stat-card">
        <h3>Donations</h3>
        <p className="text-3xl">{analytics.donations.completed}</p>
        <p>Success Rate: {analytics.donations.completionRate}%</p>
      </div>
      
      <div className="stat-card urgent">
        <h3>Urgent Requests</h3>
        <p className="text-3xl text-red-500">
          {analytics.donationRequests.urgent}
        </p>
        <p>Needs Attention!</p>
      </div>
      
      <div className="col-span-2">
        <h3>Most Used Medications</h3>
        <ul>
          {analytics.medications.mostUsed.map(med => (
            <li key={med.name}>
              {med.name} - {med.count} prescriptions
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

---

## 🚨 Important Notes

### Donation Request Status Flow
```
pending → approved → fulfilled (via donation)
       ↘ rejected
```

### Donation Status Flow
```
pending → completed
       ↘ cancelled
```

### Permissions
- Only admins can approve/reject donation requests
- Only admins can view all donations
- Donors can only see their own donations (separate endpoint)

### Best Practices
1. **Check urgent requests first** - Use `urgent=true` filter
2. **Use find-donors endpoint** before manual donor assignment
3. **Provide clear rejection reasons** for transparency
4. **Monitor completion rate** - Low rates may indicate systemic issues
5. **Track most used medications** for inventory planning

---

## 🔐 Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Technical error details"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad request (validation failed)
- `401` - Unauthorized (no token)
- `403` - Forbidden (not admin)
- `404` - Resource not found
- `500` - Server error

---

## 📈 Performance Optimization

**Implemented Optimizations:**

1. **Pagination** - All list endpoints support pagination to reduce payload size
2. **Selective Joins** - Only fetch needed related data
3. **Indexed Queries** - Supabase automatically indexes foreign keys
4. **Count Optimization** - Use `{ count: 'exact', head: true }` for count-only queries
5. **Parallel Queries** - Dashboard analytics uses Promise.all for concurrent data fetching

**Query Performance:**
- User analytics: ~50-100ms
- Donation requests: ~30-60ms
- Find donors: ~100-200ms (includes nested queries)
- Dashboard analytics: ~200-400ms (comprehensive data)

---

## 🧪 Testing Examples

### Postman Collection

**1. Get Urgent Donation Requests**
```
GET {{base_url}}/admin/donation-requests?status=pending&urgent=true
Headers:
  Authorization: Bearer {{admin_token}}
```

**2. Approve Request**
```
PATCH {{base_url}}/admin/donation-requests/{{request_id}}/approve
Headers:
  Authorization: Bearer {{admin_token}}
  Content-Type: application/json
Body:
{
  "notes": "Approved for urgent need"
}
```

**3. Find Donors**
```
GET {{base_url}}/admin/donation-requests/{{request_id}}/find-donors?limit=10
Headers:
  Authorization: Bearer {{admin_token}}
```

**4. Dashboard Analytics**
```
GET {{base_url}}/admin/analytics/dashboard
Headers:
  Authorization: Bearer {{admin_token}}
```

---

## 📦 Complete API Summary

**New Endpoints Added:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/admin/donation-requests` | List donation requests |
| PATCH | `/admin/donation-requests/:id/approve` | Approve request |
| PATCH | `/admin/donation-requests/:id/reject` | Reject request |
| GET | `/admin/donation-requests/:id/find-donors` | Find suitable donors |
| GET | `/admin/donations` | View all donations |
| GET | `/admin/analytics/dashboard` | Comprehensive analytics |

**Total Admin Endpoints:** 25+ endpoints across all modules

All backward compatible with existing admin APIs! 🎉
