# CareCue Backend - Quick Start Guide

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

### 3. Configure MongoDB
#### Option A: Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/carecue
```

#### Option B: MongoDB Atlas
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/carecue
```

### 4. Seed Database (Optional)
Populate with demo data:
```bash
npm run seed
```

Demo credentials:
- Caretaker: `caretaker@demo.com` / `Demo@123`
- Patient: `patient@demo.com` / `Demo@123`
- Donor: `donor@demo.com` / `Demo@123`

### 5. Start Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on: http://localhost:5001

## Testing the API

### Health Check
```bash
curl http://localhost:5001/api/health
```

### Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@demo.com","password":"Demo@123"}'
```

## Project Structure
```
CC Backend/
├── controllers/       # Request handlers
├── models/           # Database schemas
├── routes/           # API routes
├── middleware/       # Auth & validation
├── scripts/          # Utility scripts
├── server.js         # Entry point
└── .env             # Configuration
```

## API Documentation
See [README.md](./README.md) for complete API documentation.

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access (if using Atlas)

### Port Already in Use
Change port in `.env`:
```env
PORT=5002
```

## Next Steps
- Read [README.md](./README.md) for full API documentation
- Test endpoints using Postman or Thunder Client
- Integrate with frontend or mobile app
