# 💇‍♀️ LUME Salon – Frontend Application

![Cover_Image](cover/salonthumbnail.png)

## 📌 Overview

**LUME Salon** is a modern **microservices-based salon appointment system** designed to provide a seamless experience for customers to browse services, book appointments, and make payments online.

This repository contains the **Frontend Web Application** built using **Next.js**, which communicates with multiple backend microservices through an API Gateway.

---

## 🏗️ System Architecture

The system follows a **microservices architecture**, consisting of:

* 🔐 **User Auth Service** – Handles authentication, authorization, and user management
* 💅 **Salon Catalog Service** – Manages available salon services
* 📅 **Booking Service** – Handles appointment reservations
* 💳 **Payment Service** – Processes payments
* 🌐 **API Gateway** – Central entry point for all frontend requests

---

## 🚀 Features

### 👤 Authentication

* User registration and login
* JWT-based authentication (stored in HTTP-only cookies)
* Role-based access control (Customer, Admin, Staff)

### 💅 Service Browsing

* View all available salon services
* Service details including price, category, and duration

### 📅 Appointment Booking

* Book appointments for selected services
* Real-time interaction with Booking Service

### 💳 Payment Integration

* Secure payment before confirming booking
* Payment Service integration

### 👤 Customer Profile

* View profile details
* Update personal information
* Password reset functionality

---

## 🔄 Application Flow

```text
User → Register/Login
     → Browse Services
     → Select Service
     → Book Appointment
     → Make Payment
     → Booking Confirmed
```

---

## ⚙️ Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion
* **HTTP Client:** Axios
* **Icons:** Lucide React

---

## 🔐 Authentication Flow

* JWT tokens are issued by the **User Auth Service**
* Stored in **HTTP-only cookies**
* Automatically sent with requests via:

```ts
withCredentials: true
```

* Backend services validate tokens using middleware

---

## 🌐 API Integration

All API requests are routed through the **API Gateway**:

```env
NEXT_PUBLIC_API_BASE_URL=http://<ALB_URL>/api
```

Example endpoints:

* `/auth/login`
* `/services`
* `/bookings`
* `/payments`
* `/customer/profile`

---

## 📁 Project Structure

```bash
frontend/
│── app/
│── components/
│── lib/
│   └── axios.ts
│── context/
│── styles/
│── public/
│── package.json
```

---

## 🛠️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd frontend
```

### 2️⃣ Install Dependencies

```bash
pnpm install
```

### 3️⃣ Setup Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://<ALB_URL>/api
```

### 4️⃣ Run Development Server

```bash
pnpm dev
```

---

## 🐳 Docker Deployment

Build Docker image:

```bash
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=http://<ALB_URL>/api -t lume-frontend .
```

Run container:

```bash
docker run -p 3000:3000 lume-frontend
```

---

## ☁️ Deployment

* Hosted on **AWS ECS (Elastic Container Service)**
* Uses **Application Load Balancer (ALB)**
* CI/CD via **GitHub Actions**

---

## 🔒 Security

* JWT-based authentication
* HTTP-only cookies
* Role-based authorization
* Protected backend endpoints

---

## 📌 Future Improvements

* 📊 Admin dashboard analytics
* 📅 Advanced booking scheduling
* 💳 Multiple payment gateways
* 📱 Mobile responsive enhancements

---

## 👨‍💻 Contributors

* LUME Salon Development Team

---

## 📄 License

This project is developed for academic and research purposes.
