# College Result Management System

A complete, production-ready college website with a secure examination result system built for Indian universities.

## 🎓 Overview

Government Engineering College (GEC) Pune Result Management System is a full-stack web application designed to manage student examination results following authentic Indian university workflows. The system provides secure result checking for students and comprehensive administrative controls for managing students, courses, and results.

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Express Validator** for input validation
- **Helmet** & **CORS** for security

## ✨ Features

### Public Features
- 🏠 College information and department details
- 📊 Public result checking (Roll Number + DOB verification)
- 📱 Responsive design for all devices
- 🖨️ Printable result marksheets

### Student Portal
- 🔐 Secure login with JWT authentication
- 📈 View semester-wise results
- 📄 Detailed marksheet with SGPA/CGPA
- 🎯 Grade-wise performance tracking

### Admin Portal
- 👥 Student management (CRUD operations)
- 📝 Result upload and management
- 📊 Dashboard with statistics
- 🔍 Search and filter capabilities
- ✅ Publish/unpublish results

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
cd /Users/ayushtiwari/Desktop/SVD/college-result-system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your MongoDB connection string
nano .env

# Seed the database with sample data
npm run seed

# Start the backend server
npm run dev
```

Backend will run on: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (already done)
npm install

# Start the frontend development server
npm run dev
```

Frontend will run on: `http://localhost:5173`


## 📁 Project Structure

```
college-result-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth & error handling
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Seed script & utilities
│   │   └── server.js        # Express app entry
│   ├── .env                 # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── context/         # Auth context
    │   ├── pages/           # Page components
    │   ├── utils/           # API utilities
    │   ├── App.jsx          # Main app component
    │   ├── main.jsx         # Entry point
    │   └── index.css        # Global styles
    ├── .env                 # Frontend env variables
    └── package.json
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/change-password` - Change password

### Students (Admin Only)
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/stats/overview` - Get statistics

### Results
- `POST /api/results/check` - Check result (Public)
- `GET /api/results` - Get all results (Admin)
- `POST /api/results` - Create result (Admin)
- `PUT /api/results/:id` - Update result (Admin)
- `DELETE /api/results/:id` - Delete result (Admin)
- `PATCH /api/results/:id/publish` - Toggle publish status (Admin)

## 🎨 Design Features

- **Professional UI** with Indian university aesthetics
- **Tailwind CSS** custom color palette
- **Responsive design** for mobile, tablet, and desktop
- **Print-friendly** result marksheets
- **Loading states** and error handling
- **Toast notifications** for user feedback

## 📊 Database Schema

### User
- Email, password (hashed)
- Role (admin/student)
- Student reference
- Last login tracking

### Student
- Roll number (GEC2023001 format)
- Personal details (name, DOB, gender)
- Academic info (department, semester, batch)
- Contact details
- Guardian information

### Course
- Course code (CS301 format)
- Course name and credits
- Department and semester
- Marks distribution (internal/external)

### Result
- Student reference
- Semester and academic year
- Subject-wise marks and grades
- SGPA/CGPA calculation
- Result status (Pass/Fail/ATKT)
- Published status

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- Rate limiting on API endpoints
- Helmet.js security headers
- CORS configuration

## 🧪 Testing

### Test the Backend
```bash
cd backend

# Check server health
curl http://localhost:5000/api/health

# Test result checking
curl -X POST http://localhost:5000/api/results/check \
  -H "Content-Type: application/json" \
  -d '{"rollNumber":"GEC2023001","dateOfBirth":"2005-03-15"}'
```

### Test the Frontend
1. Open browser: `http://localhost:5173`
2. Navigate through public pages
3. Check result with demo credentials
4. Login as admin/student
5. Test dashboard features

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/college_results
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@gec-pune.edu.in
ADMIN_PASSWORD=Admin@123
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Government Engineering College, Pune
```

## 🚀 Deployment

### Backend Deployment (Render/Railway/Heroku)
1. Set environment variables
2. Update MONGODB_URI to MongoDB Atlas
3. Deploy from Git repository

### Frontend Deployment (Vercel/Netlify)
1. Build: `npm run build`
2. Set VITE_API_URL to production backend URL
3. Deploy dist folder

## 📚 Sample Data

The seed script creates:
- 1 Admin user
- 5 Students (Computer Engineering, Semester 3)
- 6 Courses (CS301-CS305, MA301)
- 5 Results with realistic marks and grades

## 🤝 Contributing

This is a production-ready template for Indian colleges. Feel free to customize:
- College name and branding
- Department names
- Grading system
- Result format
- Additional features

## 📄 License

ISC License - Free to use for educational institutions

## 👨‍💻 Author

Built by a senior full-stack engineer specializing in Indian university systems.

## 🆘 Support

For issues or questions:
- Check the API documentation
- Review the code comments
- Test with demo credentials
- Verify MongoDB connection

---

**Note:** This system follows authentic Indian university workflows including:
- Roll number format (GEC2023001)
- SGPA/CGPA calculation
- Internal/External marks split (30/70)
- Grade system (O/A+/A/B+/B/C/D/F)
- ATKT (Allowed To Keep Terms) system
- Semester-wise result declaration
