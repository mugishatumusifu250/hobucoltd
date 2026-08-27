# HOBUCO Consulting Website - React + Node.js + MongoDB

Complete migration of the HOBUCO EJS + MySQL website to React.js frontend with Node.js/Express backend and MongoDB database.

## Architecture

```
hobuco-react-mongodb/
├── backend/                 # Express API server
│   ├── config/db.js         # MongoDB connection
│   ├── middleware/auth.js   # JWT auth & role check middleware
│   ├── models/
│   │   ├── User.js          # User model (bcrypt password hashing)
│   │   └── Consultation.js  # Consultation model
│   ├── routes/
│   │   ├── auth.js          # /api/auth/* endpoints
│   │   ├── consultations.js # /api/consultations/* endpoints
│   │   ├── users.js         # /api/users/* endpoints
│   │   └── requests.js      # /api/requests/* endpoints
│   ├── seed.js              # Database seeder
│   ├── server.js            # Express entry point
│   ├── .env                 # Environment variables
│   └── package.json
│
├── frontend/                # React (Vite) SPA
│   ├── public/              # Static assets (CSS, images, favicon)
│   │   ├── css/             # Original CSS files (unchanged)
│   │   ├── images/          # Image assets
│   │   └── favicon/         # Favicon & PWA assets
│   ├── src/
│   │   ├── api.js           # API service layer
│   │   ├── AuthContext.jsx  # Auth context provider
│   │   ├── helpers.js       # Utility functions
│   │   ├── App.jsx          # Router setup
│   │   ├── main.jsx         # Entry point
│   │   ├── pages/           # All page components
│   │   └── components/      # Reusable components
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## Prerequisites

- **Node.js** 18+
- **MongoDB** 5.0+ (running locally or Atlas connection string)
- **npm** or **yarn**

## Quick Start

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env` and update:
- `MONGODB_URI` - Your MongoDB connection string
- `EMAIL_USER` / `EMAIL_PASS` - Gmail credentials for email notifications
- `JWT_SECRET` - A secure random string
- `CLIENT_URL` - Frontend URL (default: http://localhost:5173)

### 3. Seed the Database (optional)

```bash
cd backend
node seed.js
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Dev server runs on http://localhost:5173 with proxy to backend
```

Visit **http://localhost:5173** to use the application.

### 5. Production Build

```bash
# Build frontend
cd frontend
npm run build

# Start backend (serves built frontend automatically)
cd ../backend
npm start
# Visit http://localhost:5000
```

## Features

- **Authentication**: Login, signup, forgot password, reset password with email verification
- **3 User Roles**: Admin, Manager, Client with role-based access control
- **Consultation Management**: Create, view, edit, delete consultations
- **User Management**: Admin/manager can manage all users
- **Request Management**: Approve/dismiss consultation requests with email notifications
- **Excel Export**: Export consultations and users to .xlsx files
- **Search**: Real-time search across consultations and users
- **Responsive Design**: All original CSS preserved for mobile/tablet/desktop
- **Email Notifications**: Consultation confirmations, status updates, welcome emails

## API Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | /api/auth/signup | Register new user | No | - |
| POST | /api/auth/login | Login | No | - |
| POST | /api/auth/forgot | Send reset code | No | - |
| POST | /api/auth/verify-code | Verify reset code | No | - |
| POST | /api/auth/reset-password | Reset password | No | - |
| GET | /api/auth/me | Get current user | Yes | Any |
| POST | /api/auth/logout | Logout | Yes | Any |
| GET | /api/consultations/ | List consultations | Yes | Any |
| POST | /api/consultations/ | Book consultation | No | - |
| GET | /api/consultations/:id | Get consultation | Yes | Any |
| POST | /api/consultations/update/:id | Update consultation | Yes | A/M/C |
| DELETE | /api/consultations/delete/:id | Delete consultation | Yes | A/M/C |
| GET | /api/consultations/search | Search consultations | Yes | A/M |
| GET | /api/consultations/export | Export to Excel | Yes | A/M |
| GET | /api/users/ | List users | Yes | A/M |
| GET | /api/users/:id | Get user | Yes | A/M |
| POST | /api/users/update/:id | Update user | Yes | A/M |
| DELETE | /api/users/delete/:id | Delete user | Yes | A/M |
| GET | /api/users/search | Search users | Yes | A/M |
| GET | /api/users/export/:role | Export users to Excel | Yes | A/M |
| GET | /api/requests/ | List all requests | Yes | A/M |
| POST | /api/requests/action/:id | Approve/dismiss | Yes | A/M |

## Pages

| Page | Route | Role | Description |
|------|-------|------|-------------|
| Home | / | Public | Landing page |
| About | /about | Public | About HOBUCO |
| Services | /services | Public | Services overview |
| Contact Us | /contact-us | Public | Contact form & consultation booking |
| Login | /login | Public | Login/Signup |
| Forgot Password | /forgot | Public | Password recovery |
| Verify Code | /verify-code | Public | Code verification |
| Reset Password | /reset-password | Public | Set new password |
| Dashboard | /dashboard | Admin/Manager | Overview with widgets & charts |
| Client Dashboard | /client | Client | Client's consultations |
| Requests | /requests | Admin/Manager | Approve/dismiss requests |
| Users | /admin/users | Admin/Manager | User management |
| Consultations | /consultations | Admin/Manager | Consultation management |
| Help | /help | Any | Help guide |

## Notes

- All original CSS files are preserved unchanged in `frontend/public/css/`
- The UI design, layout, and styling are 100% identical to the original EJS version
- MongoDB replaces MySQL - data models are equivalent to the original MySQL schema
- JWT tokens replace Express sessions for stateless authentication
- Email functionality uses the same Gmail SMTP configuration
