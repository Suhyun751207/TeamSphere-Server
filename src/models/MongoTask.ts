import mongoose, { Schema, Document } from 'mongoose';
import { MongoTask } from '@interfaces/MongoTask';

export interface MongoTaskDocument extends Omit<MongoTask, 'id'>, Document {
  id: number;
}

const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const MongoTaskSchema = new Schema<MongoTaskDocument>({
  id: { 
    type: Number, 
    unique: true,
    index: true
  },
  task_id: { 
    type: Number, 
    required: true,
    index: true 
  },
  workspace_team_user_id: {
    type: Number,
    required: true,
    index: true
  },
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 128
  },
  content: { 
    type: String, 
    trim: true,
    maxlength: 2048
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  priority: {
    type: String,
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  tags: [{ 
    type: String,
    trim: true,
    maxlength: 50
  }],
  attachments_path: [{ 
    type: String,
    trim: true
  }]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'tasks',
  versionKey: false
});

MongoTaskSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'task_id',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.id = counter.seq;
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

MongoTaskSchema.index({ task_id: 1 });
MongoTaskSchema.index({ workspace_team_user_id: 1 });
MongoTaskSchema.index({ status: 1 });
MongoTaskSchema.index({ priority: 1 });
MongoTaskSchema.index({ created_at: -1 });
MongoTaskSchema.index({ tags: 1 });
MongoTaskSchema.index({ workspace_team_user_id: 1, status: 1 });
MongoTaskSchema.index({ workspace_team_user_id: 1, priority: 1 });

export const MongoTaskModel = mongoose.model<MongoTaskDocument>('Task', MongoTaskSchema);
export { Counter };
