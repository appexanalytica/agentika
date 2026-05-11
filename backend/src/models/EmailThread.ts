import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEmailThread extends Document {
  _id: Types.ObjectId;
  subject: string;
  participants: string[];
  lead?: Types.ObjectId;
  contact?: Types.ObjectId;
  company?: Types.ObjectId;
  deal?: Types.ObjectId;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailThreadSchema = new Schema<IEmailThread>(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    participants: [{
      type: String,
    }],
    lead: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
    },
    contact: {
      type: Schema.Types.ObjectId,
      ref: 'Contact',
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
    deal: {
      type: Schema.Types.ObjectId,
      ref: 'Deal',
    },
    lastMessageAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes
EmailThreadSchema.index({ participants: 1 });
EmailThreadSchema.index({ lead: 1 });
EmailThreadSchema.index({ contact: 1 });
EmailThreadSchema.index({ lastMessageAt: -1 });

export default mongoose.model<IEmailThread>('EmailThread', EmailThreadSchema);
