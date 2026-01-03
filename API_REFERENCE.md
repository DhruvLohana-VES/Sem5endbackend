# API Endpoints Reference

Quick reference for all available endpoints. See [README.md](./README.md) for detailed documentation.

## Base URL
```
http://localhost:5001/api
```

## Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |

## Patient Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/patients` | Get all patients | Yes | Caretaker |
| GET | `/patients/:id` | Get patient by ID | Yes | Any |

## Medication Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/medications` | Create medication | Yes | Caretaker |
| GET | `/medications` | Get current patient medications | Yes | Patient |
| GET | `/medications/patient/:patientId` | Get medications by patient | Yes | Any |
| PATCH | `/medications/:id` | Update medication | Yes | Caretaker |
| DELETE | `/medications/:id` | Delete medication | Yes | Caretaker |

## Dose Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/doses/today` | Get today's doses | Yes | Patient |
| GET | `/doses/history` | Get dose history | Yes | Patient |
| PATCH | `/doses/:id/take` | Mark dose as taken | Yes | Patient |
| PATCH | `/doses/:id/miss` | Mark dose as missed | Yes | Patient |

## Notification Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications` | Get all notifications | Yes |
| GET | `/notifications/unread/count` | Get unread count | Yes |
| PATCH | `/notifications/:id/read` | Mark as read | Yes |
| PATCH | `/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/notifications/:id` | Delete notification | Yes |

## Report Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/reports/adherence/:patientId` | Get adherence report | Yes |

## Link Endpoints (Patient-Caretaker)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/links/invite` | Send invitation | Yes | Caretaker |
| GET | `/links/pending` | Get pending invitations | Yes | Patient |
| POST | `/links/:id/accept` | Accept invitation | Yes | Patient |
| DELETE | `/links/:patientId` | Unlink patient | Yes | Caretaker |

## Donor Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/donor/profile` | Get donor profile | Yes | Donor |
| PATCH | `/donor/profile` | Update donor profile | Yes | Donor |
| PATCH | `/donor/availability/toggle` | Toggle availability | Yes | Donor |
| GET | `/donor/stats` | Get donor statistics | Yes | Donor |
| GET | `/donor/requests/active` | Get active donation requests | Yes | Donor |
| POST | `/donor/requests/:requestId/accept` | Accept donation request | Yes | Donor |
| GET | `/donor/donations` | Get all donations | Yes | Donor |
| GET | `/donor/donations/recent` | Get recent donations | Yes | Donor |

## Query Parameters

### Pagination
```
?page=1&limit=20
```

### Date Range
```
?days=30
```

## Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

## Example Requests

### Register
```bash
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient"
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "patient@demo.com",
  "password": "Demo@123"
}
```

### Create Medication
```bash
POST /api/medications
Authorization: Bearer <token>
{
  "patientId": "507f1f77bcf86cd799439011",
  "name": "Aspirin",
  "dosage": "75mg",
  "frequency": "once daily",
  "timing": ["08:00"],
  "instructions": "Take after breakfast"
}
```

### Mark Dose as Taken
```bash
PATCH /api/doses/:id/take
Authorization: Bearer <token>
```
