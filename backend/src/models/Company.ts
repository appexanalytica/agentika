import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICompany extends Document {
  _id: Types.ObjectId;
  name: string;
  legalName?: string;
  taxId?: string;
  website?: string;
  industry?: string;
  size?: string;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  notes?: string;
  owner?: Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    legalName: {
      type: String,
      trim: true,
    },
    taxId: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    tags: [{
      type: String,
      trim: true,
    }],
  },
  { timestamps: true }
);

// Indexes
CompanySchema.index({ name: 1 });
CompanySchema.index({ email: 1 });
CompanySchema.index({ owner: 1 });

export default mongoose.model<ICompany>('Company', CompanySchema);
