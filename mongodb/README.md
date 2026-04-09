# User Management System — MongoDB + Node.js

**Fr. Conceicao Rodrigues College of Engineering**  
Father Agnel Ashram, Bandstand, Bandra-West, Mumbai-50  
**Department of Computer Engineering**

---

## 📁 Project Structure

```
mongodb/
├── config/
│   └── db.js               # MongoDB connection (Mongoose)
├── controllers/
│   └── userController.js   # CRUD + search logic
├── models/
│   └── User.js             # Mongoose schema + all indexes
├── routes/
│   └── userRoutes.js       # Express route definitions
├── scripts/
│   └── seed.js             # Database seeder
├── .env                    # Environment variables (MongoDB URI)
├── .gitignore
├── index-test.js           # Index testing with explain()
├── package.json
└── server.js               # Express app entry point
```

---

## ⚙️ Setup & Running

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port 27017)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Edit `.env` if needed (default is `mongodb://localhost:27017/user_management`):
```
MONGO_URI=mongodb://localhost:27017/user_management
PORT=5000
```

### 3. Start the server
```bash
npm run dev       # Development (nodemon — auto restarts)
npm start         # Production
```

### 4. Seed sample data
```bash
npm run seed
```

### 5. Run index tests
```bash
npm run index-test
```

---

## 📋 Mongoose Schema & Validations

| Field       | Type           | Validation                          |
|-------------|----------------|-------------------------------------|
| `name`      | String         | Required, min 3 chars               |
| `email`     | String         | Required, unique, valid email format |
| `age`       | Number         | min 0, max 120                      |
| `hobbies`   | [String]       | Array of strings                    |
| `bio`       | String         | For text search                     |
| `userId`    | String         | Required, unique                    |
| `createdAt` | Date           | Default: now (used for TTL index)   |

---

## 🗂️ MongoDB Indexes Implemented

| # | Type         | Field(s)         | Notes                              |
|---|--------------|------------------|------------------------------------|
| 1 | Single-field | `name`           | Speeds up name searches            |
| 2 | Compound     | `email` + `age`  | Covers compound filter queries     |
| 3 | Multikey     | `hobbies`        | Array field — MongoDB auto multikey |
| 4 | Text         | `bio`            | Enables `$text` search             |
| 5 | Hashed       | `userId`         | Used for equality lookups          |
| 6 | TTL          | `createdAt`      | Docs expire after 1 year           |

---

## 🔗 API Endpoints

### Base URL: `http://localhost:5000`

### CRUD Operations

| Method | Endpoint           | Description             |
|--------|--------------------|-------------------------|
| POST   | `/api/users`       | Create a new user       |
| GET    | `/api/users`       | Get all users           |
| GET    | `/api/users/:id`   | Get user by ID          |
| PUT    | `/api/users/:id`   | Update user by ID       |
| DELETE | `/api/users/:id`   | Delete user by ID       |

### Search & Filter

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | `/api/users?name=Alice`         | Search by name           |
| GET    | `/api/users?email=a@b.com`      | Filter by email          |
| GET    | `/api/users?age=25`             | Filter by exact age      |
| GET    | `/api/users?minAge=20&maxAge=30`| Filter age range         |
| GET    | `/api/users?hobby=reading`      | Filter by hobby          |
| GET    | `/api/users?search=MongoDB`     | Text search on bio       |
| GET    | `/api/users/search/text?q=Node` | Dedicated text search    |

---

## 📬 Postman Testing Guide

### 1. POST — Create User
```
POST http://localhost:5000/api/users
Content-Type: application/json

{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "age": 22,
  "hobbies": ["reading", "cycling"],
  "bio": "Alice loves MongoDB and open source",
  "userId": "uid-001"
}
```

### 2. GET — All Users
```
GET http://localhost:5000/api/users
```

### 3. GET — Search by Name
```
GET http://localhost:5000/api/users?name=Alice
```

### 4. GET — Filter by Email + Age
```
GET http://localhost:5000/api/users?email=alice@example.com&age=22
```

### 5. GET — Filter by Hobby
```
GET http://localhost:5000/api/users?hobby=reading
```

### 6. GET — Text Search on Bio
```
GET http://localhost:5000/api/users/search/text?q=MongoDB
```

### 7. PUT — Update User
```
PUT http://localhost:5000/api/users/<_id>
Content-Type: application/json

{
  "age": 23,
  "bio": "Updated bio text"
}
```

### 8. DELETE — Delete User
```
DELETE http://localhost:5000/api/users/<_id>
```

---

## 🧪 Index Test Output Sample

Run `npm run index-test` to see output like:
```
════════════════════════════════════════════════════════════
  TEST: Single-field index on name
════════════════════════════════════════════════════════════
  Index Used        : idx_name_single
  Stage             : FETCH
  Keys Examined     : 1
  Documents Examined: 1
  Documents Returned: 1
  Execution Time    : 0 ms
────────────────────────────────────────────────────────────
```
