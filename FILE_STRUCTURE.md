# 📦 Backend File Structure

```
CC Backend/
│
├── 📄 Configuration Files
│   ├── .env                    # Environment variables (MongoDB, JWT secret)
│   ├── .env.example            # Example environment configuration
│   ├── .gitignore              # Git ignore rules
│   ├── package.json            # Dependencies and scripts
│   └── server.js               # Main server entry point
│
├── 📁 controllers/             # Business logic (8 files)
│   ├── auth.controller.js      # Register, login, get current user
│   ├── patient.controller.js   # Get patients, patient details
│   ├── medication.controller.js# CRUD operations for medications
│   ├── dose.controller.js      # Dose tracking and management
│   ├── notification.controller.js # Notification management
│   ├── report.controller.js    # Adherence reports and analytics
│   ├── link.controller.js      # Patient-caretaker linking
│   └── donor.controller.js     # Blood donor management
│
├── 📁 models/                  # Database schemas (7 files)
│   ├── User.model.js           # User schema (Patient/Caretaker/Donor)
│   ├── Medication.model.js     # Medication schema
│   ├── Dose.model.js           # Dose tracking schema
│   ├── Notification.model.js   # Notification schema
│   ├── Link.model.js           # Patient-caretaker link schema
│   ├── DonationRequest.model.js# Blood donation request schema
│   └── Donation.model.js       # Donation history schema
│
├── 📁 routes/                  # API endpoints (8 files)
│   ├── auth.routes.js          # /api/auth/* endpoints
│   ├── patient.routes.js       # /api/patients/* endpoints
│   ├── medication.routes.js    # /api/medications/* endpoints
│   ├── dose.routes.js          # /api/doses/* endpoints
│   ├── notification.routes.js  # /api/notifications/* endpoints
│   ├── report.routes.js        # /api/reports/* endpoints
│   ├── link.routes.js          # /api/links/* endpoints
│   └── donor.routes.js         # /api/donor/* endpoints
│
├── 📁 middleware/              # Express middleware (2 files)
│   ├── auth.middleware.js      # JWT authentication & authorization
│   └── validation.middleware.js# Request validation
│
├── 📁 scripts/                 # Utility scripts (1 file)
│   └── seed.js                 # Database seeding with demo data
│
└── 📁 Documentation/           # Complete API docs (4 files)
    ├── README.md               # Complete API documentation (40+ endpoints)
    ├── GETTING_STARTED.md      # Overview and quick start
    ├── QUICKSTART.md           # Installation and setup guide
    └── API_REFERENCE.md        # Quick endpoint reference table
```

## 📊 Statistics

- **Total Files Created:** 35
- **Controllers:** 8
- **Models:** 7
- **Routes:** 8
- **Middleware:** 2
- **Documentation Files:** 4
- **API Endpoints:** 40+
- **Lines of Code:** ~3,500+

## 🔗 Endpoint Summary

### Authentication (3 endpoints)
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Patients (2 endpoints)
- GET `/api/patients` - Get all patients
- GET `/api/patients/:id` - Get patient details

### Medications (5 endpoints)
- POST `/api/medications` - Create medication
- GET `/api/medications` - Get current patient medications
- GET `/api/medications/patient/:patientId` - Get medications by patient
- PATCH `/api/medications/:id` - Update medication
- DELETE `/api/medications/:id` - Delete medication

### Doses (4 endpoints)
- GET `/api/doses/today` - Get today's doses
- GET `/api/doses/history` - Get dose history
- PATCH `/api/doses/:id/take` - Mark as taken
- PATCH `/api/doses/:id/miss` - Mark as missed

### Notifications (5 endpoints)
- GET `/api/notifications` - Get all notifications
- GET `/api/notifications/unread/count` - Get unread count
- PATCH `/api/notifications/:id/read` - Mark as read
- PATCH `/api/notifications/read-all` - Mark all as read
- DELETE `/api/notifications/:id` - Delete notification

### Reports (1 endpoint)
- GET `/api/reports/adherence/:patientId` - Get adherence report

### Links (4 endpoints)
- POST `/api/links/invite` - Send invitation
- GET `/api/links/pending` - Get pending invitations
- POST `/api/links/:id/accept` - Accept invitation
- DELETE `/api/links/:patientId` - Unlink patient

### Donor Module (8 endpoints)
- GET `/api/donor/profile` - Get donor profile
- PATCH `/api/donor/profile` - Update donor profile
- PATCH `/api/donor/availability/toggle` - Toggle availability
- GET `/api/donor/stats` - Get donor statistics
- GET `/api/donor/requests/active` - Get active requests
- POST `/api/donor/requests/:requestId/accept` - Accept request
- GET `/api/donor/donations` - Get all donations
- GET `/api/donor/donations/recent` - Get recent donations

### System (1 endpoint)
- GET `/api/health` - Health check

**Total: 40+ endpoints**
