# 🍽️ FoodieXpress – QR-Based Restaurant Ordering System

## 📌 Project Overview

FoodieXpress is a full-stack web application that digitizes the restaurant dining experience using a QR code-based ordering system. Customers can scan a QR code placed on their table, browse the restaurant's digital menu, add food items to their cart, and place orders directly from their mobile devices without waiting for a waiter.

The system supports three user roles:

- 👤 Customer
- 👨‍🍳 Waiter
- 👨‍💼 Admin

Each role has a dedicated dashboard with features designed to improve restaurant efficiency and enhance the customer experience.

---

# 🚀 Features

## 👤 Customer Module

- OTP-based Login
- QR Code Restaurant Access
- Browse Restaurants
- Digital Menu
- Search & Filter Menu Items
- Add to Cart
- Place Order
- View Order History
- Live Order Status Tracking

---

## 👨‍🍳 Waiter Module

- Secure Waiter Login
- Restaurant-specific Dashboard
- View Incoming Orders
- Update Order Status
- Track Pending, Preparing, Ready and Delivered Orders

---

## 👨‍💼 Admin Module

- Secure Admin Login
- Dashboard Overview
- Restaurant Management
- Menu Management
- Order Monitoring
- Revenue & Analytics

---

# 🛠️ Technology Stack

## Frontend

- React.js
- React Router
- Bootstrap
- HTML5
- CSS3
- JavaScript (ES6)

## Backend

- Python
- Flask
- Flask SQLAlchemy
- Flask JWT Extended
- Flask CORS

## Database

- SQLite

## Authentication

- JWT Authentication
- OTP Verification (Twilio)

---

# 📂 Project Structure

```
FoodieXpress
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
├── backend
│   ├── models
│   ├── routes
│   ├── app.py
│   ├── config.py
│   
│
└── README.md
```

---

# 🏗️ System Architecture

                     🍽️ FOODIEXPRESS
            QR-Based Restaurant Ordering System

 ┌────────────┐   ┌────────────┐   ┌────────────┐
 │ Customer   │   │  Waiter    │   │   Admin    │
 └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
          ┌─────────────────────────────┐
          │     React Frontend          │
          │-----------------------------│
          │ • Login                     │
          │ • Restaurant List           │
          │ • QR Scanner                │
          │ • Menu                      │
          │ • Cart                      │
          │ • My Orders                 │
          │ • Waiter Dashboard          │
          │ • Admin Dashboard           │
          └──────────────┬──────────────┘
                         │
                  REST API Calls
                         │
                         ▼
          ┌─────────────────────────────┐
          │       Flask Backend         │
          │-----------------------------│
          │ • Authentication Module     │
          │ • Restaurant Module         │
          │ • Menu Module               │
          │ • Order Module              │
          │ • Admin Module              │
          └──────────────┬──────────────┘
                         │
                  SQLAlchemy ORM
                         │
                         ▼
          ┌─────────────────────────────┐
          │      SQLite Database        │
          │-----------------------------│
          │ • Users                     │
          │ • Restaurants               │
          │ • Menu Items                │
          │ • Orders                    │
          │ • Order Items               │
          └─────────────────────────────┘
---

# 🔄 Application Workflow

### Customer Workflow

1. Login using OTP
2. Scan Restaurant QR Code
3. Browse Restaurant Menu
4. Add Items to Cart
5. Place Order
6. View Live Order Status

### Waiter Workflow

1. Login
2. View Incoming Orders
3. Update Order Status
4. Mark Order as Delivered

### Admin Workflow

1. Login
2. Manage Restaurants
3. Manage Menu
4. Monitor Orders
5. View Analytics

---

# ⚙️ Installation & Setup

## Clone Repository

```bash
git clone https://github.com/Keerrthana-M/Restaurant-Ordering-and-Billing-System.git
```

---

## Backend Setup

```bash
cd backend

python -m venv venv
```

### Activate Virtual Environment

**Windows**

```bash
venv\Scripts\activate
```

Install Dependencies

```bash
pip install -r requirements.txt
```

Run Backend

```bash
python app.py
```

Backend Server

```
http://localhost:5000
```

---

## Frontend Setup

Open another terminal

```bash
cd frontend

npm install

npm start
```

Frontend Server

```
http://localhost:3000
```

---

# 🔐 Environment Variables

Create a `.env` file inside the backend folder.

```
SECRET_KEY=your_secret_key

JWT_SECRET_KEY=your_jwt_secret_key

TWILIO_ACCOUNT_SID=your_account_sid

TWILIO_AUTH_TOKEN=your_auth_token

TWILIO_PHONE_NUMBER=your_twilio_phone
```

---

# 📊 Database

The application uses SQLite with SQLAlchemy ORM.

Main Tables

- Users
- Restaurants
- Menu Items
- Orders
- Order Items

---

# 🌟 Key Features

- QR Code Based Ordering
- OTP Authentication
- Role Based Access Control
- Digital Menu
- Shopping Cart
- Live Order Tracking
- Waiter Dashboard
- Admin Dashboard
- Restaurant Management
- Menu Management
- Analytics Dashboard
- Responsive User Interface

---

# 🔮 Future Enhancements

- Online Payment Integration
- AI Food Recommendation
- Customer Reviews & Ratings
- Inventory Management
- Table Reservation
- Push Notifications
- Cloud Deployment

---

# 👨‍💻 Team Members

- Keerrthana M
- V Madhumitha 
- Keerthana S

---

# 📄 License

This project is developed for educational purposes as part of a Full Stack Development Project.
