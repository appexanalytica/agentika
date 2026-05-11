import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDeal extends Document {
  _id: Types.ObjectId;
  title: string;
  lead?: Types.ObjectId;
  contact?: Types.ObjectId;
  company?: Types.ObjectId;
  pipeline: Types.ObjectId;
  stage: Types.ObjectId;
  amount: number;
  currency: string;
  probability: number;
  expectedCloseDate?: Date;
  status: 'open' | 'won' | 'lost';
  assignedTo?: Types.ObjectId;
  createdBy: Types.ObjectId;
  productsOrServices?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  notes?: string;
  lostReason?: string;
  wonAt?: Date;
  lostAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DealSchema = new Schema<IDeal>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
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
    pipeline: {
      type: Schema.Types.ObjectId,
      ref: 'Pipeline',
      required: true,
    },
    stage: {
      type: Schema.Types.ObjectId,
      ref: 'PipelineStage',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    probability: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    expectedCloseDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['open', 'won', 'lost'],
      default: 'open',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productsOrServices: [{
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
    }],
    notes: {
      type: String,
      trim: true,
    },
    lostReason: {
      type: String,
      trim: true,
    },
    wonAt: {
      type: Date,
    },
    lostAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes
DealSchema.index({ stage: 1 });
DealSchema.index({ assignedTo: 1 });
DealSchema.index({ status: 1 });
DealSchema.index({ expectedCloseDate: 1 });

export default mongoose.model<IDeal>('Deal', DealSchema);
