# TeamSphere Server 🚀

> **Real-time Team Collaboration & Task Management SaaS Platform**  
> TypeScript + Express + MySQL + MongoDB + Socket.IO + Redis

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-00000F?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#️-installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔐 **Authentication & Authorization**
- JWT 기반 인증 시스템 (회원가입, 로그인, 로그아웃)
- 토큰 검증 및 자동 갱신
- 쿠키 기반 토큰 관리 (`accesstoken` 쿠키)
- bcryptjs 패스워드 해싱
- 역할 기반 접근 제어 (Admin, Manager, Member, Viewer)
- 비밀번호 변경 기능
- 보안 미들웨어 (CORS, Helmet 등)

### 👥 **사용자 관리**
- 사용자 프로필 관리 (이름, 나이, 성별, 전화번호, 프로필 이미지)
- 구독 상태 관리 (Free, Premium)
- 사용자별 워크스페이스 접근 권한 관리
- 출석 관리 시스템
- 사용자 활동 로그 추적

### 🏢 **워크스페이스 관리**
- 워크스페이스 생성, 조회, 수정, 삭제
- 멤버 초대 및 역할 관리 (Admin, Manager, Member, Viewer)
- 워크스페이스별 권한 기반 접근 제어
- 워크스페이스 멤버 목록 조회 및 관리
- 워크스페이스 대시보드 데이터 제공
- 워크스페이스별 활동 로그

### 👥 **팀 관리**
- 워크스페이스 내 팀 생성, 조회, 수정, 삭제
- 팀 멤버 추가/제거
- 팀별 역할 및 권한 관리 (Leader, Member)
- 팀 상세 정보 및 멤버 목록 조회
- 팀별 작업 할당 및 관리
- 팀별 통계 및 분석 데이터 제공

### ✅ **하이브리드 작업 관리**
- **MySQL 기반**: 기본 작업 정보 (상태, 우선순위, 할당자, 마감일)
- **MongoDB 기반**: 상세 작업 정보 (제목, 내용, 태그, 첨부파일)
- **댓글 시스템**: 대댓글, 멘션, 편집 이력 지원
- **작업 상태**: TODO, IN_PROGRESS, DONE, CANCELLED
- **우선순위**: LOW, MEDIUM, HIGH, URGENT
- 작업 필터링 및 검색 기능
- 작업별 진행률 추적

### 💬 **실시간 메시징 시스템**
- **Socket.IO 기반 실시간 통신**
- **다중 채팅방**: DM, 팀 채팅, 워크스페이스 채팅
- **메시지 기능**: 텍스트, 이미지, 파일 메시지 지원
- **고급 기능**: 메시지 수정/삭제, 편집 이력, 실시간 알림
- **자동 정렬**: 마지막 메시지 시간 기준 채팅방 정렬
- **온라인 상태**: 실시간 사용자 온라인 상태 표시
- **타이핑 상태**: 실시간 타이핑 알림
- **채팅방 멤버 관리**: 추가/제거/권한 관리

### 📊 **대시보드 & 분석**
- 개인 대시보드 (참여 워크스페이스, 최근 활동, 출석 현황)
- 워크스페이스 대시보드 (팀 현황, 멤버 활동, 작업 진행률)
- 팀별 대시보드 (작업 현황, 멤버 활동)
- 실시간 활동 로그 및 알림
- 출석 관리 시스템
- 데이터 시각화 및 분석 리포트

### 🔧 **파일 업로드 & 관리**
- Multer 기반 파일 업로드 시스템
- 프로필 이미지 업로드
- 작업 첨부파일 관리
- 메시지 파일 공유
- 파일 타입 및 크기 제한

### 🌐 **API 문서화**
- Swagger UI 기반 API 문서
- 자동 API 스키마 생성
- 인터랙티브 API 테스트
- Firebase 호스팅을 통한 API 문서 배포

### 📋 **작업 관리 (Hybrid Database)**
- **MySQL**: 기본 작업 정보 (상태, 우선순위, 할당자)
  - 작업 상태: TODO, IN_PROGRESS, DONE
  - 우선순위: HIGH, MEDIUM, LOW
  - 작업 생성, 조회, 수정
- **MongoDB**: 확장 작업 정보 (제목, 내용, 태그, 첨부파일)
  - 작업 제목 및 상세 내용
  - 태그 시스템 (배열 형태)
  - 첨부파일 경로 관리
  - MySQL 작업과 연동된 확장 정보

### 💬 **댓글 시스템 (MongoDB)**
- 작업별 댓글 작성 및 조회
- 대댓글 (중첩 댓글) 지원 (parent_id)
- 댓글 수정/삭제 권한 관리
- 댓글 소유자 및 팀 관리자 권한 체크

### 💬 **실시간 메시징 시스템 (MongoDB + Socket.IO)**
- **채팅방 관리**: DM, 워크스페이스, 팀 채팅방
- **메시지 기능**: 텍스트, 이미지, 파일 메시지 지원
- **고급 기능**: 답장, 첨부파일, 메시지 수정/삭제
- **실시간 통신**: Socket.IO 기반 실시간 메시징
  - `join_room`, `leave_room` - 채팅방 입장/퇴장
  - `send_message` - 메시지 전송
  - `room_updated` - 실시간 방 업데이트
- **페이지네이션**: 메시지 목록 페이징 지원
- **자동 정렬**: 마지막 메시지 시간 기준 채팅방 정렬

### 📊 **활동 로그**
- 워크스페이스 내 모든 활동 추적
- 실시간 활동 로그 조회 및 생성
- 사용자 행동 기록 및 감사 추적

### 🛡️ **보안 & 검증**
- type-wizard를 활용한 런타임 타입 검증
- CORS 설정 및 보안 미들웨어
- 권한 기반 API 접근 제어
- JWT 토큰 기반 인증 미들웨어

## 🛠️ Tech Stack

### **Backend Framework**
- **Node.js** - JavaScript 런타임 환경
- **TypeScript** - 정적 타입 지원 JavaScript 슈퍼셋
- **Express.js** - 웹 애플리케이션 프레임워크
- **ts-node** - TypeScript 노드 실행
- **tsconfig-paths** - TypeScript 경로 매핑

### **Database**
- **MySQL** - 관계형 데이터베이스 (사용자, 워크스페이스, 팀, 기본 작업 정보)
- **MongoDB** - NoSQL 데이터베이스 (상세 작업 정보, 댓글, 메시지)
- **Mongoose** - MongoDB ODM (Object Document Mapper)
- **mysql2** - MySQL 드라이버 및 연결 풀
- **mysql2-wizard** - MySQL 쿼리 빌더

### **Real-time Communication**
- **Socket.IO** - 실시간 양방향 통신
- **Redis** - 인메모리 데이터 저장소 (세션 관리, 캐싱)
- **ioredis** - Redis 클라이언트

### **Authentication & Security**
- **JWT (jsonwebtoken)** - JSON Web Token 기반 인증
- **bcryptjs** - 패스워드 해싱
- **cookie-parser** - 쿠키 파싱 (JWT 토큰 추출)
- **cors** - Cross-Origin Resource Sharing
- **helmet** - 보안 헤더 설정
- **joi** - 데이터 유효성 검사

### **File Upload**
- **multer** - 파일 업로드 미들웨어
- **uuid** - 고유 식별자 생성

### **Development & Testing**
- **nodemon** - 개발 서버 자동 재시작
- **jest** - JavaScript 테스트 프레임워크
- **ts-jest** - Jest TypeScript 지원
- **@types/** - TypeScript 타입 정의
- **eslint** - 코드 린팅
- **prettier** - 코드 포맷팅

### **Documentation & Deployment**
- **swagger-ui-express** - API 문서화
- **swagger-jsdoc** - Swagger 주석 기반 문서 생성
- **firebase-admin** - Firebase 관리 SDK
- **firebase-functions** - Firebase 함수
- **rimraf** - 디렉토리 삭제
- **copyfiles** - 파일 복사

### **Utilities**
- **dotenv** - 환경 변수 관리
- **express-rate-limit** - 요청 속도 제한
- **compression** - 응답 압축
- **cookie-parser** - 쿠키 파싱 (JWT 토큰 추출)

## 🏗️ Architecture

### **Hybrid Database Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    TeamSphere Server                        │
├─────────────────────────────────────────────────────────────┤
│                    Express.js + Socket.IO                   │
├─────────────────────────────────────────────────────────────┤
│                      Middleware Layer                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │   Auth      │ │   CORS      │ │   Rate      │ │ Helmet  │ │
│  │ Middleware  │ │ Middleware  │ │   Limit     │ │         │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │   Auth      │ │   User      │ │ Workspace   │ │   Task  │ │
│  │   Service   │ │   Service   │ │   Service   │ │ Service │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      Database Layer                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    MySQL (RDBMS)                       │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │ │
│  │  │   Users     │ │Workspaces   │ │    Teams    │       │ │
│  │  │   Table     │ │   Table     │ │   Table     │       │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘       │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   MongoDB (NoSQL)                      │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │ │
│  │  │   Tasks     │ │  Comments   │ │  Messages   │       │ │
│  │  │ Collection  │ │ Collection  │ │ Collection  │       │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘       │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      Cache Layer                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                     Redis                               │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │ │
│  │  │   Sessions  │ │   Cache     │ │   Rate      │       │ │
│  │  │   Storage   │ │   Storage   │ │   Limits    │       │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘       │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **Microservices Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                           │
│                    (Express.js + Socket.IO)                │
├─────────────────────────────────────────────────────────────┤
│                      Services                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │   Auth      │ │   User      │ │ Workspace   │ │   Task  │ │
│  │   Service   │ │   Service   │ │   Service   │ │ Service │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │   Team      │ │   Room      │ │   Message   │ │ Upload  │ │
│  │   Service   │ │   Service   │ │   Service   │ │ Service │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      Real-time Layer                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  Socket.IO Server                       │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │ │
│  │  │   Chat      │ │   Presence  │ │  Activity   │       │ │
│  │  │   Events    │ │   Events    │ │   Events    │       │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘       │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **Data Flow Architecture**

```
Client Request → Express Router → Middleware → Service → Database
       ↓
Response ← Service ← Middleware ← Express Router ← Database
       ↓
Socket.IO Events → Real-time Updates → Connected Clients
```

### **Security Architecture**

- **JWT Authentication**: Stateless 인증 시스템
- **Role-based Access Control**: 역할 기반 권한 관리
- **Input Validation**: Joi 기반 데이터 유효성 검사
- **Rate Limiting**: API 요청 속도 제한
- **CORS Protection**: Cross-Origin 요청 보호
- **Helmet**: 보안 헤더 설정
- **Password Hashing**: bcryptjs 기반 패스워드 보호
## 📋 Prerequisites

- **Node.js** v16.0.0 or higher
- **MySQL** v8.0 or higher
- **MongoDB** v4.4 or higher
- **Redis** v6.0 or higher (optional, for caching and session management)
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

**MySQL Setup:**
Create a MySQL database named `TeamSphere`:
```sql
CREATE DATABASE TeamSphere;
```

Run the database migrations:
```bash
# Import the SQL schema
mysql -u your_username -p TeamSphere < db/Chat_System_Schema.sql
mysql -u your_username -p TeamSphere < db/Chat_Query_Examples.sql
```

**MongoDB Setup:**
Create a MongoDB database named `TeamSphere`:
```bash
# Using MongoDB shell
use TeamSphere
```

**Redis Setup (Optional):**
```bash
# Start Redis server
redis-server
```

### 4. Environment Configuration

Copy the environment template and configure your settings:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=TeamSphere

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/TeamSphere

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Socket.IO Configuration
SOCKET_CORS_ORIGIN=http://localhost:3000
```

### 5. Start the Development Server
```bash
npm run dev
```

The server will start on `http://localhost:8080`

### 6. Build for Production
```bash
npm run build
npm start
```

## ⚙️ Configuration

### **Environment Variables**

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 8080 | No |
| `NODE_ENV` | Environment mode | development | No |
| `DB_HOST` | MySQL host | localhost | Yes |
| `DB_USER` | MySQL username | - | Yes |
| `DB_PASSWORD` | MySQL password | - | Yes |
| `DB_NAME` | MySQL database name | TeamSphere | Yes |
| `MONGO_URI` | MongoDB connection string | - | Yes |
| `REDIS_HOST` | Redis host | localhost | No |
| `REDIS_PORT` | Redis port | 6379 | No |
| `REDIS_PASSWORD` | Redis password | - | No |
| `JWT_SECRET` | JWT secret key | - | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d | No |
| `UPLOAD_PATH` | File upload directory | ./uploads | No |
| `MAX_FILE_SIZE` | Max file size in bytes | 10485760 | No |
| `CORS_ORIGIN` | CORS allowed origin | http://localhost:3000 | Yes |
| `SOCKET_CORS_ORIGIN` | Socket.IO CORS origin | http://localhost:3000 | Yes |

### **Database Configuration**

**MySQL Tables:**
- `users` - 사용자 정보
- `profiles` - 사용자 프로필
- `workspaces` - 워크스페이스 정보
- `workspace_members` - 워크스페이스 멤버
- `workspace_teams` - 팀 정보
- `workspace_team_users` - 팀 멤버
- `tasks` - 기본 작업 정보
- `activity_logs` - 활동 로그

**MongoDB Collections:**
- `tasks` - 상세 작업 정보
- `comments` - 댓글 및 대댓글
- `rooms` - 채팅방 정보
- `messages` - 메시지 정보

### **Path Aliases**

```typescript
"@utils/*"      -> "src/utils/*"
"@middleware/*" -> "src/middleware/*"
"@services/*"   -> "src/services/*"
"@interfaces/*" -> "src/interfaces/*"
"@config/*"     -> "src/config/*"
"@models/*"     -> "src/models/*"
```## 🌐 API Documentation

### **Swagger UI**

The API documentation is available through Swagger UI:

- **Development**: `http://localhost:8080/api-docs`
- **Production**: `https://your-domain.com/api-docs`

### **API Structure**

```
┌─────────────────────────────────────────────────────────────┐
│                      API Endpoints                          │
├─────────────────────────────────────────────────────────────┤
│                      Authentication                         │
│  POST   /v1/auth/register           # 회원가입              │
│  POST   /v1/auth/login              # 로그인                │
│  POST   /v1/auth/logout             # 로그아웃              │
│  POST   /v1/auth/refresh            # 토큰 갱신            │
│  POST   /v1/auth/change-password    # 비밀번호 변경        │
├─────────────────────────────────────────────────────────────┤
│                      Users                                 │
│  GET    /v1/user/profile            # 프로필 조회          │
│  PUT    /v1/user/profile            # 프로필 수정          │
│  POST   /v1/user/profile/image      # 프로필 이미지 업로드 │
│  GET    /v1/user/dashboard          # 대시보드 데이터      │
│  GET    /v1/user/attendance         # 출석 현황 조회      │
│  POST   /v1/user/attendance         # 출석 체크            │
├─────────────────────────────────────────────────────────────┤
│                      Workspaces                            │
│  GET    /v1/workspace               # 워크스페이스 목록   │
│  POST   /v1/workspace               # 워크스페이스 생성   │
│  GET    /v1/workspace/:id           # 워크스페이스 상세   │
│  PUT    /v1/workspace/:id           # 워크스페이스 수정   │
│  DELETE /v1/workspace/:id           # 워크스페이스 삭제   │
│  GET    /v1/workspace/:id/members   # 멤버 목록 조회      │
│  POST   /v1/workspace/:id/members   # 멤버 초대           │
│  PATCH  /v1/workspace/:id/members/:userId # 멤버 역할 수정 │
│  DELETE /v1/workspace/:id/members/:userId # 멤버 제거      │
│  GET    /v1/workspace/:id/dashboard  # 대시보드 데이터    │
│  GET    /v1/workspace/:id/activity-logs # 활동 로그        │
├─────────────────────────────────────────────────────────────┤
│                      Teams                                 │
│  GET    /v1/workspace/:id/teams     # 팀 목록 조회        │
│  POST   /v1/workspace/:id/teams     # 팀 생성             │
│  GET    /v1/workspace/:id/teams/:teamId # 팀 상세         │
│  PUT    /v1/workspace/:id/teams/:teamId # 팀 수정         │
│  DELETE /v1/workspace/:id/teams/:teamId # 팀 삭제         │
│  GET    /v1/workspace/:id/teams/:teamId/members # 멤버 목록│
│  POST   /v1/workspace/:id/teams/:teamId/members # 멤버 추가│
│  DELETE /v1/workspace/:id/teams/:teamId/members/:userId # 멤버 제거│
│  GET    /v1/workspace/:id/teams/:teamId/dashboard # 팀 대시보드│
├─────────────────────────────────────────────────────────────┤
│                      Tasks (Hybrid)                        │
│  GET    /v1/workspace/:id/teams/:teamId/tasks # 작업 목록 │
│  POST   /v1/workspace/:id/teams/:teamId/tasks # 작업 생성 │
│  GET    /v1/workspace/:id/teams/:teamId/tasks/:taskId # 작업 상세│
│  PUT    /v1/workspace/:id/teams/:teamId/tasks/:taskId # 작업 수정│
│  DELETE /v1/workspace/:id/teams/:teamId/tasks/:taskId # 작업 삭제│
│  GET    /v1/mongo/tasks/:taskId # MongoDB 작업 상세       │
│  PUT    /v1/mongo/tasks/:taskId # MongoDB 작업 수정       │
├─────────────────────────────────────────────────────────────┤
│                      Comments (MongoDB)                     │
│  GET    /v1/mongo/tasks/:taskId/comments # 댓글 목록      │
│  POST   /v1/mongo/tasks/:taskId/comments # 댓글 작성      │
│  PUT    /v1/mongo/comments/:commentId # 댓글 수정         │
│  DELETE /v1/mongo/comments/:commentId # 댓글 삭제         │
├─────────────────────────────────────────────────────────────┤
│                      Rooms (MongoDB)                       │
│  GET    /v1/user/rooms             # 채팅방 목록          │
│  POST   /v1/user/rooms             # 채팅방 생성          │
│  GET    /v1/user/rooms/:roomId     # 채팅방 상세          │
│  DELETE /v1/user/rooms/:roomId     # 채팅방 삭제          │
│  GET    /v1/user/rooms/:roomId/members # 멤버 목록        │
│  POST   /v1/user/rooms/:roomId/members # 멤버 추가        │
│  DELETE /v1/user/rooms/:roomId/members/:userId # 멤버 제거│
├─────────────────────────────────────────────────────────────┤
│                      Messages (MongoDB)                    │
│  GET    /v1/user/rooms/:roomId/messages # 메시지 목록     │
│  POST   /v1/user/rooms/:roomId/messages # 메시지 전송     │
│  PUT    /v1/user/messages/:messageId # 메시지 수정        │
│  DELETE /v1/user/messages/:messageId # 메시지 삭제        │
└─────────────────────────────────────────────────────────────┘
```

### **Socket.IO Events**

#### **Connection Events**
- `connect` - 클라이언트 연결
- `disconnect` - 클라이언트 연결 해제

#### **Room Events**
- `join_room` - 채팅방 입장
- `leave_room` - 채팅방 퇴장
- `room_joined` - 채팅방 입장 알림
- `room_left` - 채팅방 퇴장 알림

#### **Message Events**
- `send_message` - 메시지 전송
- `message_received` - 메시지 수신
- `message_updated` - 메시지 수정 알림
- `message_deleted` - 메시지 삭제 알림

#### **Typing Events**
- `typing_start` - 타이핑 시작
- `typing_stop` - 타이핑 중지
- `user_typing` - 사용자 타이핑 상태

#### **Presence Events**
- `user_online` - 사용자 온라인
- `user_offline` - 사용자 오프라인
- `user_joined` - 사용자 입장
- `user_left` - 사용자 퇴장

### **Authentication**

All protected endpoints require JWT authentication:

```bash
# Include JWT token in Authorization header
Authorization: Bearer <your_jwt_token>
```

Or use cookie-based authentication:
```bash
# The server will automatically read the 'accesstoken' cookie
Cookie: accesstoken=<your_jwt_token>
```

### **Error Responses**

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### **Success Responses**

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```
## 📁 Project Structure

```
server/
├── src/
│   ├── app/                     # Express 앱 설정 및 라우팅
│   │   ├── index.ts             # 메인 앱 진입점
│   │   ├── route.ts             # 라우트 설정
│   │   └── v1/                  # API v1 라우트
│   │       ├── auth/            # 인증 관련 라우트
│   │       ├── dashboard/       # 대시보드 라우트
│   │       ├── user/            # 사용자 관련 라우트
│   │       │   ├── attendance/  # 출석 관리
│   │       │   ├── profile/     # 프로필 관리
│   │       │   └── rooms/       # 채팅방 관리
│   │       └── workspace/       # 워크스페이스 관련 라우트
│   │           └── [workspaceId]/ # 동적 워크스페이스 ID
│   │               ├── Teams/    # 팀 관리
│   │               │   └── [teamId]/ # 동적 팀 ID
│   │               │       └── member/ # 팀 멤버 관리
│   │               ├── activityLogs/ # 활동 로그
│   │               ├── dashboard/ # 대시보드
│   │               ├── members/   # 멤버 관리
│   │               └── message/   # 메시지 관리
│   ├── config/                  # 설정 파일
│   │   ├── database.ts          # 데이터베이스 설정
│   │   ├── redis.ts             # Redis 설정
│   │   ├── socket.ts            # Socket.IO 설정
│   │   └── swagger.ts           # Swagger 설정
│   ├── interfaces/              # 타입 인터페이스
│   │   ├── guard/               # 가드 인터페이스
│   │   ├── ActivityLogs.ts      # 활동 로그 인터페이스
│   │   ├── AttendanceRecords.ts # 출석 기록 인터페이스
│   │   ├── MongoComments.ts     # MongoDB 댓글 인터페이스
│   │   ├── MongoTask.ts         # MongoDB 작업 인터페이스
│   │   ├── Profiles.ts          # 프로필 인터페이스
│   │   ├── Rooms.ts             # 채팅방 인터페이스
│   │   ├── Tasks.ts             # 작업 인터페이스
│   │   ├── Users.ts             # 사용자 인터페이스
│   │   ├── WorkspaceTeamUsers.ts # 팀 멤버 인터페이스
│   │   ├── workspaceTeams.ts    # 팀 인터페이스
│   │   ├── workspaces.ts        # 워크스페이스 인터페이스
│   │   └── workspacesMembers.ts # 워크스페이스 멤버 인터페이스
│   ├── middleware/              # 미들웨어
│   │   ├── auth.ts              # 인증 미들웨어
│   │   ├── errorHandler.ts      # 에러 핸들러
│   │   └── validation.ts        # 유효성 검사 미들웨어
│   ├── models/                  # 데이터 모델
│   │   ├── User.ts              # 사용자 모델
│   │   ├── Workspace.ts         # 워크스페이스 모델
│   │   └── Team.ts              # 팀 모델
│   ├── services/                # 비즈니스 로직 서비스
│   │   ├── ENUM/                # 열거형 정의
│   │   ├── ActivityLogs.ts      # 활동 로그 서비스
│   │   ├── AttendanceRecords.ts # 출석 기록 서비스
│   │   ├── Auth.ts              # 인증 서비스
│   │   ├── MongoCommentsService.ts # MongoDB 댓글 서비스
│   │   ├── MongoTaskService.ts  # MongoDB 작업 서비스
│   │   ├── Profiles.ts          # 프로필 서비스
│   │   ├── Rooms.ts             # 채팅방 서비스
│   │   ├── RoomsUser.ts         # 채팅방 사용자 서비스
│   │   ├── Tasks.ts             # 작업 서비스
│   │   ├── Users.ts             # 사용자 서비스
│   │   ├── WorkspaceTeamUsers.ts # 팀 멤버 서비스
│   │   ├── message.ts           # 메시지 서비스
│   │   ├── uploadService.ts     # 파일 업로드 서비스
│   │   ├── workspaceTeams.ts    # 팀 서비스
│   │   ├── workspaces.ts        # 워크스페이스 서비스
│   │   └── workspacesMembers.ts # 워크스페이스 멤버 서비스
│   ├── types/                   # 타입 정의
│   │   └── index.ts             # 공용 타입
│   ├── utils/                   # 유틸리티 함수
│   │   ├── database.ts          # 데이터베이스 유틸리티
│   │   ├── errorHandler.ts      # 에러 핸들러 유틸리티
│   │   ├── logger.ts            # 로거 유틸리티
│   │   ├── validation.ts        # 유효성 검사 유틸리티
│   │   └── websocket.ts         # 웹소켓 유틸리티
│   ├── @types/                  # 커스텀 타입 정의
│   └── __tests__/               # 테스트 파일
├── db/                          # 데이터베이스 스키마 및 쿼리
│   ├── Chat_System_Schema.sql   # 채팅 시스템 스키마
│   ├── Chat_Query_Examples.sql  # 채팅 쿼리 예제
│   ├── SQL_Query.sql            # SQL 쿼리 예제
│   ├── schema.json              # 스키마 JSON
│   └── schema_v2.json           # 스키마 v2 JSON
├── public/                      # 정적 파일
├── scripts/                     # 스크립트 파일
├── .env.example                 # 환경 변수 예제
├── .env                         # 환경 변수 (실제 설정)
├── .gitignore                   # Git 무시 파일
├── package.json                 # 패키지 의존성
├── package-lock.json            # 패키지 잠금 파일
├── tsconfig.json                # TypeScript 설정
├── jest.config.cjs              # Jest 설정
├── Procfile                     # Railway 배포 설정
├── railway.toml                 # Railway 설정
├── API.md                       # 상세 API 문서
└── README.md                    # 프로젝트 문서
```

### **Key Files Description**

#### **Application Files**
- `src/app/index.ts` - 메인 Express 앱 설정
- `src/app/route.ts` - 라우트 설정
- `src/config/database.ts` - 데이터베이스 연결 설정
- `src/config/socket.ts` - Socket.IO 설정
- `src/config/swagger.ts` - Swagger API 문서 설정

#### **Service Files**
- `src/services/Auth.ts` - 인증 로직
- `src/services/Users.ts` - 사용자 관리
- `src/services/workspaces.ts` - 워크스페이스 관리
- `src/services/workspaceTeams.ts` - 팀 관리
- `src/services/Tasks.ts` - MySQL 작업 관리
- `src/services/MongoTaskService.ts` - MongoDB 작업 관리
- `src/services/MongoCommentsService.ts` - 댓글 관리
- `src/services/Rooms.ts` - 채팅방 관리
- `src/services/message.ts` - 메시지 관리

#### **Interface Files**
- `src/interfaces/Users.ts` - 사용자 인터페이스
- `src/interfaces/workspaces.ts` - 워크스페이스 인터페이스
- `src/interfaces/workspaceTeams.ts` - 팀 인터페이스
- `src/interfaces/Tasks.ts` - 작업 인터페이스
- `src/interfaces/MongoTask.ts` - MongoDB 작업 인터페이스
- `src/interfaces/MongoComments.ts` - 댓글 인터페이스
- `src/interfaces/Rooms.ts` - 채팅방 인터페이스

#### **Middleware Files**
- `src/middleware/auth.ts` - JWT 인증 미들웨어
- `src/middleware/errorHandler.ts` - 에러 핸들러 미들웨어
- `src/middleware/validation.ts` - Joi 유효성 검사 미들웨어

## 🚀 Development Guidelines

### **Code Standards**

#### **TypeScript Guidelines**
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use type guards for runtime type checking
- Implement proper error handling with try-catch blocks
- Use async/await for asynchronous operations

#### **ESLint Configuration**
```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "warn"
  }
}
```

#### **Prettier Configuration**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### **Adding New Features**

#### **1. Adding New API Endpoints**
```typescript
// 1. Define interface in src/interfaces/
export interface NewFeature {
  id: string;
  name: string;
  description: string;
}

// 2. Create service in src/services/
export class NewFeatureService {
  async create(data: NewFeature): Promise<NewFeature> {
    // Implementation
  }
}

// 3. Add route in src/app/v1/
router.post('/new-feature', authenticateToken, async (req, res) => {
  // Implementation
});

// 4. Add validation middleware
const newFeatureValidation = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required()
  });
  
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};
```

#### **2. Adding New Socket.IO Events**
```typescript
// In src/config/socket.ts
io.on('connection', (socket) => {
  // New event handler
  socket.on('new_event', async (data) => {
    try {
      // Process event
      io.to(socket.roomId).emit('new_event_response', processedData);
    } catch (error) {
      socket.emit('error', { message: 'Event processing failed' });
    }
  });
});
```

#### **3. Database Schema Changes**

**MySQL:**
```sql
-- Add new table
CREATE TABLE new_features (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Or add column to existing table
ALTER TABLE users ADD COLUMN new_feature_id VARCHAR(36);
```

**MongoDB:**
```typescript
// Add new collection schema
const newFeatureSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const NewFeature = mongoose.model('NewFeature', newFeatureSchema);
```

### **Security Best Practices**

#### **Authentication & Authorization**
- Always use JWT tokens for protected routes
- Implement role-based access control
- Validate user permissions for sensitive operations
- Use HTTPS in production

#### **Input Validation**
```typescript
// Use Joi for request body validation
const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).required()
});

// Sanitize user inputs
const sanitizedInput = sanitizeHtml(userInput);
```

#### **Error Handling**
```typescript
// Custom error class
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Error handling middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};
```

## 🧪 Testing

### **Test Setup**

The project uses Jest for testing with the following configuration:

```javascript
// jest.config.cjs
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
```

### **Running Tests**

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- UserService.test.ts
```

### **Test Structure**

```
src/
├── __tests__/
│   ├── services/
│   │   ├── Auth.test.ts
│   │   ├── Users.test.ts
│   │   └── Tasks.test.ts
│   ├── middleware/
│   │   ├── auth.test.ts
│   │   └── validation.test.ts
│   ├── utils/
│   │   └── validation.test.ts
│   └── integration/
│       ├── auth.test.ts
│       └── workspace.test.ts
```

### **Test Examples**

#### **Unit Test Example**
```typescript
// src/__tests__/services/Users.test.ts
import { UsersService } from '@services/Users';
import { User } from '@interfaces/Users';

describe('UsersService', () => {
  let usersService: UsersService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      query: jest.fn(),
    };
    usersService = new UsersService(mockDb);
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData: User = {
        id: 'test-id',
        email: 'test@example.com',
        password: 'hashed-password',
        name: 'Test User',
      };

      mockDb.query.mockResolvedValue({
        affectedRows: 1,
        insertId: 'test-id',
      });

      const result = await usersService.createUser(userData);
      expect(result).toEqual({
        success: true,
        message: 'User created successfully',
        data: { id: 'test-id' },
      });
    });
  });
});
```

#### **Integration Test Example**
```typescript
// src/__tests__/integration/auth.test.ts
import request from 'supertest';
import app from '@app/index';

describe('Authentication Integration', () => {
  describe('POST /v1/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const response = await request(app)
        .post('/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
    });
  });
});
```

### **Test Coverage**

Aim for at least 80% test coverage for all critical paths:
- Authentication services
- Database operations
- API endpoints
- Business logic
- Error handling

### **Mock Database**

For testing, use mock database connections:
```typescript
// setupTests.ts
import { jest } from '@jest/globals';

global.mockDb = {
  query: jest.fn(),
  execute: jest.fn(),
};

global.mockMongoDb = {
  model: jest.fn(),
  connect: jest.fn(),
};
```
## 🚀 Deployment

### **Development Deployment**

#### **Local Development**
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your local configuration

# Start development server
npm run dev
```

#### **Docker Development**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
```

```bash
# Build and run with Docker Compose
docker-compose up --build
```

### **Production Deployment**

#### **Railway Deployment**
The project is configured for Railway deployment:

1. **Connect Repository**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Initialize project
   railway init
   
   # Link to existing project
   railway link
   ```

2. **Environment Variables**
   Set production environment variables in Railway dashboard:
   ```env
   NODE_ENV=production
   PORT=8080
   DB_HOST=your-production-db-host
   DB_USER=your-production-db-user
   DB_PASSWORD=your-production-db-password
   DB_NAME=TeamSphere
   MONGO_URI=your-production-mongo-uri
   JWT_SECRET=your-production-jwt-secret
   CORS_ORIGIN=your-frontend-domain
   SOCKET_CORS_ORIGIN=your-frontend-domain
   ```

3. **Deploy**
   ```bash
   # Push to trigger deployment
   git push origin main
   
   # Or deploy manually
   railway up
   ```

#### **AWS Deployment**

**Using EC2 and RDS:**

1. **Launch EC2 Instance**
   ```bash
   # Connect to EC2 instance
   ssh -i your-key.pem ec2-user@your-ec2-public-ip
   
   # Install Node.js and npm
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MySQL and MongoDB
   sudo apt-get update
   sudo apt-get install -y mysql-server mongodb
   ```

2. **Configure RDS Database**
   - Create MySQL RDS instance
   - Configure security groups
   - Update connection strings

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/Suhyun751207/TeamSphere.git
   cd TeamSphere/server
   
   # Install dependencies
   npm install --production
   
   # Build application
   npm run build
   
   # Set up PM2 for process management
   npm install -g pm2
   pm2 start dist/index.js --name "teamsphere-server"
   pm2 startup
   pm2 save
   ```

#### **Heroku Deployment**

1. **Prepare for Heroku**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login to Heroku
   heroku login
   
   # Create Heroku app
   heroku create your-app-name
   ```

2. **Add Buildpacks**
   ```bash
   # Add Node.js buildpack
   heroku buildpacks:set heroku/nodejs
   
   # Add MongoDB buildpack if using MongoDB Atlas
   heroku buildpacks:add https://github.com/mongolab/mongolab-heroku.git
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set MONGO_URI=your-mongo-atlas-uri
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### **CI/CD Pipeline**

#### **GitHub Actions**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up
```

### **Monitoring and Logging**

#### **Application Monitoring**
```typescript
// Add monitoring middleware
import morgan from 'morgan';

// HTTP request logging
app.use(morgan('combined'));

// Custom logging
const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

app.use(logger);
```

#### **Error Tracking**
```typescript
// Error tracking with Sentry (optional)
import * as Sentry from '@sentry/node';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });
}
```

## 🤝 Contributing

### **Contribution Guidelines**

We welcome contributions to the TeamSphere project! Please follow these guidelines:

#### **1. Code of Conduct**
- Be respectful and inclusive
- Provide constructive feedback
- Follow the project's coding standards
- Help maintain a positive community

#### **2. Getting Started**

1. **Fork the Repository**
   ```bash
   # Fork the repository on GitHub
   git clone https://github.com/your-username/TeamSphere.git
   cd TeamSphere/server
   ```

2. **Set Up Development Environment**
   ```bash
   # Install dependencies
   npm install
   
   # Set up environment variables
   cp .env.example .env
   # Configure your local development settings
   
   # Create a feature branch
   git checkout -b feature/your-feature-name
   ```

3. **Development Workflow**
   ```bash
   # Make your changes
   # Follow the coding standards
   # Write tests for new features
   
   # Run tests
   npm test
   
   # Check code quality
   npm run lint
   npm run format
   
   # Commit your changes
   git add .
   git commit -m "feat: add your feature description"
   
   # Push to your fork
   git push origin feature/your-feature-name
   ```

#### **3. Pull Request Process**

1. **Create Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your feature branch
   - Fill in the PR template

2. **PR Template**
   ```markdown
   ## Description
   Brief description of your changes
   
   ## Type of Change
   - [ ] Bug fix (non-breaking change which fixes an issue)
   - [ ] New feature (non-breaking change which adds functionality)
   - [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
   - [ ] Documentation update
   
   ## Testing
   - [ ] My code follows the style guidelines of this project
   - [ ] I have performed a self-review of my own code
   - [ ] I have commented my code, particularly in hard-to-understand areas
   - [ ] My changes generate no new warnings
   - [ ] I have added tests that prove my fix is effective or that my feature works
   - [ ] New and existing unit tests pass locally with my changes
   - [ ] Any dependent changes have been merged and published in downstream modules
   
   ## Checklist
   - [ ] I have read the CONTRIBUTING.md document
   - [ ] My code follows the coding style of this project
   - [ ] I have updated the documentation if needed
   - [ ] I have added tests for my changes
   ```

3. **Review Process**
   - Automated checks will run (tests, linting, etc.)
   - Maintainers will review your code
   - Address any feedback or requested changes
   - Once approved, your PR will be merged

#### **4. Coding Standards**

**TypeScript Guidelines:**
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use proper type annotations
- Avoid `any` type when possible
- Use type guards for runtime type checking

**Code Style:**
- Use ESLint and Prettier configurations
- Follow the existing code style
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for complex functions

**Git Commit Messages:**
- Use conventional commit format
```bash
feat: add new user authentication feature
fix: resolve database connection issue
docs: update API documentation
style: format code with prettier
refactor: improve code structure
test: add unit tests for user service
chore: update dependencies
```

#### **5. Reporting Issues**

When reporting issues, please provide:

1. **Issue Template**
   ```markdown
   ## Bug Description
   Clear and concise description of the bug
   
   ## Steps to Reproduce
   1. Go to '...'
   2. Click on '....'
   3. Scroll down to '....'
   4. See error
   
   ## Expected Behavior
   A clear and concise description of what you expected to happen
   
   ## Actual Behavior
   A clear and concise description of what actually happened
   
   ## Environment
   - OS: [e.g. Ubuntu 20.04, Windows 10, macOS Big Sur]
   - Node.js version: [e.g. 18.0.0]
   - Browser: [e.g. Chrome 96, Firefox 95, Safari 15]
   - Database: [e.g. MySQL 8.0, MongoDB 5.0]
   
   ## Additional Context
   Add any other context about the problem here
   ```

2. **Feature Requests**
   ```markdown
   ## Feature Description
   Clear and concise description of the feature
   
   ## Problem Statement
   What problem does this feature solve?
   
   ## Proposed Solution
   Describe the solution you'd like
   
   ## Alternatives Considered
   Describe any alternative solutions or features you've considered
   
   ## Additional Context
   Add any other context or screenshots about the feature request
   ```

#### **6. Development Resources**

**Useful Commands:**
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

# Testing
npm test             # Run all tests
npm run test:coverage # Run tests with coverage
npm run test:watch   # Run tests in watch mode

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run lint:fix     # Fix ESLint issues

# Database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with test data
npm run db:reset     # Reset database
```

**Documentation:**
- [API Documentation](./API.md)
- [Client README](../client/README.md)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- **Express.js** - Web application framework
- **TypeScript** - Typed JavaScript
- **MySQL** - Relational database
- **MongoDB** - NoSQL database
- **Socket.IO** - Real-time communication
- **Redis** - In-memory data structure store
- **Jest** - Testing framework
- **ESLint & Prettier** - Code quality tools
- **Swagger** - API documentation

## 📞 Support

For support, questions, or feature requests:

- **GitHub Issues**: [Create an issue](https://github.com/Suhyun751207/TeamSphere/issues)
- **Email**: [Contact us](mailto:support@teamsphere.com)
- **Discord**: [Join our community](https://discord.gg/teamsphere)

---

**TeamSphere** - Empowering teams to collaborate effectively in real-time. 🚀

### Base URL
```
http://localhost:8080/v1
```

### 🔐 Authentication Endpoints
```http
POST   /v1/auth/signup    # 회원가입
POST   /v1/auth/login     # 로그인
GET    /v1/auth/logout    # 로그아웃
```

### 📊 Dashboard
```http
GET    /v1/dashboard     # 대시보드 데이터 조회 (현재 테스트 응답)
```

### 🏢 Workspace Management
```http
GET    /v1/workspace                    # 참여 중인 워크스페이스 목록
POST   /v1/workspace                    # 워크스페이스 생성
GET    /v1/workspace/:workspaceId       # 워크스페이스 상세 조회
PATCH  /v1/workspace/:workspaceId       # 워크스페이스 수정

# 워크스페이스 멤버 관리
GET    /v1/workspace/:workspaceId/members        # 멤버 목록 조회
POST   /v1/workspace/:workspaceId/members        # 멤버 초대
PATCH  /v1/workspace/:workspaceId/members/:id    # 멤버 역할 수정
DELETE /v1/workspace/:workspaceId/members/:id    # 멤버 제거

# 활동 로그
GET    /v1/workspace/:workspaceId/activityLog    # 활동 로그 조회
POST   /v1/workspace/:workspaceId/activityLog    # 활동 로그 생성
```

### 👥 Team Management
```http
GET    /v1/workspace/:workspaceId/teams                    # 팀 목록 조회
POST   /v1/workspace/:workspaceId/teams                    # 팀 생성
GET    /v1/workspace/:workspaceId/teams/:teamId            # 팀 상세 조회
PATCH  /v1/workspace/:workspaceId/teams/:teamId            # 팀 수정
DELETE /v1/workspace/:workspaceId/teams/:teamId            # 팀 삭제

# 팀 멤버 관리
GET    /v1/workspace/:workspaceId/teams/:teamId/member                    # 팀 멤버 목록
POST   /v1/workspace/:workspaceId/teams/:teamId/member                    # 팀 멤버 추가
GET    /v1/workspace/:workspaceId/teams/:teamId/member/:memberId          # 팀 멤버 상세
PATCH  /v1/workspace/:workspaceId/teams/:teamId/member/:memberId          # 팀 멤버 수정
DELETE /v1/workspace/:workspaceId/teams/:teamId/member/:memberId          # 팀 멤버 제거
```

### 📋 Task Management (Hybrid Database)
```http
# MySQL Tasks (기본 작업 정보)
GET    /v1/workspace/:workspaceId/teams/:teamId/member/:memberId/tasks                 # 팀 멤버 작업 목록 (MySQL)
POST   /v1/workspace/:workspaceId/teams/:teamId/member/:memberId/tasks                 # 팀 멤버 작업 생성 (MySQL)
GET    /v1/workspace/:workspaceId/teams/:teamId/member/:memberId/tasks/:tasksId        # 작업 단일 조회
PATCH  /v1/workspace/:workspaceId/teams/:teamId/member/:memberId/tasks/:tasksId        # 작업 수정 (MySQL)

# MongoDB Tasks (확장 작업 정보)
GET    /v1/workspace/:workspaceId/teams/:teamId/member/:memberId/tasks/:tasksId/task          # Mongo Task 조회
POST   /v1/workspace/:workspaceId/teams/:teamId/member/:memberId/tasks/:tasksId/task          # Mongo Task 생성 (MySQL task와 연결)
GET    /v1/workspace/:workspaceId/teams/:teamId/member/:memberId/tasks/:tasksId/task/:taskId  # Mongo Task 단일 조회
PATCH  /v1/workspace/:workspaceId/teams/:teamId/member/:memberId/tasks/:tasksId/task/:taskId  # Mongo Task 수정

# MongoDB 작업 조회 (간편 API)
GET    /v1/mongo/tasks/:taskId                                                               # MongoDB 작업 상세 조회 (댓글 포함)
```

### 💬 Comments System (MongoDB)
```http
# 댓글 관리 (모든 엔드포인트: authenticateToken + checkTeamMember)
GET    /v1/workspace/:workspaceId/teams/:teamId/member/:memberId/tasks/:tasksId/task/:taskId/comments               # 특정 Mongo Task 댓글 목록
POST   /v1/workspace/:workspaceId/teams/:teamId/member/:memberId/tasks/:tasksId/task/:taskId/comments               # 댓글 생성
GET    /v1/workspace/:workspaceId/teams/:teamId/member/:memberId/tasks/:tasksId/task/:taskId/comments/:commentsId   # 댓글 단일 조회
PATCH  /v1/workspace/:workspaceId/teams/:teamId/member/:memberId/tasks/:tasksId/task/:taskId/comments/:commentsId   # 댓글 수정
DELETE /v1/workspace/:workspaceId/teams/:teamId/member/:memberId/tasks/:tasksId/task/:taskId/comments/:commentsId   # 댓글 삭제 (소유자 또는 Admin/Manager)
```

### 👤 User Management
```http
# 사용자 정보
GET    /v1/user                      # 현재 사용자 정보 조회
PATCH  /v1/user                      # 로그인 상태에서 비밀번호 변경
PATCH  /v1/user/notlogin             # 비로그인 상태에서 비밀번호 변경

# 출석 기록
GET    /v1/user/attendance           # 사용자 출석 기록 조회
POST   /v1/user/attendance           # 출석 기록 생성

# 프로필 관리
GET    /v1/user/profile              # 현재 사용자 프로필 조회
POST   /v1/user/profile              # 새 프로필 생성
GET    /v1/user/profile/:profileId   # 특정 사용자 프로필 조회
PATCH  /v1/user/profile/:profileId   # 프로필 정보 수정

# DM 채팅방 (개인 메시징)
GET    /v1/user/rooms                # 사용자 DM 채팅방 목록
POST   /v1/user/rooms                # 새 DM 채팅방 생성
GET    /v1/user/rooms/:roomId        # 특정 DM 채팅방 조회
POST   /v1/user/rooms/:roomId/:userId # DM 채팅방에 사용자 추가
DELETE /v1/user/rooms/:roomId/:userId # DM 채팅방에서 사용자 제거
GET    /v1/user/rooms/:roomId/message # DM 채팅방 메시지 목록
POST   /v1/user/rooms/:roomId/message # DM 메시지 전송
```

### 💬 Workspace Messaging System (MongoDB + Socket.IO)
```http
# 워크스페이스 채팅방 관리
GET    /v1/workspace/:workspaceId/message                                    # 워크스페이스 채팅방 목록
POST   /v1/workspace/:workspaceId/message                                    # 새 워크스페이스 채팅방 생성
GET    /v1/workspace/:workspaceId/message/:roomId                            # 특정 채팅방 조회
GET    /v1/workspace/:workspaceId/message/:roomId/members                    # 채팅방 멤버 목록
POST   /v1/workspace/:workspaceId/message/:roomId/:userId                    # 채팅방에 멤버 추가
DELETE /v1/workspace/:workspaceId/message/:roomId/:userId                  # 채팅방에서 멤버 제거

# 워크스페이스 메시지 관리
GET    /v1/workspace/:workspaceId/message/:roomId/message                    # 채팅방 메시지 목록
POST   /v1/workspace/:workspaceId/message/:roomId/message                    # 메시지 전송
GET    /v1/workspace/:workspaceId/message/:roomId/message/:messageId         # 특정 메시지 조회
PATCH  /v1/workspace/:workspaceId/message/:roomId/message/:messageId         # 메시지 수정
DELETE /v1/workspace/:workspaceId/message/:roomId/message/:messageId         # 메시지 삭제

# 팀 메시징
GET    /v1/workspace/:workspaceId/teams/:teamId/message                      # 팀 채팅방 메시지 목록
POST   /v1/workspace/:workspaceId/teams/:teamId/message                      # 팀 메시지 전송

# Socket.IO 실시간 이벤트
join_room      # 채팅방 입장
leave_room     # 채팅방 퇴장  
send_message   # 메시지 전송
room_updated   # 방 업데이트 (새 메시지 시 자동 발생)
```

**Auth & Access Control:** 모든 엔드포인트는 `authenticateToken` + 적절한 권한 확인 필요

**Enums:**
- TaskState: `'TODO' | 'IN_PROGRESS' | 'DONE'`
- TaskPriority: `'HIGH' | 'MEDIUM' | 'LOW'`
- MessageType: `'text' | 'image' | 'file' | 'system'`
- RoomType: `'dm' | 'workspace' | 'team'`

Request/Response Schemas

- MySQL Create Task
  - Request Body
    ```json
    {
      "state": "In Progress",
      "priority": "High",
      "task": "Optional short note"
    }
    ```
  - Response (MySQL ResultSetHeader 예시)
    ```json
    {
      "affectedRows": 1,
      "insertId": 123,
      "warningStatus": 0
    }
    ```

- MySQL List Tasks
  - Response (Array<tasks>)
    ```json
    [
      {
        "id": 1,
        "teamMemberId": 45,
        "state": "To Do",
        "priority": "Medium",
        "task": null,
        "externalId": null,
        "createdAt": "2025-08-26T11:00:00.000Z",
        "updatedAt": "2025-08-26T11:00:00.000Z"
      }
    ]
    ```

- MySQL Update Task
  - Request Body (동일 스키마)
    ```json
    {
      "state": "Done",
      "priority": "Low",
      "task": "Wrapped up"
    }
    ```
  - Response (MySQL ResultSetHeader 예시)
    ```json
    {
      "affectedRows": 1,
      "insertId": 0,
      "warningStatus": 0
    }
    ```

- Mongo Task Create (확장 데이터)
  - Request Body
    ```json
    {
      "title": "Implement comments",
      "content": "Add nested replies and mentions",
      "tags": ["backend", "mongodb"],
      "attachments_path": ["/files/spec.pdf"]
    }
    ```
  - Response (MongoTask)
    ```json
    {
      "id": 10,
      "task_id": 123, 
      "title": "Implement comments",
      "content": "Add nested replies and mentions",
      "tags": ["backend", "mongodb"],
      "attachments_path": ["/files/spec.pdf"],
      "created_at": "2025-08-26T11:00:00.000Z",
      "updated_at": "2025-08-26T11:00:00.000Z"
    }
    ```

- Mongo Task Update
  - Request Body (모든 필드 optional)
    ```json
    {
      "title": "Updated title",
      "content": "Updated content",
      "tags": null,
      "attachments_path": ["/files/new.pdf"]
    }
    ```
  - Response (MongoTask)
    ```json
    {
      "id": 10,
      "task_id": 123,
      "title": "Updated title",
      "content": "Updated content",
      "tags": null,
      "attachments_path": ["/files/new.pdf"],
      "created_at": "2025-08-26T11:00:00.000Z",
      "updated_at": "2025-08-26T12:34:56.000Z"
    }
    ```


### 📊 Complete API Coverage

**Total Endpoints Documented: 80+ endpoints across 13 categories**

#### **API Categories in Swagger Documentation**
1. **Auth APIs** (3 endpoints) - 인증 관련 API
2. **Dashboard API** (1 endpoint) - 대시보드 API  
3. **User APIs** (5 endpoints) - 사용자 관리 API
4. **Profile APIs** (4 endpoints) - 프로필 관리 API
5. **Workspace APIs** (6 endpoints) - 워크스페이스 관리 API
6. **Teams APIs** (8 endpoints) - 팀 관리 API
7. **Tasks APIs** (4 endpoints) - 작업 관리 API (MySQL)
8. **MongoTasks APIs** (4 endpoints) - MongoDB 작업 관리 API
9. **Comments APIs** (5 endpoints) - 댓글 관리 API
10. **Messages APIs** (20+ endpoints) - 메시징 API (DM + Workspace)
11. **Activity APIs** (2 endpoints) - 활동 로그 API
12. **Attendance APIs** (3 endpoints) - 출석 관리 API
13. **Members APIs** (10+ endpoints) - 멤버 관리 API

#### **Comprehensive Schema Documentation**
- **User, Profile, Room, Workspace, Team** - Core entity schemas
- **WorkspaceMember, TeamMember** - Role-based membership schemas
- **Task, MongoTask, MongoComment** - Hybrid database task schemas
- **Message** - Real-time messaging schemas with edit history
- **ActivityLog, AttendanceRecord** - Tracking and monitoring schemas
- **Error, Success** - Standardized response schemas

#### **Key Features Summary**

#### **Hybrid Database Design**
- **MySQL**: 관계형 데이터 (사용자, 워크스페이스, 팀, 기본 작업 정보)
- **MongoDB**: 문서형 데이터 (확장 작업 정보, 댓글, 실시간 메시징)

#### **Real-time Features**
- Socket.IO 기반 실시간 메시징
- 실시간 활동 로그 추적
- 워크스페이스/팀/DM 채팅 지원

#### **Security & Authorization**
- JWT 토큰 기반 인증
- 역할 기반 접근 제어 (Admin, Manager, Member, Viewer)
- 런타임 타입 검증 (type-wizard)
- 권한별 API 접근 제어

#### **API Documentation & Testing**
- **Swagger UI** - Interactive API documentation at `/docs`
- **OpenAPI 3.0** compliant specification
- **JWT Authentication** integrated in Swagger UI
- **Real-time validation** and error handling examples
- **Comprehensive schemas** with examples and validation rules

### 📊 Data Models

#### MySQL Tables
- **users** - 사용자 기본 정보
- **profiles** - 사용자 프로필 (성별, 생년월일, 전화번호)
- **workspaces** - 워크스페이스 정보
- **workspace_members** - 워크스페이스 멤버십
- **workspace_teams** - 팀 정보
- **workspace_team_users** - 팀 멤버십
- **tasks** - 기본 작업 정보 (상태, 우선순위)
- **activity_logs** - 활동 로그

#### MongoDB Collections
- **tasks** - 확장 작업 정보 (제목, 내용, 태그, 첨부파일)
- **comments** - 댓글 (내용, 대댓글 지원)
- **rooms** - 채팅방 (DM, 워크스페이스, 팀 채팅)
- **messages** - 메시지 (텍스트, 파일, 답장, 수정/삭제 지원)

### 🔒 Authentication & Authorization

#### JWT Token Flow
1. 로그인 시 JWT 토큰 발급
2. 쿠키에 토큰 저장 (httpOnly)
3. API 요청 시 토큰 검증
4. 권한별 접근 제어

#### Role-based Access Control
- **Admin** - 모든 권한
- **Manager** - 관리 권한 (멤버 관리, 팀 관리)
- **Member** - 기본 권한 (작업 생성/수정)
- **Viewer** - 읽기 전용 권한

## 📁 Project Structure

```
server/
├── src/
│   ├── app/                                    # 애플리케이션 설정
│   │   ├── index.ts                           # 메인 서버 진입점 (MongoDB, Socket.IO 연결 포함)
│   │   ├── route.ts                           # 루트 라우터
│   │   └── v1/                                # API 버전 1
│   │       ├── route.ts                       # V1 메인 라우터
│   │       ├── auth/                          # 인증 모듈
│   │       │   └── route.ts                   # 인증 엔드포인트
│   │       ├── mongo/                         # MongoDB 직접 접근 API
│   │       │   └── route.ts                   # MongoDB 작업 조회 API
│   │       ├── user/                          # 사용자 프로필 관리
│   │       │   └── profile/                   # 프로필 엔드포인트
│   │       │       └── route.ts               # 프로필 CRUD
│   │       ├── user/                          # 사용자 관련 API
│   │       │   ├── profile/                   # 프로필 엔드포인트
│   │       │   │   └── route.ts               # 프로필 CRUD
│   │       │   └── rooms/                     # 채팅방 API (실시간 메시징)
│   │       │       └── route.ts               # 채팅방 및 메시지 관리
│   │       └── workspace/                     # 워크스페이스 모듈
│   │           ├── router.ts                  # 워크스페이스 라우터
│   │           └── [workspaceId]/             # 워크스페이스별 라우팅
│   │               ├── route.ts               # 워크스페이스 상세
│   │               ├── members/               # 멤버 관리
│   │               ├── activityLogs/          # 활동 로그
│   │               ├── message/               # 실시간 메시징 시스템
│   │               │   ├── route.ts           # 채팅방 관리
│   │               │   └── rooms/             # 채팅방별 라우팅
│   │               │       └── [roomId]/      # 특정 채팅방
│   │               │           └── messages/  # 메시지 관리
│   │               │               └── route.ts # 메시지 CRUD
│   │               └── Teams/                 # 팀 관리
│   │                   └── [teamId]/          # 팀별 라우팅
│   │                       └── member/        # 팀 멤버 관리
│   │                           └── [memberId]/# 멤버별 라우팅
│   │                               └── tasks/ # 작업 관리
│   │                                   ├── route.ts         # MySQL 작업
│   │                                   └── [taskId]/        # 작업별 라우팅
│   │                                       └── task/        # MongoDB 작업
│   │                                           ├── route.ts # MongoDB 작업 관리
│   │                                           └── [taskId]/# 작업 상세
│   │                                               ├── route.ts      # 작업 CRUD
│   │                                               └── comments/     # 댓글 시스템
│   │                                                   ├── route.ts  # 댓글 관리
│   │                                                   └── [commentsId]/
│   │                                                       └── route.ts # 댓글 CRUD
│   ├── config/                                # 설정 파일
│   │   ├── database.ts                        # MySQL 연결 설정
│   │   ├── swagger.ts                         # Swagger OpenAPI 설정 및 문서화
│   │   └── socket.ts                          # Socket.IO 설정 및 이벤트 핸들러
│   ├── interfaces/                            # TypeScript 인터페이스
│   │   ├── Users.ts                          # 사용자 타입 정의
│   │   ├── Profiles.ts                       # 프로필 타입 정의
│   │   ├── workspaces.ts                     # 워크스페이스 타입
│   │   ├── workspacesMembers.ts              # 워크스페이스 멤버 타입
│   │   ├── workspaceTeams.ts                 # 팀 타입
│   │   ├── WorkspaceTeamUsers.ts             # 팀 멤버 타입
│   │   ├── Tasks.ts                          # MySQL 작업 타입
│   │   ├── MongoTask.ts                      # MongoDB 작업 타입
│   │   ├── MongoComments.ts                  # MongoDB 댓글 타입
│   │   ├── MongoRoom.ts                      # MongoDB 채팅방 타입
│   │   ├── MongoMessage.ts                   # MongoDB 메시지 타입
│   │   ├── ActivityLogs.ts                   # 활동 로그 타입
│   │   └── guard/                            # 런타임 타입 가드
│   │       ├── Users.guard.ts                # 사용자 타입 가드
│   │       ├── Profiles.guard.ts             # 프로필 타입 가드
│   │       ├── workspaces.guard.ts           # 워크스페이스 타입 가드
│   │       ├── workspacesMembers.guard.ts    # 워크스페이스 멤버 타입 가드
│   │       ├── workspaceTeams.guard.ts       # 팀 타입 가드
│   │       ├── WorkspaceTeamUsers.guard.ts   # 팀 멤버 타입 가드
│   │       ├── Tasks.guard.ts                # MySQL 작업 타입 가드
│   │       ├── MongoTask.guard.ts            # MongoDB 작업 타입 가드
│   │       ├── MongoComments.guard.ts        # MongoDB 댓글 타입 가드
│   │       ├── MongoRoom.guard.ts            # MongoDB 채팅방 타입 가드
│   │       ├── MongoMessage.guard.ts         # MongoDB 메시지 타입 가드
│   │       └── ActivityLogs.guard.ts         # 활동 로그 타입 가드
│   ├── middleware/                           # 미들웨어
│   │   ├── auth.ts                          # JWT 인증 미들웨어
│   │   └── workspaceAuth.ts                 # 워크스페이스 권한 미들웨어
│   ├── models/                              # MongoDB 모델
│   │   ├── MongoTask.ts                     # MongoDB 작업 스키마
│   │   ├── MongoComments.ts                 # MongoDB 댓글 스키마
│   │   ├── MongoRoom.ts                     # MongoDB 채팅방 스키마
│   │   └── MongoMessage.ts                  # MongoDB 메시지 스키마
│   ├── services/                            # 비즈니스 로직 레이어
│   │   ├── Auth.ts                          # 인증 서비스
│   │   ├── Users.ts                         # 사용자 서비스
│   │   ├── Profiles.ts                      # 프로필 서비스
│   │   ├── workspaces.ts                    # 워크스페이스 서비스
│   │   ├── workspacesMembers.ts             # 워크스페이스 멤버 서비스
│   │   ├── workspaceTeams.ts                # 팀 서비스
│   │   ├── WorkspaceTeamUsers.ts            # 팀 멤버 서비스
│   │   ├── Tasks.ts                         # MySQL 작업 서비스
│   │   ├── MongoTaskService.ts              # MongoDB 작업 서비스
│   │   ├── MongoCommentsService.ts          # MongoDB 댓글 서비스
│   │   ├── MongoRoomService.ts              # MongoDB 채팅방 서비스
│   │   ├── MongoMessageService.ts           # MongoDB 메시지 서비스
│   │   ├── ActivityLogs.ts                  # 활동 로그 서비스
│   │   └── ENUM/                            # 열거형 ��의
│   │       ├── workspace_roles_enum.ts      # 워크스페이스 역할
│   │       ├── task_states_enum.ts          # 작업 상태
│   │       ├── task_priority_enum.ts        # 작업 우선순위
│   │       ├── subscription_states_enum.ts  # 구독 상태
│   │       ├── message_types_enum.ts        # 메시지 타입
│   │       ├── room_types_enum.ts           # 채팅방 타입
│   │       └── genders_enum.ts              # 성별
│   └── utils/                               # 유틸리티 함수
│       ├── catchAsyncErrors.ts              # 비동기 에러 처리
│       ├── jwt.ts                           # JWT 유틸리티
│       ├── password.ts                      # 패스워드 유틸리티
│       └── initSocket.ts                    # Socket.IO 초기화 및 이벤트 핸들러
├── db/                                      # 데이터베이스 관련
│   ├── SQL_Query.sql                        # MySQL 스키마
│   ├── TeamSphere.vuerd.json                # ERD 파일
│   └── messages.json                        # 메시지 샘플 데이터
├── .env.example                             # 환경변수 템플릿
├── .gitignore                               # Git 제외 파일
├── package.json                             # 패키지 의존성
├── tsconfig.json                            # TypeScript 설정 (Path aliases 포함)
├── API.md                                   # 상세 API 문서
└── README.md                                # 프로젝트 문서
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

#### MySQL Operations (mysql2-wizard)
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

#### MongoDB Operations (Mongoose)
```typescript
// Example: MongoDB Task service
import { MongoTaskModel } from '@models/MongoTask.ts';

// Create task
const task = new MongoTaskModel(data);
await task.save();

// Find tasks
const tasks = await MongoTaskModel.find({ task_id: 1 });
```

### Type Safety & Validation

#### Runtime Type Guards (type-wizard)
```typescript
import { isMongoTaskCreate } from '@interfaces/guard/MongoTask.guard.ts';

// Validate request data
if (!isMongoTaskCreate(data)) {
  return res.status(400).json({ 
    message: isMongoTaskCreate.message(data) 
  });
}
```

#### Path Aliases Usage
```typescript
// Clean imports using path aliases
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import mongoTaskService from "@services/MongoTaskService.ts";
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
