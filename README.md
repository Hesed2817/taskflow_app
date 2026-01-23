# **TaskFlow - Professional Project Management**

## **🚀 Overview**
TaskFlow is a robust, production-ready task management solution built with Node.js, Express, and EJS. It is designed to streamline team collaboration, providing intuitive tools for tracking projects, managing tasks, and monitoring progress.

**Key Goals:**
- Simplify project organization.
- Enhance team collaboration and accountability.
- Provide a visually engaging and responsive user experience.

---

## **✨ Key Features**

### **🎨 Modern UI/UX**
- **Dark/Light Mode:** Seamless theme switching with persistent user preference.
- **Responsive Design:** Fully optimized for desktop, tablet, and mobile devices.
- **Dynamic Animations:** Engaging UI elements for a premium feel.
- **Password Visibility Toggle:** Built-in eye icon to securely preview passwords before submission.
- **Enhanced Form Validation:** Real-time frontend alerts for invalid inputs (e.g., weak passwords, non-existent users).
- **Custom Error Pages:** Friendly 404 and "Work in Progress" pages.

### **📊 Smart Project Management**
- **Intelligent Status Tracking:** 
    - Projects automatically track their status based on deadlines.
    - **"Completed" Override:** Projects are marked as "Completed" (Green) immediately when all tasks are done, regardless of the due date.
- **Visual Timelines:** Clear start and end dates with calculated duration and remaining time.
- **Task Statistics:** Real-time visibility into total vs. completed tasks directly on the project card.

### **✅ Comprehensive Task System**
- **Granular Control:** Create, read, update, and delete tasks with ease.
- **Priority Levels:** Assign Low, Medium, or High priority to tasks.
- **Status Workflows:** Move tasks through To Do, In Progress, and Done stages.
- **Quick Updates:** Modal-based quick editing for rapid status changes.

### **🔐 Security & Authentication**
- **Secure Access:** JWT-based authentication with cookie management.
- **Password Protection:** Robust hashing using bcrypt.
- **Session Handling:** Secure session management for authenticated users.
- **Password Recovery:** Integrated "Forgot Password" flow with secure email links via SendGrid.
- **Access/Refresh Tokens:** Dual-token system for enhanced security and session persistence.

---

## **🛠️ Technology Stack**

- **Backend:** Node.js, Express.js (v5+)
- **Database:** MongoDB, Mongoose ODM
- **Frontend:** EJS Templating, Vanilla CSS (Variables-based theming), Vanilla JavaScript
- **Auth:** JWT (JSON Web Tokens), bcrypt, cookie-parser, express-session
- **Utilities:** SendGrid (@sendgrid/mail), Nodemailer, express-validator, Dotenv

---

## **🚀 Getting Started**

Follow these instructions to get a copy of the project up and running on your local machine.

### **Prerequisites**
- **Node.js** (v14 or higher)
- **MongoDB** (Local instance or Atlas connection)
- **Git**

### **Installation**

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Hesed2817/taskflow_app.git
    cd taskflow
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory. You can copy the example file:
    ```bash
    cp .env.example .env
    ```
    
    Then open `.env` and fill in your details:
    ```env
    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/taskflow
    
    # Session & JWT
    SESSION_SECRET=your_super_secret_session_key
    JWT_ACCESS_SECRET=your_super_secret_access_key
    JWT_ACCESS_EXPIRE=30d
    JWT_REFRESH_SECRET=your_super_secret_refresh_key
    
    # SMTP Configuration
    SMTP_HOST=smtp.sendgrid.net
    SMTP_PORT=587
    SMTP_EMAIL=apikey
    SMTP_PASSWORD=your_sendgrid_api_key
    
    # Sender Information
    FROM_EMAIL=your_email@example.com
    FROM_NAME=TaskFlow
    ```

4.  **Run the Application**
    
    **Development Mode (with Nodemon):**
    ```bash
    npm run dev
    ```
    
    **Production Mode:**
    ```bash
    npm start
    ```

5.  **Access the App**
    Open your browser and navigate to `http://localhost:3000`.

---

## **📂 Project Structure**

```
taskflow/
├── config/          # Database connection
├── controllers/     # Route logic and request handling
├── middleware/      # Auth protection and error handling
├── models/          # Mongoose schemas (User, Project, Task)
├── public/          # Static assets (CSS, JS, Images)
├── routes/          # API and Page routes
├── utils/           # Helper functions
├── views/           # EJS templates
│   ├── auth/        # Login, Register, Forgot Password
│   ├── layouts/     # Main layout shell
│   ├── partials/    # Reusable components
│   ├── projects/    # Project list, detail, and edit views
│   └── 404.ejs      # Custom error page
├── .env.example     # Environment variable template
├── server.js        # App entry point
└── package.json     # Dependencies and scripts
```

---

## **🧪 API Endpoints**

While mostly a server-side rendered app, TaskFlow exposes internal APIs for dynamic interactions.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate user |
| `POST` | `/api/auth/forgot-password` | Request password reset email |
| `PUT` | `/api/auth/reset-password/:token` | Reset password using token |
| `GET` | `/api/projects` | Fetch all projects |
| `POST` | `/api/projects` | Create a new project |
| `PUT` | `/api/projects/:id` | Update project details |
| `GET` | `/api/tasks` | Fetch tasks |
| `PUT` | `/api/tasks/:id` | Update task status/priority |

---

## **🤝 Contributing**

Contributions are always welcome!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## **📄 License**

This project is licensed under the MIT License.

---

**Built with ❤️ by Hesed**
