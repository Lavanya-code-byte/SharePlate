# 🍽️ SharePlate – Food Waste Redistribution Platform

SharePlate is a full-stack web platform designed to reduce food waste by connecting **restaurants with surplus food** to **NGOs and delivery partners** for efficient redistribution.

The platform enables restaurants to upload excess food, NGOs to claim available listings, and delivery partners to track deliveries — creating a sustainable ecosystem that minimizes waste and supports communities.

---

## 🚀 Features

- Restaurant Portal
- NGO Dashboard
- Delivery Management
- Analytics Dashboard
- Authentication System
- Responsive Design

---

# 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JWT |
| Maps & Tracking | Maps API |

---

# 📂 Project Structure

```plaintext
SharePlate/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── README.md
├── package.json
└── package-lock.json
```

---

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone https://github.com/Lavanya-code-byte/SharePlate.git
cd SharePlate
```

---

## 2. Install Dependencies

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd ../backend
npm install
```

---

## 3. Setup Environment Variables

Create a `.env` file inside **backend/**

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

---

## 4. Run Backend Server

```bash
cd backend
npm run dev
```

Backend runs on:

```plaintext
http://localhost:5000
```

---

## 5. Run Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on:

```plaintext
http://localhost:5173
```

---

# 📊 Dashboard Overview

Total Food Saved  
Meals Delivered  
Delivery Tracking  
NGO Activity  
Restaurant Contribution  
Environmental Impact  
Food Distribution Insights  

---

# 🎯 Use Cases

- Food Waste Management
- NGO Food Coordination
- Sustainable Supply Chain
- Community Welfare
- ESG & CSR Initiatives
