# 🏢 Employee Management System (EMS Pro)

Professional Employee Management System built with Node.js, Express, EJS, MySQL & Bootstrap 5.

---

## ✅ Features
- 📊 Dashboard with stats & department chart
- 👥 Employee list with search & filter
- ➕ Add new employee
- ✏️ Edit employee details
- 👁️ View employee profile
- 🗑️ Delete employee
- 🔄 Toggle active/inactive status
- 📱 Responsive design
- 🎨 Professional dark sidebar UI

---

## 🚀 Setup Instructions (Step by Step)

### Step 1 — Node.js aur MySQL install hona chahiye
- Node.js: https://nodejs.org (v16+)
- MySQL: https://dev.mysql.com/downloads/

### Step 2 — Dependencies install karo
```bash
npm install
```

### Step 3 — Database setup karo
MySQL Workbench ya terminal mein:
```bash
# Option A - Terminal se
mysql -u root -p < database.sql

# Option B - MySQL Workbench mein
# database.sql file open karo aur run karo
```

### Step 4 — .env file configure karo
`.env` file open karo aur apna MySQL password daalo:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password_here
DB_NAME=employee_db
PORT=3000
```

### Step 5 — Server start karo
```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm start
```

### Step 6 — Browser mein open karo
```
http://localhost:3000
```

---

## 📁 Project Structure
```
employee-management/
├── config/db.js          → MySQL connection
├── controllers/          → Business logic
├── routes/               → URL routes
├── views/                → EJS templates
│   ├── partials/         → Sidebar, Topbar
│   ├── employees/        → List, Add, Edit, View
│   └── dashboard.ejs
├── public/
│   ├── css/style.css     → All styles
│   └── js/app.js         → Frontend JS
├── .env                  → Config (DB password yahan daalo)
├── app.js                → Main server
└── database.sql          → DB setup file
```

---

## 🛠️ Tech Stack
- **Backend**: Node.js + Express.js
- **Template**: EJS
- **Database**: MySQL
- **Frontend**: Bootstrap 5 + Custom CSS
- **Icons**: Font Awesome 6
- **Charts**: Chart.js

---

## ❓ Common Issues

**"Cannot connect to database"**
→ `.env` file mein DB_PASS check karo

**"Table doesn't exist"**
→ `database.sql` run karo pehle

**Port already in use**
→ `.env` mein PORT=3001 kar do
