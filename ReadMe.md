# 👨‍💼 Employee Details Management System

A modern, full-stack web application for seamless employee record management, featuring robust validations, dynamic company linkage, and intuitive update workflows. Built with **React** (frontend) and **Express + MongoDB** (backend) for a smooth and scalable experience.

---

## 🚀 Key Features

- **Comprehensive CRUD:** Effortlessly add, update, view, and delete employee records  
- **Smart Employee ID:** Auto-generates unique IDs (e.g., EMP2025001)  
- **Age Validation:** Ensures employees are at least 18 years old (DOB-based)  
- **Dynamic Forms:** Conditional fields (e.g., spouse & kids shown only if "Married")  
- **Company Management:** Select from existing companies or add new ones on the fly  
- **Real-Time Validation:** Instant feedback with both client-side & server-side checks  
- **Email & Aadhaar Checks:** Strict format validation for email (Gmail) and Aadhaar  
- **Responsive UI:** Mobile-first design with flexible layouts  
- **User-Friendly Feedback:** Success popups and clear error messages  

---

## 🗂️ Project Structure

```
employee-details-project/
├── frontend/          # React App
│   ├── Components/
│   ├── Services/
│   ├── App.jsx
│   └── ...
│
├── backend/           # Express + MongoDB
│   ├── models/
│   ├── routes/
│   ├── index.js
│   └── ...
│
└── README.md
```

---

## 🛠️ Tech Stack

**Frontend:**  
- React.js  
- React Router DOM  
- Fetch API  
- CSS (Responsive, Flex/Table Views)

**Backend:**  
- Node.js  
- Express.js  
- MongoDB  
- Mongoose  

---

## ⚡ Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/siva-242006/employee-details-project.git
cd employee-details-project
```

### 2️⃣ Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

---

## ▶️ Running the Application

**Start Backend Server:**
```bash
cd backend
npm start
```

**Start Frontend React App:**
```bash
cd ../frontend
npm start
```

🌐 Open your browser at: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Sample Employee Entry

```json
{
  "name": "Robert",
  "dob": "2004-08-24",
  "maritalStatus": "Married",
  "spouseName": "Amrita",
  "noOfKids": 1,
  "fatherName": "Suresh Sharma",
  "motherName": "Georgina",
  "adhaar": "345678901234",
  "pan": "LMNOP3456Q",
  "companyName": "Innoval",
  "salary": "1000000",
  "email": "robert@gmail.com",
  "phone": "6534745324",
  "address": "America"
}
```

---

## 💡 Why Choose This Project?

- **Modern UI/UX:** Clean, intuitive, and responsive interface
- **Robust Validation:** Prevents bad data entry at every step
- **Easy Extensibility:** Modular codebase for quick feature additions
- **Production Ready:** Follows best practices for both frontend and backend

---

## 📧 Contact

Created by **Siva Siva**  
📬 Email: [sivas393922@gmail.com](mailto:sivas393922@gmail.com)  
🔗 [GitHub Profile](https://github.com/siva-242006)
