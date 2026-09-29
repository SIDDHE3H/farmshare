# FarmShare 🚜

> **Agricultural Equipment, Within Reach.**
> A peer-to-peer agricultural machinery sharing, rental, and request platform tailored for rural farming communities.

---

## 🌾 Project Overview

Many smallholder farmers cannot afford capital-intensive machinery like high-horsepower tractors, heavy rotavators, combine harvesters, power sprayers, diesel water pumps, and seed drills. Meanwhile, machinery owners often have equipment sitting idle between field cycles.

**FarmShare** bridges this gap:
- **Equipment Owners**: List agricultural machinery, set daily/hourly rental rates, define availability windows, review rental inquiries, and accept or reject requests.
- **Renting Farmers**: Search machinery near their village, taluka, or district, filter by category and price, review condition and owner credentials, check booked dates, send rental requests, and track status.
- **Conflict Protection**: Guarantees that no two accepted bookings ever overlap for the same machinery.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, React Router DOM, Axios |
| **Backend** | Node.js, Express.js, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), Multer |
| **Database** | SQLite (`sql.js`) with Relational Schema, Foreign Keys (`PRAGMA foreign_keys = ON`), Indexes, and File Persistence |
| **Testing** | Node assert verification suite + Live HTTP End-to-End integration test runner |

---

## 📁 Project Directory Structure

```
farmshare/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Relational SQLite connection, schema bootstrap & indexes
│   │   ├── controllers/
│   │   │   ├── authController.js     # Signup, login, getProfile, updateProfile
│   │   │   ├── equipmentController.js# Filter/search, details, create, edit, delete, my listings
│   │   │   ├── requestController.js  # Rental request submission, status changes, cancellation
│   │   │   └── statsController.js    # Metric aggregates & recent activity feed
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT Bearer token authentication & user context
│   │   │   └── upload.js             # Multer image upload storage
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth
│   │   │   ├── equipmentRoutes.js    # /api/equipment
│   │   │   ├── requestRoutes.js      # /api/requests
│   │   │   └── statsRoutes.js        # /api/stats
│   │   ├── utils/
│   │   │   ├── bookingConflict.js    # Strict date overlap conflict detection
│   │   │   └── seed.js               # Realistic rural demo data (Baramati/Pune)
│   │   └── index.js                  # Express app, static uploads, CORS, server entry
│   ├── uploads/                      # Uploaded machinery photos
│   ├── test_api.js                   # Unit/Integration verification suite
│   ├── test_e2e_http.js              # Live HTTP end-to-end test suite
│   ├── .env                          # Server configuration
│   └── package.json
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js             # Axios instance with auth interceptor
│   │   ├── components/
│   │   │   ├── ConfirmModal.jsx      # Confirmation dialog for delete/cancel
│   │   │   ├── EquipmentCard.jsx     # Responsive machinery card
│   │   │   ├── Footer.jsx            # Rural community footer
│   │   │   ├── Navbar.jsx            # Navigation bar with mobile drawer
│   │   │   ├── ProtectedRoute.jsx    # Authentication route guard
│   │   │   ├── RequestModal.jsx      # Rental request dialog with date clash prevention
│   │   │   ├── StatusBadge.jsx       # Status pill (Pending, Accepted, Rejected, Completed)
│   │   │   └── Toast.jsx             # Notification toast container
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Authentication state & actions
│   │   │   └── ToastContext.jsx      # Toast notifications provider
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # Summary cards, stats, and recent activity
│   │   │   ├── EditEquipment.jsx     # Edit existing machinery listing
│   │   │   ├── EquipmentDetails.jsx  # Detailed specs, owner card, booked schedule
│   │   │   ├── FindEquipment.jsx     # Search catalog with category pills, filters, sort
│   │   │   ├── Home.jsx              # Landing page, categories, 3-step guide
│   │   │   ├── ListEquipment.jsx     # Form to publish new equipment
│   │   │   ├── Login.jsx             # Login with 1-click demo switcher
│   │   │   ├── MyListings.jsx        # Owner machinery management & inquiries
│   │   │   ├── MyRequests.jsx        # Sent rental requests tracker
│   │   │   ├── RequestsReceived.jsx  # Incoming inquiries with Accept/Reject buttons
│   │   │   ├── Signup.jsx            # Account creation with village/taluka fields
│   │   │   └── UserProfile.jsx       # Profile editing and activity stats
│   │   ├── utils/
│   │   │   └── formatters.js         # Currency (₹), date, and location formatters
│   │   ├── App.jsx                   # Main React Router tree
│   │   ├── main.jsx                  # Vite mount root
│   │   └── index.css                 # Tailwind CSS directives
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── start-server.bat                  # Double-click script to launch backend
├── start-client.bat                  # Double-click script to launch frontend
├── run-tests.bat                     # Double-click script to run test suite
├── package.json                      # Workspace scripts
└── README.md
```

---

## 🗄️ Database Schema

### 1. `users` Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  village TEXT NOT NULL,
  taluka TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `equipment` Table
```sql
CREATE TABLE equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  village TEXT NOT NULL,
  taluka TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  price_per_day REAL NOT NULL,
  price_per_hour REAL DEFAULT NULL,
  available_from DATE NOT NULL,
  available_until DATE NOT NULL,
  condition TEXT NOT NULL, -- 'Excellent', 'Good', 'Fair'
  image_url TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3. `requests` Table
```sql
CREATE TABLE requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_from DATE NOT NULL,
  requested_until DATE NOT NULL,
  duration_days INTEGER NOT NULL,
  total_price REAL NOT NULL,
  message TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔒 Double-Booking Protection Algorithm

To prevent double-booking, the backend checks for conflicts both when requests are submitted and when owners accept them:

```sql
SELECT id, requested_from, requested_until
FROM requests
WHERE equipment_id = ?
  AND status = 'Accepted'
  AND id != ?
  AND NOT (requested_until < ? OR requested_from > ?);
```
If conflicting records exist, the server blocks acceptance with HTTP 409:
`"Equipment is already booked for these dates."`

---

## 👥 Demo Accounts (Pre-configured)

The database comes pre-seeded with realistic agricultural demo data. You can log in using the credentials below or click the **Quick Test Account** buttons on the Login page:

| Role | Name | Email | Password | Village |
|---|---|---|---|---|
| **Equipment Owner** | Suresh Patil | `suresh@farmshare.in` | `farmer123` | Karanje, Baramati |
| **Renting Farmer** | Ramesh Shinde | `ramesh@farmshare.in` | `farmer123` | Malegaon, Baramati |
| **Owner / Farmer** | Anita Deshmukh | `anita@farmshare.in` | `farmer123` | Shirur, Pune |
| **Harvester Owner** | Balasaheb Jadhav | `bala@farmshare.in` | `farmer123` | Indapur, Pune |

---

## 🚀 Running the Project

### 1. Environment Setup
The backend `.env` file (`server/.env`):
```env
PORT=5000
JWT_SECRET=farmshare_secure_jwt_secret_token_key_2026
DATABASE_FILE=farmshare.sqlite
CLIENT_URL=http://localhost:5173
```

### 2. Start the Backend Server
```bash
cd server
npm start
# or: node src/index.js
# Or double-click start-server.bat on Windows
```
The API server starts at `http://localhost:5000`.

### 3. Start the Frontend Client
```bash
cd client
npm run dev
# Or double-click start-client.bat on Windows
```
Open your browser at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

Run the verification test suite:
```bash
cd server
node test_api.js
node test_e2e_http.js
```
Expected output:
```
--- STARTING LIVE HTTP END-TO-END SUITE ---
1. Health check status: 200 { status: 'ok', name: 'FarmShare API', version: '1.0.0' }
2. Suresh Login: 200 Suresh Patil
3. Ramesh Login: 200 Ramesh Shinde
4. Equipment Search "rotavator": 2 matches found
5. Created Listing status: 201 Equipment listed successfully.
6. Ramesh sent request 1: 201 Request sent successfully.
7. Suresh accepted request 1: 200 Request status updated to Accepted.
8. Anita sent overlapping request 2: 409
9. Double-booking collision prevented successfully!
10. Suresh Dashboard metrics: { myEquipmentCount: 4, ... }
11. Cleaned up test listing: 200
🎉 ALL LIVE HTTP END-TO-END TESTS PASSED WITH 100% SUCCESS!
```

---

## 🌐 Production Deployment on Render

This repository includes `render.yaml` for a single public Render web service. The service builds the Vite client, serves it from Express, and exposes the API at `/api`.

1. Push the repository to GitHub.
2. In Render, choose **New → Blueprint**, connect the repository, and apply `render.yaml`.
3. Open the generated `https://...onrender.com` URL.

The blueprint generates `JWT_SECRET` automatically and uses SQLite plus local uploads. Render's free plan has ephemeral storage, so database records and uploaded files can be reset after a redeploy or instance restart. Use a paid Render persistent disk, or migrate the database and uploads to managed storage, before treating this as a production data store.
