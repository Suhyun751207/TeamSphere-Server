# TeamSphere Server 🚀

> **Real-time Collaboration SaaS Dashboard Backend**  
> TypeScript + Express + MySQL + Socket.IO

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-00000F?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#️-installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 👥 **User Management** - Complete user CRUD operations
- 📊 **Profile System** - User profile management with customizable data
- 🏗️ **RESTful API** - Clean, versioned API endpoints (`/v1`)
- 🔄 **Real-time Updates** - Socket.IO integration for live collaboration
- 🛡️ **Type Safety** - Full TypeScript implementation
- 🗄️ **MySQL Integration** - Robust database operations with mysql2-wizard
- 🚀 **Hot Reload** - Development server with automatic restart
- 📝 **Input Validation** - Joi schema validation
- 🔒 **Security** - bcryptjs password hashing and CORS protection

## 🛠️ Tech Stack

**Backend Framework:** Express.js + TypeScript  
**Database:** MySQL with mysql2-wizard ORM  
**Authentication:** JWT + bcryptjs  
**Real-time:** Socket.IO  
**Validation:** Joi  
**Testing:** Jest  
**Development:** Nodemon + ts-node  

## 📋 Prerequisites

- **Node.js** v16.0.0 or higher
- **MySQL** v8.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Suhyun751207/TeamSphere.git
cd TeamSphere/server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
Create a MySQL database named `TeamSphere`:
```sql
CREATE DATABASE TeamSphere;
```

### 4. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=TeamSphere

# Server Configuration
PORT=8080
```

### 5. Start Development Server
```bash
npm run dev
```

Server will be running at `http://localhost:8080`

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host address | `localhost` |
| `DB_PORT` | MySQL port number | `3306` |
| `DB_USER` | Database username | - |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | `TeamSphere` |
| `PORT` | Server port | `8080` |

### CORS Configuration
Currently configured for:
- `localhost:3000` (React development server)
- Add your frontend URLs in `src/app/index.ts`

## 📚 API Documentation

### Base URL
```
http://localhost:8080/v1
```

### Authentication Endpoints
```http
POST /v1/auth/login     # User login
POST /v1/auth/register  # User registration
POST /v1/auth/refresh   # Token refresh
```

### User Management
```http
GET    /v1/user         # Get all users
GET    /v1/user/:id     # Get user by ID
POST   /v1/user         # Create new user
PUT    /v1/user/:id     # Update user
DELETE /v1/user/:id     # Delete user
```

### Profile Management
```http
GET    /v1/profile/:userId    # Get user profile
POST   /v1/profile/:userId    # Create profile
PUT    /v1/profile/:userId    # Update profile
DELETE /v1/profile/:userId    # Delete profile
```

## 📁 Project Structure

```
src/
├── app/                    # Application setup
│   ├── index.ts           # Main server entry point
│   ├── route.ts           # Root router
│   └── v1/                # API version 1
│       ├── route.ts       # V1 main router
│       └── user/          # User module
│           └── [userId]/  # User-specific routes
│               └── router.ts
├── interfaces/            # TypeScript interfaces
│   ├── Users.ts          # User type definitions
│   ├── Profiles.ts       # Profile type definitions
│   └── guard/            # Type guards
├── services/             # Business logic layer
│   ├── Users.ts          # User service operations
│   ├── Profiles.ts       # Profile service operations
│   └── ENUM/             # Enumeration definitions
└── utils/                # Utility functions
    └── helpers.ts        # Common helper functions
```

## 🚀 Development

### Available Scripts

```bash
# Development with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Run tests
npm test
```

### Code Style
- **TypeScript** strict mode enabled
- **ES Modules** (type: "module")
- **Async/await** for asynchronous operations
- **Interface-first** development approach

### Database Operations
Using `mysql2-wizard` for type-safe database operations:

```typescript
// Example: User service
const repo = repository<User, UserAutoSetKeys>({
  table: 'TeamSphere.users',
  keys: userKeys,
});

// Type-safe queries
const users = await repo.select();
const user = await repo.select({ id: 1 });
```

## 🌐 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure production database
- Update CORS origins for production URLs
- Set secure JWT secrets

### Docker Support (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
```

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Commit Message Convention
```
feat: add new feature
fix: bug fix
docs: documentation update
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

### Code Quality
- Write **TypeScript** with strict typing
- Add **unit tests** for new features
- Follow **RESTful** API conventions
- Document **API endpoints**

## 📄 License

This project is licensed under the **ISC License**.

## 👥 Team

**Author:** ITC Team  
**Maintainer:** [Suhyun751207](https://github.com/Suhyun751207)

---

### 🔗 Related Projects
- [TeamSphere Frontend](../client) - React.js dashboard interface
- [TeamSphere Database](../db) - Database schema and migrations

### 📞 Support
For support and questions, please open an issue on GitHub or contact the development team.

**Happy Coding! 🎉**
