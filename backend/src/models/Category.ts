import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  icon?: string;
  image?: string;
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon: { type: String, default: '' },
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<ICategory>('Category', CategorySchema);
