import mongoose, { Schema, Document } from 'mongoose';

export interface IEmail extends Document {
  messageId: string;
  from: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
  date: Date;
  folder: string;
  read: boolean;
  direction: 'inbound' | 'outbound';
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
    contentId?: string;
  }>;
  inReplyTo?: string;
  references?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EmailSchema = new Schema<IEmail>(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: [String],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      default: '',
    },
    html: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      required: true,
    },
    folder: {
      type: String,
      enum: ['inbox', 'sent', 'drafts', 'archive', 'trash'],
      default: 'inbox',
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true,
      index: true,
    },
    attachments: [
      {
        filename: String,
        contentType: String,
        size: Number,
        contentId: String,
      },
    ],
    inReplyTo: {
      type: String,
    },
    references: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
EmailSchema.index({ folder: 1, date: -1 });
EmailSchema.index({ read: 1, folder: 1 });
EmailSchema.index({ direction: 1, date: -1 });

export const Email = mongoose.model<IEmail>('Email', EmailSchema);
