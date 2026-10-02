import 'dotenv/config';
import mongoose from 'mongoose';
import Product from './models/Product.js';
import { menu } from './data/menu.js';

if (!process.env.MONGO_URI) {
  console.error('Set MONGO_URI in server/.env before seeding the database.');
  process.exitCode = 1;
} else {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Promise.all(menu.map((product) => Product.findByIdAndUpdate(product._id, product, { upsert: true, new: true, runValidators: true })));
    console.log(`Seeded ${menu.length} menu items.`);
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
