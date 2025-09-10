import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '@utils/jwt';
import messageService from '@services/message';
import roomsService from '@services/Rooms';
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

// Track online users per room
const onlineUsers = new Map<number, Set<number>>(); // roomId -> Set of userIds

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
      next();
    } catch (error) {
      console.error('Socket.IO authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {

    // Join a room for real-time messaging
    socket.on('join_room', (data: JoinRoomData) => {
      const { roomId } = data;
      const roomKey = `room_${roomId}`;

      socket.join(roomKey);

      // Track online user
      if (!onlineUsers.has(roomId)) {
        onlineUsers.set(roomId, new Set());
      }
      onlineUsers.get(roomId)!.add(socket.userId!);

      // Notify other users in the room that someone joined
      socket.to(roomKey).emit('user_joined', {
        userId: socket.userId,
        roomId: roomId,
        timestamp: new Date()
      });

      // Send current online users to the joining user
      socket.emit('online_users', {
        roomId: roomId,
        onlineUsers: Array.from(onlineUsers.get(roomId) || [])
      });
    });

    // Leave a room
    socket.on('leave_room', (data: JoinRoomData) => {
      const { roomId } = data;
      const roomKey = `room_${roomId}`;

      socket.leave(roomKey);

      // Remove user from online tracking
      if (onlineUsers.has(roomId)) {
        onlineUsers.get(roomId)!.delete(socket.userId!);
        if (onlineUsers.get(roomId)!.size === 0) {
          onlineUsers.delete(roomId);
        }
      }

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

          // Update rooms table with lastMessageId
          try {
            const room = await roomsService.readIdPatch(roomId);
            if (room && room.length > 0) {
              const updateData = {
                roomId: roomId,
                workspaceId: room[0].workspaceId,
                lastMessageId: result.insertId,
                type: room[0].type || "WORKSPACE",
                title: room[0].title || null
              };
              await roomsService.update(roomId, updateData);
              console.log(`Updated room ${roomId} lastMessageId to ${result.insertId}`);
            }
          } catch (updateError) {
            console.error('Failed to update room lastMessageId:', updateError);
          }

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

          // Emit to all users in the room EXCEPT the sender
          const roomKey = `room_${roomId}`;
          socket.to(roomKey).emit('new_message', messageResponse);

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

      // Remove user from all rooms' online tracking
      for (const [roomId, users] of onlineUsers.entries()) {
        if (users.has(socket.userId!)) {
          users.delete(socket.userId!);
          if (users.size === 0) {
            onlineUsers.delete(roomId);
          }

          // Notify room members that user went offline
          const roomKey = `room_${roomId}`;
          socket.to(roomKey).emit('user_offline', {
            userId: socket.userId,
            roomId: roomId,
            timestamp: new Date()
          });
        }
      }

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

// Get online users for a specific room
export const getOnlineUsers = (roomId: number): number[] => {
  return Array.from(onlineUsers.get(roomId) || []);
};

export { io };
