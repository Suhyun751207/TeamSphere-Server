import mongoose, { Schema, Document } from 'mongoose';
import { MongoReadStatus } from '../interfaces/MongoReadStatus';

export interface MongoReadStatusDocument extends Omit<MongoReadStatus, '_id'>, Document {}

const MongoReadStatusSchema = new Schema<MongoReadStatusDocument>({
  roomId: {
    type: String,
    required: true,
    ref: 'MongoRooms'
  },
  userId: {
    type: Number,
    required: true
  },
  lastReadMessageId: {
    type: String,
    required: true,
    ref: 'MongoMessages'
  },
  lastReadAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 인덱스 설정 - 사용자별 방의 읽음 상태는 유니크
MongoReadStatusSchema.index({ roomId: 1, userId: 1 }, { unique: true });
MongoReadStatusSchema.index({ userId: 1 });
MongoReadStatusSchema.index({ roomId: 1 });

// 업데이트 시 updatedAt 자동 갱신
MongoReadStatusSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

MongoReadStatusSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

export const MongoReadStatusModel = mongoose.model<MongoReadStatusDocument>('MongoReadStatus', MongoReadStatusSchema);
