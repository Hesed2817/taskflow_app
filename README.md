# **TaskFlow API - Complete Backend Solution**

## **🚀 Overview**
TaskFlow is a robust, production-ready task management API built with Node.js, Express, and MongoDB. It provides complete user authentication, project management, task tracking, and team collaboration features.

## **✨ Features**

### **🔐 Authentication & Security**
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Protected routes with middleware
- Session-based authentication for web views
- Rate limiting and security headers

### **📊 Project Management**
- Create, read, update, and delete projects
- Project ownership and member management
- Team collaboration with member invitations
- Project categorization and organization

### **✅ Task Management**
- Full CRUD operations for tasks
- Task status tracking (todo, in-progress, done)
- Priority levels (low, medium, high)
- Task assignment to team members
- Due date tracking with validation

### **👥 Team Collaboration**
- Add/remove team members from projects
- User search functionality
- Task assignment and reassignment
- Role-based permissions (owner vs member)

### **🔍 Advanced Features**
- Task filtering by status, priority, and assignee
- Global task search across all projects
- Input validation with express-validator
- Comprehensive error handling
- Pagination and query limits

## **🛠️ Tech Stack**

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens), bcrypt
- **Validation:** express-validator
- **Security:** helmet, express-rate-limit
- **Templating:** EJS (for optional frontend views)
- **Development:** Nodemon, dotenv

## **📁 Project Structure**

```
taskflow-backend/
├── config/          # Database configuration
├── controllers/     # Business logic
├── middleware/      # Auth, validation, error handling
├── models/         # MongoDB schemas (User, Project, Task)
├── routes/         # API endpoints
├── utils/          # Helpers and validators
├── views/          # EJS templates (optional)
├── public/         # Static files
├── .env            # Environment variables
├── .env.example    # Environment template
├── package.json    # Dependencies
└── server.js       # Application entry point
```

## **🚀 Getting Started**

### **Prerequisites**
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/taskflow-backend.git
cd taskflow-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the development server**
```bash
npm run dev
```

### **Environment Variables**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
SESSION_SECRET=your_session_secret
```

## **📚 API Documentation**

### **Authentication**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### **Projects**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get user's projects |
| POST | `/api/projects` | Create new project |
| GET | `/api/projects/:id` | Get single project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### **Project Members**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/:id/members` | Add member to project |
| DELETE | `/api/projects/:id/members/:userId` | Remove member from project |
| GET | `/api/projects/:id/members` | Get project members |

### **Tasks**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:projectId/tasks` | Get project tasks |
| POST | `/api/projects/:projectId/tasks` | Create task in project |
| GET | `/api/tasks/:id` | Get single task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### **Task Filtering**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all user's tasks (filterable) |
| GET | `/api/projects/:id/tasks?status=todo` | Filter project tasks |

### **Users**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/search?email=...` | Search users by email/username |
| GET | `/api/users/me` | Get current user |

## **🧪 Testing with Postman**

### **Quick Test Flow:**
1. Register a new user (`POST /api/auth/register`)
2. Login to get JWT token (`POST /api/auth/login`)
3. Create a project (`POST /api/projects`)
4. Add tasks to the project (`POST /api/projects/:id/tasks`)
5. Invite team members (`POST /api/projects/:id/members`)
6. Assign tasks to members (`PUT /api/tasks/:id/assign`)

## **🔒 Security Features**

- **Input Validation:** All user inputs validated with express-validator
- **Authentication:** JWT tokens with expiration
- **Authorization:** Role-based access control
- **Rate Limiting:** Prevents brute force attacks
- **SQL Injection Protection:** Input sanitization and escaping
- **Password Security:** bcrypt hashing with salt rounds
- **HTTP Headers:** Security headers with helmet

## **📈 Development Progress**

### **Completed Phases:**
✅ **Phase 1:** Authentication & User Management  
✅ **Phase 2:** Core Data Models & Relationships  
✅ **Phase 3:** Team Collaboration & Advanced Features  
✅ **Phase 4:** Production Readiness & Security  

## **🎯 Future Enhancements**

- [ ] Real-time updates with Socket.io
- [ ] File uploads for task attachments
- [ ] Email notifications
- [ ] Advanced reporting and analytics
- [ ] Mobile application
- [ ] OAuth integration (Google, GitHub)

## **🤝 Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## **📄 License**

This project is licensed under the MIT License - see the LICENSE file for details.

## **🙏 Acknowledgments**

- Express.js team for the amazing framework
- MongoDB for the flexible database solution
- The Node.js community for endless packages and support

## **📞 Contact**

Your Name - [@ZaithwaN](https://twitter.com/ZaithwaN) - nyirendazaithwa@gmail.com

Project Link: [https://github.com/yourusername/taskflow-backend](https://github.com/yourusername/taskflow-backend)

---

**Built with ❤️ by [Hesed]**
