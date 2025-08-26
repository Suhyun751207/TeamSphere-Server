import mongoose, { Schema, Document } from 'mongoose';
import { Messages } from '@interfaces/Messages.ts';
import { Message } from '@interfaces/Message.ts';

export interface MessagesDocument extends Omit<Messages, 'id'>, Document {
  id: number;
}

export interface MessageDocument extends Omit<Message, 'id'>, Document {
  id: number;
}

// Counter 모델 재사용 (MongoTask.ts에서 정의된 것)
import { Counter } from '@models/MongoTask.ts';

// Messages 스키마 (채팅방)
const MessagesSchema = new Schema<MessagesDocument>({
  id: { 
    type: Number, 
    unique: true,
    index: true
  },
  chatType: { 
    type: String, 
    required: true,
    enum: ['workspace', 'team', 'dm'],
    index: true
  },
  chatId: { 
    type: Number, 
    required: true,
    index: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  collection: 'messages',
  versionKey: false
});

// Message 스키마 (개별 메시지)
const MessageSchema = new Schema<MessageDocument>({
  id: { 
    type: Number, 
    unique: true,
    index: true
  },
  userId: { 
    type: Number, 
    required: true,
    index: true 
  },
  content: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 2000
  },
  messageType: { 
    type: String,
    enum: ['text', 'file', 'image'],
    default: 'text'
  },
  replyToId: { 
    type: Number,
    index: true,
    default: null
  },
  updatedAt: { 
    type: Date,
    default: null
  },
  isDeleted: { 
    type: Number,
    default: 0,
    index: true
  },
  isEdited: { 
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false },
  collection: 'message',
  versionKey: false
});

// Auto-increment 미들웨어 - Messages
MessagesSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'messages_id',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      ) as any;
      this.id = counter?.seq || 1;
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

// Auto-increment 미들웨어 - Message
MessageSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'message_id',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      ) as any;
      this.id = counter?.seq || 1;
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

// 인덱스 설정 - Messages
MessagesSchema.index({ chatType: 1, chatId: 1 });
MessagesSchema.index({ createdAt: -1 });

// 인덱스 설정 - Message
MessageSchema.index({ messagesId: 1, createdAt: -1 });
MessageSchema.index({ userId: 1, createdAt: -1 });
MessageSchema.index({ replyToId: 1, createdAt: 1 });
MessageSchema.index({ isDeleted: 1, createdAt: -1 });

export const MessagesModel = mongoose.model<MessagesDocument>('Messages', MessagesSchema);
export const MessageModel = mongoose.model<MessageDocument>('Message', MessageSchema);
