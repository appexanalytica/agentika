import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMediaAsset extends Document {
  _id: Types.ObjectId;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  bucket: string;
  objectKey: string;
  publicUrl: string;
  uploadedBy: Types.ObjectId;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  usageType: 'blog' | 'avatar' | 'og' | 'attachment' | 'general';
  relatedToType?: string;
  relatedToId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    bucket: {
      type: String,
      required: true,
    },
    objectKey: {
      type: String,
      required: true,
    },
    publicUrl: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    alt: {
      type: String,
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    usageType: {
      type: String,
      enum: ['blog', 'avatar', 'og', 'attachment', 'general'],
      default: 'general',
    },
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
MediaAssetSchema.index({ uploadedBy: 1 });
MediaAssetSchema.index({ usageType: 1 });
MediaAssetSchema.index({ relatedToType: 1, relatedToId: 1 });

export default mongoose.model<IMediaAsset>('MediaAsset', MediaAssetSchema);
