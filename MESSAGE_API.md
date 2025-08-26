# TeamSphere Message API Documentation

## Overview
TeamSphere 메시지 시스템은 MongoDB와 Redis를 활용하여 실시간 채팅 기능을 제공합니다. 3가지 타입의 채팅방을 지원합니다:
- **DM (Direct Message)**: 1:1 개인 메시지
- **Workspace**: 워크스페이스 전체 채팅
- **Team**: 팀별 채팅

## Database Schema

### MongoDB Collections

#### Rooms Collection
```json
{
  "_id": "ObjectId",
  "type": "dm" | "workspace" | "team",
  "chatId": "number", // MySQL의 관련 ID
  "participants": ["number"], // users.id 배열
  "name": "string", // 선택적 (워크스페이스/팀만)
  "createdAt": "Date",
  "updatedAt": "Date",
  "lastMessage": {
    "messageId": "ObjectId",
    "content": "string",
    "createdAt": "Date",
    "userId": "number"
  }
}
```

#### Messages Collection
```json
{
  "_id": "ObjectId",
  "roomId": "ObjectId", // rooms._id 참조
  "userId": "number", // MySQL users.id
  "content": "string",
  "messageType": "text" | "image" | "file" | "system",
  "replyToId": "ObjectId", // 답글 참조 (선택적)
  "createdAt": "Date",
  "updatedAt": "Date",
  "isDeleted": "boolean",
  "isEdited": "boolean",
  "attachments": [{
    "fileName": "string",
    "fileUrl": "string",
    "fileSize": "number",
    "mimeType": "string"
  }]
}
```

## API Endpoints

### 1. DM (Direct Message) API
**Base URL**: `/v1/user/message`

#### 1.1 DM 채팅방 생성/조회
```http
POST /v1/user/message/rooms
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetUserId": 123
}
```

**Response**:
```json
{
  "_id": "64f...",
  "type": "dm",
  "chatId": 5,
  "participants": [5, 123],
  "createdAt": "2025-08-26T10:00:00Z",
  "updatedAt": "2025-08-26T10:00:00Z"
}
```

#### 1.2 DM 채팅방 목록 조회
```http
GET /v1/user/message/rooms?page=1&limit=20
Authorization: Bearer <token>
```

#### 1.3 특정 DM 채팅방 조회
```http
GET /v1/user/message/rooms/:roomId
Authorization: Bearer <token>
```

#### 1.4 DM 메시지 전송
```http
POST /v1/user/message/rooms/:roomId/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "안녕하세요!",
  "messageType": "text",
  "replyToId": "64f...", // 선택적
  "attachments": [{ // 선택적
    "fileName": "image.jpg",
    "fileUrl": "https://...",
    "fileSize": 1024,
    "mimeType": "image/jpeg"
  }]
}
```

#### 1.5 DM 메시지 목록 조회
```http
GET /v1/user/message/rooms/:roomId/messages?page=1&limit=50
Authorization: Bearer <token>
```

#### 1.6 DM 메시지 수정
```http
PUT /v1/user/message/messages/:messageId
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "수정된 메시지"
}
```

#### 1.7 DM 메시지 삭제
```http
DELETE /v1/user/message/messages/:messageId
Authorization: Bearer <token>
```

### 2. Workspace Message API
**Base URL**: `/v1/workspace/:workspaceId/message`

#### 2.1 워크스페이스 채팅방 생성/조회
```http
POST /v1/workspace/:workspaceId/message/rooms
Authorization: Bearer <token>
```

#### 2.2 워크스페이스 채팅방 조회
```http
GET /v1/workspace/:workspaceId/message/rooms
Authorization: Bearer <token>
```

#### 2.3 워크스페이스 메시지 전송
```http
POST /v1/workspace/:workspaceId/message/rooms/:roomId/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "워크스페이스 메시지",
  "messageType": "text"
}
```

#### 2.4 워크스페이스 메시지 목록 조회
```http
GET /v1/workspace/:workspaceId/message/rooms/:roomId/messages?page=1&limit=50
Authorization: Bearer <token>
```

#### 2.5 워크스페이스 메시지 수정/삭제
```http
PUT /v1/workspace/:workspaceId/message/messages/:messageId
DELETE /v1/workspace/:workspaceId/message/messages/:messageId
Authorization: Bearer <token>
```

### 3. Team Message API
**Base URL**: `/v1/workspace/:workspaceId/teams/:teamId/message`

#### 3.1 팀 채팅방 생성/조회
```http
POST /v1/workspace/:workspaceId/teams/:teamId/message/rooms
Authorization: Bearer <token>
```

#### 3.2 팀 채팅방 조회
```http
GET /v1/workspace/:workspaceId/teams/:teamId/message/rooms
Authorization: Bearer <token>
```

#### 3.3 팀 메시지 전송
```http
POST /v1/workspace/:workspaceId/teams/:teamId/message/rooms/:roomId/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "팀 메시지",
  "messageType": "text"
}
```

#### 3.4 팀 메시지 목록 조회
```http
GET /v1/workspace/:workspaceId/teams/:teamId/message/rooms/:roomId/messages?page=1&limit=50
Authorization: Bearer <token>
```

#### 3.5 팀 메시지 수정/삭제
```http
PUT /v1/workspace/:workspaceId/teams/:teamId/message/messages/:messageId
DELETE /v1/workspace/:workspaceId/teams/:teamId/message/messages/:messageId
Authorization: Bearer <token>
```

## Real-time Features (Redis Pub/Sub)

### Redis Channels
- **Room Channel**: `room:{roomId}` - 특정 채팅방의 실시간 메시지
- **User Channel**: `user:{userId}` - 사용자별 알림

### Message Events
```json
{
  "type": "new_message",
  "message": {
    "_id": "64f...",
    "roomId": "64f...",
    "userId": 123,
    "content": "새 메시지",
    "messageType": "text",
    "createdAt": "2025-08-26T10:00:00Z"
  },
  "timestamp": "2025-08-26T10:00:00Z"
}
```

## Error Responses

### Common Error Codes
- `400` - Bad Request (잘못된 요청 데이터)
- `401` - Unauthorized (인증 실패)
- `403` - Forbidden (권한 없음)
- `404` - Not Found (리소스 없음)
- `500` - Internal Server Error (서버 오류)

### Error Response Format
```json
{
  "error": "Error message description"
}
```

## Authentication
모든 API는 JWT 토큰 기반 인증이 필요합니다.
```http
Authorization: Bearer <your_jwt_token>
```

## Pagination
목록 조회 API는 페이지네이션을 지원합니다:
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20-50)

### Pagination Response Format
```json
{
  "messages": [...],
  "total": 100,
  "page": 1,
  "totalPages": 5
}
```

## Environment Variables
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/TeamSphere

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key

# Server
PORT=8080
```

## Setup Instructions

1. **MongoDB 설치 및 실행**
2. **Redis 설치 및 실행**
3. **환경변수 설정** (`.env` 파일 생성)
4. **의존성 설치**: `npm install`
5. **서버 실행**: `npm run dev`

## Features

### ✅ 구현 완료
- MongoDB 기반 메시지 영구 저장
- Redis 기반 실시간 메시지 전송
- 3가지 타입 채팅방 (DM, Workspace, Team)
- 메시지 CRUD 작업
- 첨부파일 지원
- 답글 기능
- 페이지네이션
- 권한 기반 접근 제어

### 🔄 향후 확장 가능
- 메시지 검색 기능
- 메시지 읽음 상태
- 파일 업로드 처리
- 푸시 알림
- 메시지 암호화
- 채팅방 설정 관리
