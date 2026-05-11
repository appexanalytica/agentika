import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPipelineStage extends Document {
  _id: Types.ObjectId;
  pipeline: Types.ObjectId;
  name: string;
  order: number;
  probability: number;
  color?: string;
  isWon: boolean;
  isLost: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PipelineStageSchema = new Schema<IPipelineStage>(
  {
    pipeline: {
      type: Schema.Types.ObjectId,
      ref: 'Pipeline',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
    },
    probability: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    isWon: {
      type: Boolean,
      default: false,
    },
    isLost: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
PipelineStageSchema.index({ pipeline: 1, order: 1 });

export default mongoose.model<IPipelineStage>('PipelineStage', PipelineStageSchema);
