import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'CUSTOMER' | 'STAFF' | 'SUPER_ADMIN';
  phone?: string;
  verified: boolean;
  wishlist: mongoose.Types.ObjectId[];
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['CUSTOMER', 'STAFF', 'SUPER_ADMIN'], default: 'CUSTOMER' },
    phone: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

// Pre-save hook to hash password
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password || '', salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password || '');
};

export default mongoose.model<IUser>('User', UserSchema);
