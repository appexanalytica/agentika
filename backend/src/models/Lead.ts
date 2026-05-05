import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  source: string;
  status: 'nuevo' | 'contactado' | 'calificado' | 'propuesta' | 'cerrado' | 'perdido';
  value?: number;
  tags: string[];
  notes: Array<{
    id: string;
    text: string;
    author: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: null,
    },
    company: {
      type: String,
      default: null,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    source: {
      type: String,
      default: 'web',
    },
    status: {
      type: String,
      enum: ['nuevo', 'contactado', 'calificado', 'propuesta', 'cerrado', 'perdido'],
      default: 'nuevo',
    },
    value: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        lowercase: true,
      },
    ],
    notes: [
      {
        id: {
          type: String,
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        author: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILead>('Lead', LeadSchema);
