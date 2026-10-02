import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
  },
  deliveryAddress: { type: String, required: true, trim: true },
  items: { type: [orderItemSchema], required: true, validate: (items) => items.length > 0 },
  subtotal: { type: Number, required: true, min: 0 },
  deliveryFee: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ['cash-on-delivery'], default: 'cash-on-delivery' },
  status: { type: String, enum: ['received', 'preparing', 'on-the-way', 'delivered', 'cancelled'], default: 'received' },
}, { timestamps: true, versionKey: false });

export default mongoose.model('Order', orderSchema);
