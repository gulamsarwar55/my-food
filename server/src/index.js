import 'dotenv/config';
import crypto from 'node:crypto';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import Order from './models/Order.js';
import Product from './models/Product.js';
import { menu } from './data/menu.js';

const app = express();
const port = Number(process.env.PORT) || 5000;
const demoOrders = [];

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'demo' });
});

app.get('/api/products', async (request, response, next) => {
  try {
    const category = String(request.query.category || '').trim();
    const query = String(request.query.q || '').trim();
    const products = mongoose.connection.readyState === 1
      ? await Product.find({ available: true }).sort({ name: 1 }).lean()
      : menu;
    const filtered = products.filter((product) => {
      const matchesCategory = !category || category === 'Everything' || product.category.toLowerCase() === category.toLowerCase();
      const matchesQuery = !query || `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
    response.json(filtered);
  } catch (error) {
    next(error);
  }
});

app.post('/api/orders', async (request, response, next) => {
  try {
    const customer = request.body?.customer;
    const address = String(request.body?.deliveryAddress || '').trim();
    const requestedItems = request.body?.items;
    const email = String(customer?.email || '').trim().toLowerCase();
    const name = String(customer?.name || '').trim();

    if (!name || name.length > 100) return response.status(400).json({ message: 'Enter a valid customer name.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return response.status(400).json({ message: 'Enter a valid email address.' });
    if (!address || address.length > 250) return response.status(400).json({ message: 'Enter a valid delivery address.' });
    if (!Array.isArray(requestedItems) || requestedItems.length < 1 || requestedItems.length > 30) return response.status(400).json({ message: 'Your basket is empty or too large.' });

    const quantities = new Map();
    for (const item of requestedItems) {
      const id = String(item?.product || '').trim();
      const quantity = Number(item?.quantity);
      if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) return response.status(400).json({ message: 'Check the quantities in your basket.' });
      quantities.set(id, (quantities.get(id) || 0) + quantity);
    }
    if ([...quantities.values()].some((quantity) => quantity > 20)) return response.status(400).json({ message: 'A maximum of 20 of each item can be ordered.' });

    const ids = [...quantities.keys()];
    const products = mongoose.connection.readyState === 1
      ? await Product.find({ _id: { $in: ids }, available: true }).lean()
      : menu.filter((product) => ids.includes(product._id));
    if (products.length !== ids.length) return response.status(400).json({ message: 'One or more items are no longer available.' });

    const items = products.map((product) => ({
      productId: product._id,
      name: product.name,
      price: Number(product.price),
      quantity: quantities.get(product._id),
    }));
    const subtotalCents = items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
    const subtotal = subtotalCents / 100;
    const deliveryFee = subtotalCents === 0 || subtotalCents >= 3000 ? 0 : 2.5;
    const orderData = {
      customer: { name, email },
      deliveryAddress: address,
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentMethod: 'cash-on-delivery',
      status: 'received',
    };

    const order = mongoose.connection.readyState === 1
      ? await Order.create(orderData)
      : { ...orderData, _id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    if (mongoose.connection.readyState !== 1) demoOrders.push(order);
    response.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

app.use((_request, response) => response.status(404).json({ message: 'That route does not exist.' }));
app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: 'Something went wrong. Please try again.' });
});

if (process.env.MONGO_URI) {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2500 });
    console.log('Connected to MongoDB.');
  } catch (error) {
    console.warn(`MongoDB unavailable; using demo data. ${error.message}`);
  }
} else {
  console.log('MONGO_URI not set; using demo data and in-memory orders.');
}

app.listen(port, () => console.log(`Good Food API listening on http://localhost:${port}`));
