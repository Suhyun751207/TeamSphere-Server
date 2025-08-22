import mongoose, { Schema, Document } from 'mongoose';
import { MongoComments } from '@interfaces/MongoComments.ts';

export interface MongoCommentsDocument extends Omit<MongoComments, '_id'>, Document {}

const AttachmentSchema = new Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const EditHistorySchema = new Schema({
  content: { type: String, required: true },
  editedAt: { type: Date, default: Date.now }
}, { _id: false });

const MongoCommentsSchema = new Schema<MongoCommentsDocument>({
  taskId: { 
    type: String, 
    required: true,
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
    maxlength: 1000
  },
  parentCommentId: { 
    type: String,
    index: true,
    default: null
  },
  mentions: [{ 
    type: Number,
    index: true
  }],
  attachments: [AttachmentSchema],
  isEdited: { 
    type: Boolean, 
    default: false 
  },
  editHistory: [EditHistorySchema]
}, {
  timestamps: true,
  collection: 'comments'
});

// 인덱스 설정
MongoCommentsSchema.index({ taskId: 1, createdAt: -1 });
MongoCommentsSchema.index({ userId: 1, createdAt: -1 });
MongoCommentsSchema.index({ parentCommentId: 1, createdAt: 1 });
MongoCommentsSchema.index({ mentions: 1 });

export const MongoCommentsModel = mongoose.model<MongoCommentsDocument>('Comments', MongoCommentsSchema);
