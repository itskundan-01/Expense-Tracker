# Expense Tracker

A full-stack expense tracking application built with Spring Boot and React.

## 🏗️ Current Status

✅ **Backend (Spring Boot):**
- REST API with JWT authentication
- H2 database (persistent file-based)
- CRUD operations for transactions, categories, accounts
- Docker containerization ready

✅ **Frontend (React + Vite):**
- Modern UI with Tailwind CSS
- Authentication system
- Dashboard with expense tracking
- Environment-based API configuration

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Maven

### Backend
```bash
cd server
mvn spring-boot:run
```
Server runs on: http://localhost:8080

### Frontend
```bash
cd client
npm install
npm run dev
```
Client runs on: http://localhost:5174

### Using Docker (Backend)
```bash
cd server
docker build -t expense-tracker-backend .
docker run -p 8080:8080 expense-tracker-backend
```

## 📝 Demo Credentials
- Email: demo@example.com
- Password: password123

## 🔧 Environment Configuration

Copy `client/.env.example` to `client/.env.local` and update API URL if needed.

## 📚 Tech Stack
- **Backend:** Spring Boot 3, Spring Security, JPA/Hibernate, H2 Database
- **Frontend:** React, Vite, Tailwind CSS, Zustand
- **Deployment:** Docker ready

## 📁 Project Structure
```
Expense-Tracker/
├── client/          # React frontend
├── server/          # Spring Boot backend
├── docker-compose.yml
└── init.sql         # MySQL initialization (optional)
```

---
*Note: This is a development-ready setup. Production deployment will be configured step by step.*
