import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEmailAccount extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  provider: 'smtp_imap' | 'outlook' | 'gmail' | 'custom';
  email: string;
  displayName?: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassEncrypted: string;
  imapHost: string;
  imapPort: number;
  imapSecure: boolean;
  imapUser: string;
  imapPassEncrypted: string;
  isActive: boolean;
  lastSyncAt?: Date;
  syncStatus: 'idle' | 'syncing' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

const EmailAccountSchema = new Schema<IEmailAccount>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      enum: ['smtp_imap', 'outlook', 'gmail', 'custom'],
      default: 'smtp_imap',
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    smtpHost: {
      type: String,
      required: true,
    },
    smtpPort: {
      type: Number,
      required: true,
    },
    smtpSecure: {
      type: Boolean,
      default: false,
    },
    smtpUser: {
      type: String,
      required: true,
    },
    smtpPassEncrypted: {
      type: String,
      required: true,
    },
    imapHost: {
      type: String,
      required: true,
    },
    imapPort: {
      type: Number,
      required: true,
    },
    imapSecure: {
      type: Boolean,
      default: true,
    },
    imapUser: {
      type: String,
      required: true,
    },
    imapPassEncrypted: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSyncAt: {
      type: Date,
    },
    syncStatus: {
      type: String,
      enum: ['idle', 'syncing', 'error'],
      default: 'idle',
    },
  },
  { timestamps: true }
);

// Indexes
EmailAccountSchema.index({ user: 1 });
EmailAccountSchema.index({ email: 1 });

export default mongoose.model<IEmailAccount>('EmailAccount', EmailAccountSchema);
