import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEmailMessage extends Document {
  _id: Types.ObjectId;
  account: Types.ObjectId;
  thread?: Types.ObjectId;
  direction: 'inbound' | 'outbound';
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  textBody?: string;
  htmlBody?: string;
  attachments: Array<{
    filename: string;
    size: number;
    mediaAsset?: Types.ObjectId;
  }>;
  messageId: string;
  inReplyTo?: string;
  references?: string[];
  sentAt?: Date;
  receivedAt?: Date;
  readAt?: Date;
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
  relatedToType?: string;
  relatedToId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmailMessageSchema = new Schema<IEmailMessage>(
  {
    account: {
      type: Schema.Types.ObjectId,
      ref: 'EmailAccount',
      required: true,
    },
    thread: {
      type: Schema.Types.ObjectId,
      ref: 'EmailThread',
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: [{
      type: String,
      required: true,
    }],
    cc: [{
      type: String,
    }],
    bcc: [{
      type: String,
    }],
    subject: {
      type: String,
      required: true,
    },
    textBody: {
      type: String,
    },
    htmlBody: {
      type: String,
    },
    attachments: [{
      filename: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
      mediaAsset: {
        type: Schema.Types.ObjectId,
        ref: 'MediaAsset',
      },
    }],
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    inReplyTo: {
      type: String,
    },
    references: [{
      type: String,
    }],
    sentAt: {
      type: Date,
    },
    receivedAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    labels: [{
      type: String,
    }],
    relatedToType: {
      type: String,
    },
    relatedToId: {
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

// Indexes
EmailMessageSchema.index({ messageId: 1 });
EmailMessageSchema.index({ thread: 1 });
EmailMessageSchema.index({ from: 1 });
EmailMessageSchema.index({ to: 1 });
EmailMessageSchema.index({ sentAt: -1 });
EmailMessageSchema.index({ receivedAt: -1 });

export default mongoose.model<IEmailMessage>('EmailMessage', EmailMessageSchema);
