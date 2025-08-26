import mongoose, { Schema, Document } from 'mongoose';
import { MongoMessages } from '../interfaces/MongoMessages';

export interface MongoMessagesDocument extends Omit<MongoMessages, '_id'>, Document {}

const AttachmentSchema = new Schema({
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  }
}, { _id: false });

const MongoMessagesSchema = new Schema<MongoMessagesDocument>({
  roomId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'MongoRooms'
  },
  userId: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  replyToId: {
    type: Schema.Types.ObjectId,
    ref: 'MongoMessages',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    required: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  attachments: [AttachmentSchema]
});

// 인덱스 설정
MongoMessagesSchema.index({ roomId: 1, createdAt: -1 });
MongoMessagesSchema.index({ userId: 1 });
MongoMessagesSchema.index({ replyToId: 1 });
MongoMessagesSchema.index({ isDeleted: 1 });

// 메시지 수정 시 updatedAt과 isEdited 자동 설정
MongoMessagesSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  if (update.content) {
    this.set({ updatedAt: new Date(), isEdited: true });
  }
  next();
});

export const MongoMessagesModel = mongoose.model<MongoMessagesDocument>('MongoMessages', MongoMessagesSchema);
