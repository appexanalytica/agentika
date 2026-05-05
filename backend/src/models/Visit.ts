import mongoose, { Schema, Document } from 'mongoose';

export interface IVisit extends Document {
  page: string;
  path: string;
  userAgent?: string;
  referrer?: string;
  ip?: string;
  timestamp: Date;
}

const VisitSchema = new Schema<IVisit>(
  {
    page: {
      type: String,
      required: [true, 'Page is required'],
    },
    path: {
      type: String,
      required: [true, 'Path is required'],
    },
    userAgent: {
      type: String,
      default: null,
    },
    referrer: {
      type: String,
      default: null,
    },
    ip: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries by date
VisitSchema.index({ timestamp: -1 });
VisitSchema.index({ page: 1, timestamp: -1 });

export default mongoose.model<IVisit>('Visit', VisitSchema);
