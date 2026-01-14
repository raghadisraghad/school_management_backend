# School Communication & Clubs Management System - Backend

This is the **backend API** for a school communication platform where students, offices/clubs, and admins interact through a structured approval workflow.

---

## 🚀 Quick Start

1. **Clone the repo:**
   ```bash
   git clone https://github.com/raghadisraghad/school_management_backend.git
   cd school_management_backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB and JWT settings
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```
   Server runs at `http://localhost:3000`

---

## 🎯 Core Workflows

### 👥 User Roles
- **Students**: Browse content, request to join offices
- **Office Presidents**: Create content (needs admin approval), approve member requests
- **Admins**: Approve everything (office creation, content, etc.)

### 🔄 Approval Flow
1. **Office Creation**: Student requests → Admin approves → Office created
2. **Content Publishing**: President creates → Admin approves → Published
3. **Membership**: Student requests → President approves → Member added

---

## ⚙️ Tech Stack
- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication
- Role-based access control
- AWS S3 buckets

---

## 📦 Optional: Docker Setup
```bash
docker compose up --build
```

---
