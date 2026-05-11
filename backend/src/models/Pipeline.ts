import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPipeline extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  isDefault: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PipelineSchema = new Schema<IPipeline>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes
PipelineSchema.index({ createdBy: 1 });
PipelineSchema.index({ isDefault: 1 });

export default mongoose.model<IPipeline>('Pipeline', PipelineSchema);
