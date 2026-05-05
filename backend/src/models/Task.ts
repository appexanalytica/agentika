import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'pendiente' | 'en_curso' | 'hecho';
  priority: 'alta' | 'media' | 'baja';
  dueDate: Date;
  assignedTo?: mongoose.Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    description: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pendiente', 'en_curso', 'hecho'],
      default: 'pendiente',
    },
    priority: {
      type: String,
      enum: ['alta', 'media', 'baja'],
      default: 'media',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    tags: [
      {
        type: String,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITask>('Task', TaskSchema);
