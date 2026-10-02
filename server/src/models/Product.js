import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  rating: { type: Number, default: 4.8, min: 0, max: 5 },
  time: { type: String, default: '20 min' },
  tag: { type: String, default: 'Fresh today' },
  image: { type: String, default: '' },
  tint: { type: String, default: 'sage' },
  available: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });

export default mongoose.model('Product', productSchema);
