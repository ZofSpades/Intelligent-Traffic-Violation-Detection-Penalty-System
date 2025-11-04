# Intelligent Traffic Violation Detection & Penalty System

A fullstack web application for managing traffic violations, vehicle owners, payments, and license suspensions.

## 🚀 Project Structure

```
db project/
├── backend/          # Node.js + Express API
│   ├── config/       # Database configuration
│   ├── routes/       # API endpoints
│   ├── .env          # Environment variables
│   ├── server.js     # Main server file
│   └── package.json
│
└── frontend/         # React Application
    ├── public/       # Static files
    ├── src/
    │   ├── pages/    # Page components
    │   ├── services/ # API services
    │   ├── App.js    # Main app component
    │   └── index.js
    └── package.json
```

## 📋 Features

### Backend (Node.js + Express)
- ✅ RESTful API with Express
- ✅ MySQL database connection using mysql2
- ✅ Connection pooling for better performance
- ✅ CRUD operations for all entities
- ✅ Environment variable configuration
- ✅ Error handling middleware
- ✅ CORS enabled for frontend communication

### Frontend (React)
- ✅ Modern React with hooks
- ✅ React Router for navigation
- ✅ Bootstrap 5 for styling
- ✅ Axios for API calls
- ✅ Responsive design
- ✅ Form validation
- ✅ Error handling

### Entities Managed
1. **Owners** - Vehicle and license owners
2. **Vehicles** - Vehicle registration and details
3. **Licenses** - Driver's license information
4. **Violations** - Traffic violation records
5. **Payments** - Fine payment processing
6. **Suspensions** - License suspension tracking

## 🔧 Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ZofSpades/Intelligent-Traffic-Violation-Detection-Penalty-System.git
cd "Intelligent-Traffic-Violation-Detection-Penalty-System"
```

### 2. Database Setup

First, ensure your MySQL server is running and create the database with all required tables, triggers, functions, and procedures:

```sql
CREATE DATABASE trafsys;
USE trafsys;

-- Create tables (owners, vehicles, licenses, violations, violation_types, payments, suspensions)
-- Run your complete database schema script here
-- Make sure to include:
-- - Table creation statements
-- - Trigger: trg_after_violation_insert
-- - Trigger: trg_after_payment_insert
-- - Function: fn_get_license_points
-- - Function: fn_should_suspend_license
-- - Procedure: sp_pending_fines_summary
```

**Important Database Schema Details:**
- Table names are lowercase plural: `owners`, `vehicles`, `licenses`, `violations`, `violation_types`, `payments`, `suspensions`
- Key fields:
  - `owners`: owner_id, name, address, phone
  - `vehicles`: vehicle_id, registration_no, vehicle_type, owner_id
  - `licenses`: license_id, owner_id, issue_date, expiry_date, status
  - `violations`: violation_id, vehicle_id, violation_type_id, location, date_time, status
  - `violation_types`: violation_type_id, description, fine_amount, points
  - `payments`: payment_id, violation_id, amount_paid, payment_date
  - `suspensions`: suspension_id, license_id, start_date, end_date, reason

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (IMPORTANT: This file is not in the repository)
# Copy .env.example to .env and update with your credentials
```

**Create a `.env` file in the backend directory with the following content:**

```env
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=trafsys
DB_CONNECTION_LIMIT=10
```

**⚠️ IMPORTANT:** Replace `your_mysql_username` and `your_mysql_password` with your actual MySQL credentials.

```bash
# Start the backend server
npm start
```

The backend server will start on `http://localhost:5000`

For development with auto-restart:
```powershell
npm run dev
```

### 4. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend will start on `http://localhost:3000`

**Note:** No environment variables are required for the frontend as it connects to the backend at `http://localhost:5000`.

## 🎯 Usage

1. **Start Backend**: Run `npm start` in the backend directory
2. **Start Frontend**: Run `npm start` in the frontend directory
3. **Access Application**: Open `http://localhost:3000` in your browser

### API Endpoints

All API endpoints are prefixed with `/api`

#### Owners
- `GET /api/owners` - Get all owners
- `GET /api/owners/:id` - Get owner by ID
- `POST /api/owners` - Create new owner
- `PUT /api/owners/:id` - Update owner
- `DELETE /api/owners/:id` - Delete owner

#### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get vehicle by ID
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

#### Violations
- `GET /api/violations` - Get all violations
- `GET /api/violations/:id` - Get violation by ID
- `POST /api/violations` - Create new violation
- `PUT /api/violations/:id` - Update violation
- `DELETE /api/violations/:id` - Delete violation

#### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Process new payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

#### Suspensions
- `GET /api/suspensions` - Get all suspensions
- `GET /api/suspensions/:id` - Get suspension by ID
- `POST /api/suspensions` - Create new suspension
- `PUT /api/suspensions/:id` - Update suspension
- `DELETE /api/suspensions/:id` - Delete suspension

#### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🎨 Application Pages

1. **Dashboard** - Overview with statistics and recent violations
2. **Owner Management** - List, add, edit, and delete owners
3. **Vehicle Management** - Manage vehicle registrations
4. **Violation Management** - Report and track violations
5. **Payment Processing** - Process and track payments
6. **Suspension Overview** - View license suspensions

## 🔒 Environment Variables

### Backend `.env` File (Required - Create This Yourself)

**⚠️ SECURITY NOTICE:** The `.env` file is not included in the repository for security reasons. You must create it manually.

Create a file named `.env` in the `backend/` directory with the following content:

```env
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=trafsys
DB_CONNECTION_LIMIT=10
```

**Configuration Details:**
- `PORT`: Backend server port (default: 5000)
- `DB_HOST`: MySQL server host (default: localhost)
- `DB_USER`: Your MySQL username (replace with your actual username)
- `DB_PASSWORD`: Your MySQL password (replace with your actual password)
- `DB_NAME`: Database name (must be: trafsys)
- `DB_CONNECTION_LIMIT`: MySQL connection pool size (default: 10)

### Frontend Configuration

No environment variables required. The frontend is configured to connect to `http://localhost:5000` by default.

## 🐛 Troubleshooting

### Backend won't start
- **Missing .env file**: Create the `.env` file in the `backend/` directory with your database credentials
- Ensure MySQL server is running
- Check database credentials in `.env` match your MySQL setup
- Verify database `trafsys` exists
- Check if port 5000 is available
- Ensure all npm packages are installed (`npm install` in backend directory)

### Frontend won't connect to backend
- Ensure backend is running on port 5000
- Check CORS is enabled in backend (it is by default)
- Verify API_BASE_URL in `frontend/src/services/api.js` points to `http://localhost:5000/api`
- Ensure all npm packages are installed (`npm install` in frontend directory)

### Database connection errors
- **Check .env file exists** in the `backend/` directory
- Verify MySQL username and password in `.env` are correct
- Check if database tables exist (run the complete schema script)
- Ensure MySQL server is accessible and running
- Verify the database name is exactly `trafsys`
- Check that all triggers, functions, and procedures are created

### "Cannot find module" errors
- Run `npm install` in the respective directory (backend or frontend)
- Delete `node_modules` folder and `package-lock.json`, then run `npm install` again

## 📝 Notes

- The backend uses connection pooling for efficient database operations
- All API responses follow a consistent format with `success` and `data` fields
- Form validation is implemented on both frontend and backend
- The application uses responsive design for mobile compatibility

## 🚦 Sample Data

To test the application, start by:
1. Adding owners
2. Adding vehicles (requires owners)
3. Reporting violations (requires vehicles and owners)
4. Processing payments (requires violations)

## 👥 Authors

This project was developed by:
- **Varun Rathod** - [github.com/ZofSpades](https://github.com/ZofSpades)
- **Vrishabh S H** - [github.com/lxgacy85](https://github.com/lxgacy85)

## 📄 License

This project is created for educational purposes.
