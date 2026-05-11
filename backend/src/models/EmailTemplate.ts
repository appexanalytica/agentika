import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEmailTemplate extends Document {
  _id: Types.ObjectId;
  name: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  category?: string;
  variables: Array<{
    name: string;
    description?: string;
    required: boolean;
  }>;
  createdBy: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    htmlBody: {
      type: String,
      required: true,
    },
    textBody: {
      type: String,
    },
    category: {
      type: String,
      trim: true,
    },
    variables: [{
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      required: {
        type: Boolean,
        default: false,
      },
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes
EmailTemplateSchema.index({ createdBy: 1 });
EmailTemplateSchema.index({ category: 1 });
EmailTemplateSchema.index({ isActive: 1 });

export default mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);
