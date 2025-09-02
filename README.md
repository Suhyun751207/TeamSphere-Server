# TeamSphere Server 🚀

> **Real-time Team Collaboration & Task Management SaaS Platform**  
> TypeScript + Express + MySQL + MongoDB + Socket.IO

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-00000F?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

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
- [Contributing](#-contributing)

## ✨ Features

### 🔐 **Authentication & Authorization**
- JWT 기반 인증 시스템 (회원가입, 로그인, 로그아웃)
- 토큰 검증 및 자동 갱신
- 쿠키 기반 토큰 관리 (`accesstoken` 쿠키)
- bcryptjs 패스워드 해싱
- 역할 기반 접근 제어 (Admin, Manager, Member, Viewer)

### 👥 **사용자 관리**
- 사용자 프로필 관리 (이름, 나이, 성별, 전화번호, 프로필 이미지)
- 구독 상태 관리 (Free, Premium)
- 사용자별 워크스페이스 접근 권한 관리

### 🏢 **워크스페이스 관리**
- 워크스페이스 생성, 조회, 수정
- 멤버 초대 및 역할 관리 (Admin, Manager, Member, Viewer)
- 워크스페이스별 권한 기반 접근 제어
- 워크스페이스 멤버 목록 조회 및 관리

### 👥 **팀 관리**
- 워크스페이스 내 팀 생성, 조회, 수정, 삭제
- 팀 멤버 추가/제거
- 팀별 역할 및 권한 관리 (Admin, Manager, Member)
- 팀 상세 정보 및 멤버 목록 조회

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
- **Express.js** - 웹 애플리케이션 프레임워크
- **TypeScript** - 정적 타입 검사

### **Database**
- **MySQL** - 관계형 데이터베이스 (사용자, 워크스페이스, 팀 정보)
- **MongoDB** - NoSQL 데이터베이스 (작업, 댓글, 메시징 정보)
- **mysql2-wizard** - MySQL ORM
- **Mongoose** - MongoDB ODM

### **Authentication & Security**
- **JWT** - JSON Web Token 인증
- **bcryptjs** - 패스워드 해싱
- **cookie-parser** - 쿠키 파싱

### **Validation & Type Safety**
- **type-wizard** - 런타임 타입 검증
- **Joi** - 스키마 검증
- **TypeScript** - 컴파일 타임 타입 검사

### **Development Tools**
- **Nodemon** - 개발 서버 자동 재시작
- **ts-node** - TypeScript 직접 실행
- **tsconfig-paths** - Path aliases 지원
- **Jest** - 테스팅 프레임워크

### **Real-time & Utilities**
- **Socket.IO** - 실시간 통신 (메시징 시스템, JWT 인증 연동)
- **CORS** - Cross-Origin Resource Sharing (localhost:3000 허용)
- **UUID** - 고유 식별자 생성
- **dotenv** - 환경변수 관리
- **cookie-parser** - 쿠키 파싱 (JWT 토큰 추출)

## 🏗️ Architecture

### **Hybrid Database Architecture**
```
MySQL (관계형 데이터)          MongoDB (문서형 데이터)
├── users                     ├── tasks
├── profiles                  │   ├── title, content
├── workspaces                │   ├── tags[]
├── workspace_members         │   └── attachments_path[]
├── workspace_teams           ├── comments
├── workspace_team_users      │   ├── content
├── tasks (기본 정보)          │   ├── parent_id (대댓글)
│   ├── state                 │   └── member_id
│   ├── priority              ├── rooms (채팅방)
│   └── workspace_team_user_id│   ├── type (dm/workspace/team)
└── activity_logs             │   ├── participants[]
                              │   ├── lastMessageId
                              │   └── createdAt
                              └── messages
                                  ├── content, messageType
                                  ├── replyToId, attachments[]
                                  ├── isDeleted, isEdited
                                  └── createdAt (정렬 기준)
```

### **Path Aliases**
```typescript
"@utils/*"      -> "src/utils/*"
"@middleware/*" -> "src/middleware/*"
"@services/*"   -> "src/services/*"
"@interfaces/*" -> "src/interfaces/*"
"@config/*"     -> "src/config/*"
"@models/*"     -> "src/models/*"
```  

## 📋 Prerequisites

- **Node.js** v16.0.0 or higher
- **MySQL** v8.0 or higher
- **MongoDB** v4.4 or higher
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

**MongoDB Setup:**
Ensure MongoDB is running on your system:
```bash
# Start MongoDB service (Windows)
net start MongoDB

# Start MongoDB service (macOS/Linux)
sudo systemctl start mongod
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

### 5. MongoDB Setup
MongoDB 연결을 위한 환경변수 추가:
```env
MONGODB_URI=mongodb://localhost:27017/TeamSphere
```

### 6. Start Development Server
```bash
npm run dev
```

Server will be running at `http://localhost:8080`

**Socket.IO**: 실시간 통신도 같은 포트에서 제공됩니다.

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host address | `localhost` |
| `DB_PORT` | MySQL port number | `3306` |
| `DB_USER` | Database username | - |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | `TeamSphere` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/TeamSphere` |
| `PORT` | Server port | `8080` |
| `JWT_SECRET` | JWT signing secret | - |

### CORS Configuration
Currently configured for:
- `localhost:3000` (React development server)
- Add your frontend URLs in `src/app/index.ts`

### Socket.IO Configuration
- JWT 토큰 기반 인증 (`accesstoken` 쿠키에서 추출)
- 자동 연결 및 재연결 지원
- 채팅방별 실시간 이벤트 관리

## 📚 API Documentation

### Base URL
```
http://localhost:8080/v1
```

### 🔐 Authentication Endpoints
```http
POST   /v1/auth/signup    # 회원가입
POST   /v1/auth/login     # 로그인
POST   /v1/auth/logout    # 로그아웃
GET    /v1/auth/me        # 현재 사용자 정보 조회
GET    /v1/auth/verify    # 토큰 검증
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

### 👤 User Profile Management
```http
GET    /v1/user/profile              # 현재 사용자 프로필 조회
POST   /v1/user/profile              # 새 프로필 생성
GET    /v1/user/profile/:profileId   # 특정 사용자 프로필 조회
PATCH  /v1/user/profile/:profileId   # 프로필 정보 수정
```

### 💬 Real-time Messaging System (MongoDB + Socket.IO)
```http
# 채팅방 관리
GET    /v1/user/rooms                                                   # 사용자 채팅방 목록 조회
GET    /v1/user/rooms/:roomId/messages                                  # 채팅방 메시지 목록 조회 (페이지네이션)
POST   /v1/user/rooms/:roomId/messages                                  # 새 메시지 전송
GET    /v1/user/rooms/:roomId/messages/:messageId                       # 특정 메시지 조회

# Socket.IO 실시간 이벤트
join_room      # 채팅방 입장
leave_room     # 채팅방 퇴장  
send_message   # 메시지 전송
room_updated   # 방 업데이트 (새 메시지 시 자동 발생)

# 메시지 관리
PUT    /v1/workspace/:workspaceId/message/messages/:messageId             # 메시지 수정
DELETE /v1/workspace/:workspaceId/message/messages/:messageId             # 메시지 삭제
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


### 📊 Key Features Summary

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
│   │   ├── mongodb.ts                         # MongoDB 연결 설정
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
