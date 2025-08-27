import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

let io: SocketIOServer;

export const initializeSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "http://localhost:3000", // React 앱 URL
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // JWT 인증 미들웨어
  io.use((socket: any, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // JWT 토큰 검증
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      socket.userId = decoded.userId;
      console.log(`User ${decoded.userId} authenticated via Socket.IO`);
      next();
    } catch (error) {
      console.error('Socket.IO authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected`);
    
    // 사용자별 개인 룸에 참여 (새 방 생성 알림용)
    socket.join(`user_${socket.userId}`);

    // 채팅방 참여
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room ${roomId}`);
    });

    // 채팅방 나가기
    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId);
      console.log(`User ${socket.userId} left room ${roomId}`);
    });

    // 메시지 전송
    socket.on('send-message', (data: {
      roomId: string;
      content: string;
      messageId: string;
    }) => {
      // 같은 방의 다른 사용자들에게 메시지 전송
      socket.to(data.roomId).emit('new-message', {
        _id: data.messageId,
        roomId: data.roomId,
        userId: socket.userId,
        content: data.content,
        createdAt: new Date(),
        isEdited: false
      });
    });

    // 연결 해제
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
};

export const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export { io };
