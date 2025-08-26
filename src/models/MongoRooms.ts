import mongoose, { Schema, Document } from 'mongoose';
import { MongoRooms } from '../interfaces/MongoRooms';

export interface MongoRoomsDocument extends Omit<MongoRooms, '_id'>, Document {}

const LastMessageSchema = new Schema({
  messageId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'MongoMessages'
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true
  },
  userId: {
    type: Number,
    required: true
  }
}, { _id: false });

const MongoRoomsSchema = new Schema<MongoRoomsDocument>({
  type: {
    type: String,
    enum: ['dm', 'workspace', 'team'],
    required: true
  },
  chatId: {
    type: Number,
    required: true
  },
  participants: [{
    type: Number,
    required: true
  }],
  name: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastMessage: {
    type: LastMessageSchema,
    required: false
  }
});

// 인덱스 설정
MongoRoomsSchema.index({ type: 1, chatId: 1 }, { unique: true });
MongoRoomsSchema.index({ participants: 1 });
MongoRoomsSchema.index({ 'lastMessage.createdAt': -1 });

// 업데이트 시 updatedAt 자동 갱신
MongoRoomsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

MongoRoomsSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

export const MongoRoomsModel = mongoose.model<MongoRoomsDocument>('MongoRooms', MongoRoomsSchema);
