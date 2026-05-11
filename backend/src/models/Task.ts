import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'follow_up' | 'proposal' | 'internal' | 'other';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  completedAt?: Date;
  assignedTo?: Types.ObjectId;
  createdBy: Types.ObjectId;
  relatedToType?: 'lead' | 'contact' | 'company' | 'deal' | 'blog' | 'none';
  relatedToId?: Types.ObjectId;
  reminderAt?: Date;
  recurrence?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'follow_up', 'proposal', 'internal', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled', 'overdue'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    relatedToType: {
      type: String,
      enum: ['lead', 'contact', 'company', 'deal', 'blog', 'none'],
      default: 'none',
    },
    relatedToId: {
      type: Schema.Types.ObjectId,
    },
    reminderAt: {
      type: Date,
    },
    recurrence: {
      type: String,
    },
    tags: [{
      type: String,
      trim: true,
    }],
  },
  { timestamps: true }
);

// Indexes
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ relatedToType: 1, relatedToId: 1 });

export default mongoose.model<ITask>('Task', TaskSchema);
