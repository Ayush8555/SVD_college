# SVD Degree College - Official Portal

A comprehensive, full-stack digital platform for **SVD Degree College**, integrated with a robust academic result management system. This platform serves as the central hub for institutional information, academic resources, student services, and administrative operations.

## 🎓 Project Overview

This application bridges the gap between public institutional presence and internal academic management. It provides a seamless experience for prospective students seeking admission information while offering enrolled students and administrators a secure platform for academic records and result processing.

### 🌟 Key Features

#### 🏛️ Public Institutional Portal
*   **Admissions & Inquiries:** dedicated section for prospective students to inquire about courses and admission procedures.
*   **Academic Programs:** detailed information on degree courses offered, curriculum structure, and departments.
*   **Digital Syllabus:** access to up-to-date syllabus and academic calendars.
*   **Fee Structure:** transparent breakdown of tuition and institutional fees.
*   **Campus Life:** virtual tour of facilities, events, and college culture.
*   **Notice Board:** real-time digital notices and announcements.

#### 🔐 Student Examination Portal
*   **Secure Result Access:** students can check results using Roll Number and Date of Birth verification.
*   **Digital Marksheets:** generation of detailed, printable marksheets with SGPA/CGPA calculations.
*   **Performance Tracking:** semester-wise academic history and performance analytics.
*   **Secure Authentication:** individual student login for personalized dashboard access.

#### 🛡️ Administrative Control Center
*   **Student Management:** complete CRUD operations for student records and enrollment.
*   **Result Processing:** bulk upload capabilities for examination results.
*   **Document Verification:** tools for verifying uploaded student documents.
*   **Publishing Control:** granular control to publish or withhold results.
*   **Analytics Dashboard:** statistical overview of pass percentages and department performance.

---

## 🛠️ Technology Stack

Built with a MERN architecture, ensuring scalability, performance, and maintainability.

*   **Frontend:** React 19, Vite, Tailwind CSS (Modern UI/UX), Framer Motion (Animations)
*   **Backend:** Node.js, Express.js (RESTful API Architecture)
*   **Database:** MongoDB Atlas (Cloud-native NoSQL)
*   **Security:** JWT Auth, bcrypt encryption, Helmet headers, CORS policies
*   **Tools:** Axios, React Router, Context API

---

## 🚀 Getting Started

Follow these instructions to set up the project locally for development or testing.

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB Connection String (Local or Atlas)

### Installation

1.  **Install dependencies** (Root, Backend, and Frontend):
    ```bash
    npm install
    ```

2.  **Environment Setup:**
    *   Create `.env` in `backend/` and configure:
        ```env
        PORT=5001
        MONGODB_URI=your_mongodb_connection_string
        JWT_SECRET=your_secure_secret
        ```
    *   Create `.env` in `frontend/` and configure:
        ```env
        VITE_API_URL=http://localhost:5001/api
        ```

3.  **Start the Application:**
    *   **Backend Server:**
        ```bash
        cd backend
        npm run dev
        ```
    *   **Frontend Interface:**
        ```bash
        cd frontend
        npm run dev
        ```

Access the portal at: **http://localhost:5173** (or the port shown in your terminal).

---

## 📂 Project Structure

```
college-result-system/
├── backend/            # API & Database Logic
│   ├── src/
│   │   ├── config/     # Database connections
│   │   ├── controllers/# Business logic
│   │   ├── models/     # Database schemas
│   │   └── routes/     # API Endpoints
│
└── frontend/           # User Interface
    ├── src/
    │   ├── components/ # Reusable UI blocks
    │   ├── pages/      # Route pages (Home, Result, Admin)
    │   └── context/    # State management
```

## ☁️ Deployment

*   **Backend:** Optimized for platforms like **Render**, **Railway**, or **AWS**.
*   **Frontend:** Optimized for edge deployment on **Vercel** or **Netlify**.

---

## 📄 License
This project is licensed under the **ISC License**.
