import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILead extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  position?: string;
  source: 'website' | 'referral' | 'ads' | 'linkedin' | 'email' | 'manual' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  interest: 'software_factory' | 'crm' | 'erp' | 'ecommerce' | 'automation' | 'ai_agents' | 'consulting' | 'other';
  budgetRange?: string;
  expectedStartDate?: Date;
  message?: string;
  notes?: string;
  assignedTo?: Types.ObjectId;
  createdBy?: Types.ObjectId;
  lastContactAt?: Date;
  nextFollowUpAt?: Date;
  lostReason?: string;
  tags: string[];
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
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
    companyName: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: ['website', 'referral', 'ads', 'linkedin', 'email', 'manual', 'other'],
      default: 'manual',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'archived'],
      default: 'new',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    interest: {
      type: String,
      enum: ['software_factory', 'crm', 'erp', 'ecommerce', 'automation', 'ai_agents', 'consulting', 'other'],
      default: 'other',
    },
    budgetRange: {
      type: String,
    },
    expectedStartDate: {
      type: Date,
    },
    message: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    lastContactAt: {
      type: Date,
    },
    nextFollowUpAt: {
      type: Date,
    },
    lostReason: {
      type: String,
      trim: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    customFields: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Indexes
LeadSchema.index({ email: 1 });
LeadSchema.index({ phone: 1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ source: 1 });
LeadSchema.index({ assignedTo: 1 });
LeadSchema.index({ nextFollowUpAt: 1 });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ tags: 1 });

// Virtual for fullName
LeadSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export default mongoose.model<ILead>('Lead', LeadSchema);
