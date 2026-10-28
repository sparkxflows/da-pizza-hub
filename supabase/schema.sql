-- Da Pizza Hub — PostgreSQL / Supabase Production Schema

CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  maps_url TEXT NOT NULL,
  swiggy_url TEXT,
  zomato_url TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('pizza', 'simple')),
  price NUMERIC(10,2),
  price_regular NUMERIC(10,2),
  price_medium NUMERIC(10,2),
  price_large NUMERIC(10,2),
  image TEXT NOT NULL DEFAULT '/images/pizza-generic/pizza-1.webp',
  is_best_seller BOOLEAN NOT NULL DEFAULT FALSE,
  is_new BOOLEAN NOT NULL DEFAULT FALSE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('flat', 'percent')),
  value NUMERIC(10,2) NOT NULL,
  min_order NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_discount NUMERIC(10,2),
  description TEXT NOT NULL DEFAULT '',
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  idempotency_key TEXT UNIQUE,
  branch_id TEXT NOT NULL REFERENCES branches(id),
  order_type TEXT NOT NULL DEFAULT 'delivery' CHECK (order_type IN ('delivery', 'pickup')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT,
  customer_lat DOUBLE PRECISION,
  customer_lng DOUBLE PRECISION,
  distance_km NUMERIC(6,2),
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  coupon_code TEXT,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'upi')),
  schedule_mode TEXT NOT NULL DEFAULT 'now' CHECK (schedule_mode IN ('now', 'scheduled')),
  scheduled_for TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'preparing', 'out_for_delivery', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
