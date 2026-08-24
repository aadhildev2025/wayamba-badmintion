import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  user?: mongoose.Types.ObjectId;
  name: string;
  product: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    name: { type: String, required: true, trim: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, createdAt: -1 });

export default mongoose.model<IReview>('Review', ReviewSchema);
