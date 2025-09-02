import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '@utils/jwt';
import messageService from '@services/message';
import { MessageType } from '@services/ENUM/message_ENUM';

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

interface JoinRoomData {
  roomId: number;
}

interface SendMessageData {
  roomId: number;
  content: string;
  type?: MessageType;
}

interface MessageResponse {
  id: number;
  roomId: number;
  userId: number;
  type: MessageType;
  content: string;
  imagePath: string | null;
  isEdited: boolean;
  isValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

let io: SocketIOServer;

export const initializeSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket: any, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = verifyToken(token);
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
    
    // Join a room for real-time messaging
    socket.on('join_room', (data: JoinRoomData) => {
      const { roomId } = data;
      const roomKey = `room_${roomId}`;
      
      socket.join(roomKey);
      console.log(`User ${socket.userId} joined room ${roomId}`);
      
      // Notify other users in the room that someone joined
      socket.to(roomKey).emit('user_joined', {
        userId: socket.userId,
        roomId: roomId,
        timestamp: new Date()
      });
    });

    // Leave a room
    socket.on('leave_room', (data: JoinRoomData) => {
      const { roomId } = data;
      const roomKey = `room_${roomId}`;
      
      socket.leave(roomKey);
      console.log(`User ${socket.userId} left room ${roomId}`);
      
      // Notify other users in the room that someone left
      socket.to(roomKey).emit('user_left', {
        userId: socket.userId,
        roomId: roomId,
        timestamp: new Date()
      });
    });

    // Handle sending messages
    socket.on('send_message', async (data: SendMessageData) => {
      try {
        const { roomId, content, type = 'TEXT' } = data;
        
        if (!socket.userId) {
          socket.emit('message_error', { error: 'User not authenticated' });
          return;
        }

        // Save message to MySQL database using existing service
        const messageData = {
          roomId,
          userId: socket.userId,
          type,
          content: content.trim(),
          imagePath: null,
          isEdited: false,
          isValid: true
        };

        const result = await messageService.create(messageData);
        
        if (result.insertId) {
          // Fetch the created message with full details
          const createdMessage = await messageService.readId(result.insertId);
          
          const messageResponse: MessageResponse = {
            id: createdMessage.id,
            roomId: createdMessage.roomId,
            userId: createdMessage.userId,
            type: createdMessage.type,
            content: createdMessage.content,
            imagePath: createdMessage.imagePath,
            isEdited: createdMessage.isEdited,
            isValid: createdMessage.isValid,
            createdAt: createdMessage.createdAt,
            updatedAt: createdMessage.updatedAt
          };

          // Emit to all users in the room (including sender)
          const roomKey = `room_${roomId}`;
          io.to(roomKey).emit('new_message', messageResponse);
          
          // Emit room update event for room list updates
          io.emit('room_updated', {
            roomId: roomId,
            lastMessageId: result.insertId,
            lastMessage: {
              id: result.insertId,
              content: createdMessage.content,
              userId: createdMessage.userId,
              createdAt: createdMessage.createdAt
            },
            timestamp: new Date()
          });
          
          console.log(`Message ${result.insertId} sent to room ${roomId} by user ${socket.userId}`);
        } else {
          socket.emit('message_error', { error: 'Failed to save message' });
        }
      } catch (error) {
        console.error('Error handling send_message:', error);
        socket.emit('message_error', { 
          error: 'Failed to send message',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle typing indicators (optional feature)
    socket.on('typing_start', (data: JoinRoomData) => {
      const { roomId } = data;
      const roomKey = `room_${roomId}`;
      
      socket.to(roomKey).emit('user_typing', {
        userId: socket.userId,
        roomId: roomId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data: JoinRoomData) => {
      const { roomId } = data;
      const roomKey = `room_${roomId}`;
      
      socket.to(roomKey).emit('user_typing', {
        userId: socket.userId,
        roomId: roomId,
        isTyping: false
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      
      // Notify all rooms that this user has disconnected
      socket.broadcast.emit('user_disconnected', {
        userId: socket.userId,
        timestamp: new Date()
      });
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
