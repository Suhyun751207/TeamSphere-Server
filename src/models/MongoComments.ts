import mongoose, { Schema, Document } from 'mongoose';
import { MongoComments } from '@interfaces/MongoComments';

export interface MongoCommentsDocument extends Omit<MongoComments, 'id'>, Document {
  id: number;
}

import { Counter } from '@models/MongoTask';

const MongoCommentsSchema = new Schema<MongoCommentsDocument>({
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
  parent_id: { 
    type: Number,
    index: true,
    default: null
  },
  content: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'comments',
  versionKey: false
});

MongoCommentsSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'comment_id',
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

MongoCommentsSchema.index({ task_id: 1, created_at: -1 });
MongoCommentsSchema.index({ member_id: 1, created_at: -1 });
MongoCommentsSchema.index({ parent_id: 1, created_at: 1 });

export const MongoCommentsModel = mongoose.model<MongoCommentsDocument>('Comments', MongoCommentsSchema);
