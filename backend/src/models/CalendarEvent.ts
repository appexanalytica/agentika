import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICalendarEvent extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  type: 'meeting' | 'call' | 'demo' | 'internal' | 'deadline' | 'other';
  startAt: Date;
  endAt: Date;
  timezone?: string;
  location?: string;
  meetingUrl?: string;
  attendees: Array<{
    user: Types.ObjectId;
    status: 'accepted' | 'declined' | 'tentative' | 'pending';
  }>;
  assignedTo?: Types.ObjectId;
  createdBy: Types.ObjectId;
  relatedToType?: 'lead' | 'contact' | 'company' | 'deal' | 'none';
  relatedToId?: Types.ObjectId;
  status: 'scheduled' | 'completed' | 'cancelled';
  reminderAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
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
      enum: ['meeting', 'call', 'demo', 'internal', 'deadline', 'other'],
      default: 'other',
    },
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      required: true,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    location: {
      type: String,
      trim: true,
    },
    meetingUrl: {
      type: String,
      trim: true,
    },
    attendees: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      status: {
        type: String,
        enum: ['accepted', 'declined', 'tentative', 'pending'],
        default: 'pending',
      },
    }],
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
      enum: ['lead', 'contact', 'company', 'deal', 'none'],
      default: 'none',
    },
    relatedToId: {
      type: Schema.Types.ObjectId,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    reminderAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes
CalendarEventSchema.index({ startAt: 1 });
CalendarEventSchema.index({ assignedTo: 1 });
CalendarEventSchema.index({ status: 1 });

export default mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
