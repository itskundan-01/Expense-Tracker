# Expense Tracker Monorepo

This repository contains both the **client** (React + Vite) and **server** (Spring Boot) for the Expense Tracker application.

---

## Prerequisites
- Node.js (v18+ recommended)
- Java 17+
- Maven
- Docker (for database setup)

---

## Setup Instructions

### 1. Database (MySQL)
You can use Docker to quickly set up MySQL and phpMyAdmin:

```bash
docker-compose up -d
```
- MySQL will run on port 3306
- phpMyAdmin will be available at http://localhost:8080
- Initial schema/data is loaded from `init.sql`

---

### 2. Server (Spring Boot)

**Location:** `server/`

#### Install & Run
```bash
cd server
mvn clean install
mvn spring-boot:run
```
- The backend API will be available at `http://localhost:8081` (or as configured in `application.properties`).

---

### 3. Client (React + Vite)

**Location:** `client/`

#### Install & Run
```bash
cd client
npm install
npm run dev
```
- The frontend will be available at `http://localhost:5173` (default Vite port).

---

## Environment Variables
- **Client:** Configure API endpoints in `client/src/api/endpoints.js` if needed.
- **Server:** Set DB credentials in `server/src/main/resources/application.properties` or use the defaults from `docker-compose.yml`.

---

## Development Notes
- The `.gitignore` is set up for both client and server.
- For authentication, JWT is used (see server security config).
- State management in client uses Zustand.

---

## Folder Structure
```
Expense-Tracker/
├── client/      # React frontend
├── server/      # Spring Boot backend
├── docker-compose.yml
├── init.sql     # DB initialization
├── .gitignore
```

---

## Useful Links
- [Vite Documentation](https://vitejs.dev/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React](https://react.dev/)

---

## License
MIT
