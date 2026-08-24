import mongoose, { Schema, Document } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  slug: string;
  logo?: string; // Logo image URL or file path
}

const BrandSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IBrand>('Brand', BrandSchema);
