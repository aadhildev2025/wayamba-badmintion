import mongoose, { Schema, Document } from 'mongoose';

export interface ISpecification {
  key: string;
  value: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  images: string[];
  brand: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  status: 'active' | 'draft' | 'archived';
  tags: string[];
  isFeatured: boolean;
  specifications: ISpecification[];
  createdAt: Date;
  updatedAt: Date;
}

const SpecificationSchema = new Schema({
  key: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    stockQuantity: { type: Number, required: true, default: 0, min: 0 },
    images: [{ type: String }],
    brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    specifications: [SpecificationSchema],
  },
  { timestamps: true }
);

// Indexes for faster search and filtering
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);
