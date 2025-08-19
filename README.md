# TeamSphere Server

TeamSphere Backend Server - Real-time Collaboration SaaS Dashboard

## 🚀 Features

- Real-time collaboration dashboard
- User authentication and management
- RESTful API endpoints
- TypeScript implementation
- MySQL database integration

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL database
- npm or yarn

## 🛠️ Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd server
```

2. Install dependencies
```bash
npm install
```

3. Environment Setup
```bash
cp .env.example .env
```
Edit `.env` file with your database credentials:
- DB_HOST: Your database host
- DB_PORT: Your database port
- DB_USER: Your database username
- DB_PASSWORD: Your database password
- DB_NAME: Your database name
- PORT: Server port (default: 8080)

4. Start the development server
```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── app/           # Application setup and routing
├── interfaces/    # TypeScript interfaces
├── services/      # Business logic services
└── utils/         # Utility functions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

ISC License
