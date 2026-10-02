# Good Food Market

A responsive food-ordering storefront built with React, Vite, Express, and MongoDB/Mongoose.

## Requirements

- Node.js 20 or newer
- npm
- MongoDB (optional for demo mode; required to persist menu data and orders across restarts)

## Run locally

1. Install dependencies from the project root with `npm install`, `npm install --prefix client`, and `npm install --prefix server`.
2. Copy `server/.env.example` to `server/.env`. Set `MONGO_URI` to your MongoDB connection string to enable database persistence. The server also runs without it, using the built-in menu and in-memory orders.
3. With MongoDB running, seed the menu using `npm run seed`.
4. Start the API and storefront with `npm run dev`.
5. Visit `http://localhost:5173`.

The Vite development server proxies `/api` requests to the Express server on port 5000. In demo mode, the menu and order API work for the current server process; orders are not retained when it restarts. Checkout is a cash-on-delivery demo and does not collect payment details.

## Scripts

- `npm run dev` starts the API and Vite storefront together.
- `npm run build` creates a production client build in `client/dist`.
- `npm run seed` upserts the sample menu items into MongoDB.
- `npm run dev:server` and `npm run dev:client` start either process individually.

## API

- `GET /api/health` reports API and database status.
- `GET /api/products` returns available products. Optional `category` and `q` query parameters filter the menu.
- `POST /api/orders` validates a guest checkout and calculates prices on the server. The request body contains `customer` (`name`, `email`), `deliveryAddress`, and `items` (`product`, `quantity`).

The order endpoint trusts neither client-supplied prices nor totals. Without MongoDB, it creates demo orders in process memory. A production deployment should add authentication, payment-provider integration, rate limiting, and operational secrets management before accepting real orders.
