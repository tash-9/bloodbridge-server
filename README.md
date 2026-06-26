# BloodBridge Server

REST API backend for **BloodBridge** — a blood donation platform connecting donors with urgent recipients across Bangladesh.

Built with **Node.js**, **Express**, and **MongoDB**.

---
## 🔗 Live URL

- **Backend API:** [https://bloodbridge-server.onrender.com](https://bloodbridge-server.onrender.com)

```
{"name":"BloodBridge API","status":"healthy","version":"1.0.0","timestamp":"2025-01-01T00:00:00.000Z", "database":"connected"}
```

---

## Features

- JWT-based authentication with role support (admin, volunteer, donor)
- Donation request management with status tracking (pending → inprogress → done)
- User management with block/unblock and role assignment
- Stripe payment integration for community funding
- Public donor search by blood group, district, and upazila
- Auto-seeding of admin user on startup
- CORS configured for multi-origin frontend support

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ESM) |
| Framework | Express 4 |
| Database | MongoDB (native driver) |
| Auth | JWT + bcryptjs |
| Payments | Stripe |
| Dev Tool | Nodemon |

---

## Project Structure

```
src/
├── index.js          # App entry point, middleware, route mounting
├── seed.js           # Auto-seeds admin user on startup
├── utils.js          # Shared helpers (pagination, ObjectId, JWT sign)
├── config/
│   └── db.js         # MongoDB connection
├── middleware/
│   └── auth.js       # JWT verification, role guard
└── routes/
    ├── auth.js       # Register, login, /me
    ├── users.js      # User CRUD, role & status management
    ├── requests.js   # Donation request CRUD with filters
    ├── funding.js    # Stripe payment intent + funding records
    └── stats.js      # Dashboard statistics
```

---
### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Stripe account (for funding feature)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/bloodbridge-server.git
cd bloodbridge-server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Fill in your values (see Environment Variables below)

# Start development server
npm run dev
```

---

## Environment Variables

Create a `.env` file in the root with the following:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/bloodbridge
JWT_SECRET=your_jwt_secret_here
STRIPE_SECRET_KEY=sk_test_your_stripe_key
CLIENT_ORIGIN=http://localhost:5173
ADMIN_EMAIL=admin@bloodbridge.test
ADMIN_PASSWORD=Admin12345
```

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `STRIPE_SECRET_KEY` | Stripe secret key for payment processing |
| `CLIENT_ORIGIN` | Frontend URL(s) for CORS (comma-separated for multiple) |
| `ADMIN_EMAIL` | Default admin account email |
| `ADMIN_PASSWORD` | Default admin account password |

---

## Scripts

```bash
npm run dev    # Start with nodemon (auto-restart on changes)
npm start      # Start production server
npm run seed   # Run seed script manually
```

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register new donor |
| POST | `/login` | ❌ | Login and receive JWT |
| GET | `/me` | ✅ | Get current user profile |

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | List all users |
| PATCH | `/:id/role` | Admin | Update user role |
| PATCH | `/:id/status` | Admin | Block or unblock user |
| GET | `/search` | ❌ | Search donors by blood group/location |

### Donation Requests — `/api/requests`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/public` | ❌ | List all pending requests |
| GET | `/` | ✅ | List requests (filtered by role) |
| GET | `/:id` | ✅ | Get single request |
| POST | `/` | Donor | Create new request |
| PATCH | `/:id` | ✅ | Update request |
| PATCH | `/:id/status` | ✅ | Update request status |
| DELETE | `/:id` | ✅ | Delete request |

### Funding — `/api/funding`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | List all funding records |
| POST | `/payment-intent` | ✅ | Create Stripe payment intent |
| POST | `/` | ✅ | Record a completed payment |

### Stats — `/api/stats`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Dashboard statistics |

---

## User Roles

| Role | Permissions |
|------|------------|
| `donor` | Create/manage own requests, view own profile, fund |
| `volunteer` | View and manage all donation requests |
| `admin` | Full access — manage users, roles, all requests |

---

## Deployment (Render)

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your GitHub repository
4. Set the following:
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
   - **Instance Type:** Free
5. Add all environment variables from the table above
6. Set `CLIENT_ORIGIN` to your frontend's Vercel URL
7. Deploy — the admin user is auto-created on first startup

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
