import mongoose, { Schema, Document } from 'mongoose';
import { MongoTask } from '@interfaces/MongoTask.ts';
import { task_states_enum } from '@services/ENUM/task_states_enum.ts';
import { task_priority_enum } from '@services/ENUM/task_priority_enum.ts';

export interface MongoTaskDocument extends Omit<MongoTask, '_id'>, Document {}

const AttachmentSchema = new Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const MongoTaskSchema = new Schema<MongoTaskDocument>({
  workspaceTeamUserId: { 
    type: Number, 
    required: true,
    index: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 2000
  },
  state: { 
    type: String, 
    required: true,
    enum: task_states_enum,
    default: 'To Do'
  },
  priority: { 
    type: String, 
    required: true,
    enum: task_priority_enum,
    default: 'Medium'
  },
  dueDate: { 
    type: Date,
    index: true
  },
  assignedTo: [{ 
    type: Number,
    index: true
  }],
  createdBy: { 
    type: Number, 
    required: true,
    index: true
  },
  tags: [{ 
    type: String,
    trim: true,
    maxlength: 50
  }],
  attachments: [AttachmentSchema]
}, {
  timestamps: true,
  collection: 'tasks'
});

// 인덱스 설정
MongoTaskSchema.index({ workspaceTeamUserId: 1, state: 1 });
MongoTaskSchema.index({ assignedTo: 1, dueDate: 1 });
MongoTaskSchema.index({ createdBy: 1, createdAt: -1 });
MongoTaskSchema.index({ tags: 1 });

export const MongoTaskModel = mongoose.model<MongoTaskDocument>('Task', MongoTaskSchema);
