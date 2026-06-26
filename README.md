# BloodBridge Server

BloodBridge Server is the backend REST API for the BloodBridge blood donation management platform. It provides secure authentication, role-based authorization, donor management, blood donation request management, funding support, and dashboard statistics. The server connects blood donors with recipients across Bangladesh through a secure and scalable API.

## Purpose

BloodBridge is a full-stack blood donation management platform that connects blood donors with recipients across Bangladesh. The backend provides secure authentication, role-based authorization, donation request management, donor search, user administration, funding through Stripe, and dashboard statistics.

---
## 🔗 Live URL

- **Backend API:** [https://bloodbridge-server.onrender.com](https://bloodbridge-server.onrender.com)

---
Health Check:
```
{"name":"BloodBridge API","status":"healthy","version":"1.0.0","timestamp":"2025-01-01T00:00:00.000Z", "database":"connected"}
```

---

## Key Features

- JWT-based authentication with role support (admin, volunteer, donor)
- Donation request management with status tracking (pending → inprogress → done)
- User management with block/unblock and role assignment/updates
- Stripe payment integration for community funding
- Password encryption using bcryptjs
- Public donor search by blood group, district, and upazila
- Auto-seeding of admin user on startup
- CORS configured for multi-origin frontend support

---

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JWT (jsonwebtoken)
- bcryptjs
- Stripe
- CORS
- dotenv

## NPM Packages Used

- express
- mongodb
- jsonwebtoken
- bcryptjs
- cors
- dotenv
- stripe
- nodemon

---

## Project Structure

```
config/
│   └── db.js         # MongoDB connection
src/
├── index.js          # App entry point, middleware, route mounting
├── seed.js           # Auto-seeds admin user on startup
├── utils.js          # Shared helpers (pagination, ObjectId, JWT sign)
middleware/
    └── auth.js       # JWT verification, role guard
routes/
    ├── auth.js       # Register, login, /me
    ├── users.js      # User CRUD, role & status management
    ├── requests.js   # Donation request CRUD with filters
    ├── funding.js    # Stripe payment intent + funding records
    └── stats.js      # Dashboard statistics
```

---

### Installation

```bash
# Clone the repository
git clone https://github.com/tash-9/bloodbridge-server.git
cd bloodbridge-server

# Install dependencies
npm install

# Check connection with Database
npm run seed

# Start development server
npm run dev
```
---

## Scripts

```bash
npm run dev    # Start with nodemon (auto-restart on changes)
npm start      # Start production server
npm run seed   # Run seed script manually
```

---

## User Roles

| Role | Permissions |
|------|------------|
| `donor` | Create/manage own requests, view own profile, fund |
| `volunteer` | View and manage all donation requests |
| `admin` | Full access — manage users, roles, all requests |

---

## Default Admin Credentials

After first deployment, log in with:

```
Email:    admin@bloodbridge.test
Password: Admin12345
```


---

## Author

Tasfia Islam Raisha