import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IContact extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  company?: Types.ObjectId;
  source?: string;
  owner?: Types.ObjectId;
  lifecycleStage: 'lead' | 'prospect' | 'customer' | 'partner' | 'inactive';
  notes?: string;
  tags: string[];
  lastContactAt?: Date;
  nextFollowUpAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
    source: {
      type: String,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    lifecycleStage: {
      type: String,
      enum: ['lead', 'prospect', 'customer', 'partner', 'inactive'],
      default: 'lead',
    },
    notes: {
      type: String,
      trim: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    lastContactAt: {
      type: Date,
    },
    nextFollowUpAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes
ContactSchema.index({ email: 1 });
ContactSchema.index({ company: 1 });
ContactSchema.index({ owner: 1 });
ContactSchema.index({ lifecycleStage: 1 });

// Virtual for fullName
ContactSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export default mongoose.model<IContact>('Contact', ContactSchema);
