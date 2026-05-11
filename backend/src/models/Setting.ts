import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISetting extends Document {
  _id: Types.ObjectId;
  key: string;
  value: any;
  group: string;
  isPublic: boolean;
  updatedBy?: Types.ObjectId;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    group: {
      type: String,
      required: true,
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Indexes
SettingSchema.index({ key: 1 });
SettingSchema.index({ group: 1 });
SettingSchema.index({ isPublic: 1 });

export default mongoose.model<ISetting>('Setting', SettingSchema);
