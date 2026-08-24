import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IShippingAddress {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
}

export interface IOrder extends Document {
  user?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  deliveryCharge: number;
  discountAmount: number;
  total: number;
  couponCode?: string;
  paymentMethod: 'Cash on Delivery' | 'Bank Transfer' | 'Online Payment Gateway' | 'Card Payments';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const ShippingAddressSchema = new Schema({
  recipientName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  district: { type: String, required: true },
}, { _id: false });

const OrderSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    items: [OrderItemSchema],
    shippingAddress: { type: ShippingAddressSchema, required: true },
    deliveryCharge: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String, default: '' },
    paymentMethod: {
      type: String,
      enum: ['Cash on Delivery', 'Bank Transfer', 'Online Payment Gateway', 'Card Payments'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    trackingNumber: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
