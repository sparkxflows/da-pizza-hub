-- ============================================================================
-- Da Pizza Hub — Complete Supabase Schema + Seed Data (Safe / Idempotent)
-- Paste into Supabase SQL Editor -> Click "Run"
-- ============================================================================

CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  maps_url TEXT NOT NULL DEFAULT '',
  swiggy_url TEXT,
  zomato_url TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('pizza', 'simple')),
  price_regular INTEGER,
  price_medium INTEGER,
  price_large INTEGER,
  price INTEGER,
  image TEXT NOT NULL,
  is_best_seller BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('percent', 'flat')),
  value INTEGER NOT NULL,
  min_order INTEGER DEFAULT 0,
  max_discount INTEGER,
  description TEXT NOT NULL,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  branch_id TEXT NOT NULL REFERENCES branches(id),
  order_type TEXT NOT NULL CHECK (order_type IN ('delivery', 'pickup')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT DEFAULT '',
  customer_lat DOUBLE PRECISION,
  customer_lng DOUBLE PRECISION,
  distance_km DOUBLE PRECISION,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal INTEGER NOT NULL,
  discount INTEGER DEFAULT 0,
  coupon_code TEXT,
  delivery_fee INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'upi')),
  schedule_mode TEXT NOT NULL DEFAULT 'now' CHECK (schedule_mode IN ('now', 'scheduled')),
  scheduled_for TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'out_for_delivery', 'completed', 'cancelled')),
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_branch ON orders (branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders (customer_phone);

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'branches' AND policyname = 'Public read branches') THEN
    CREATE POLICY "Public read branches" ON branches FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'menu_items' AND policyname = 'Public read menu_items') THEN
    CREATE POLICY "Public read menu_items" ON menu_items FOR SELECT USING (true);
  END IF;
END $$;

GRANT ALL ON TABLE branches, menu_items, coupons, orders TO postgres, service_role;
GRANT SELECT ON TABLE branches, menu_items TO anon, authenticated;

-- Seed Store (Hansi, Haryana)
INSERT INTO branches (id, name, address, phone, whatsapp, maps_url, swiggy_url, zomato_url, lat, lng) VALUES
  ('Hansi', 'Da Pizza Hub – Hansi', 'Shop No. 60, Gandhi Market, Near Ambedkar Chowk, Hansi, Haryana 125033', '9911273199', '919911273199', 'https://maps.app.goo.gl/QkPF8iK4bk3E6MpB6', NULL, 'https://www.zomato.com/hansi/da-pizza-hub-hansi-locality', 29.0941994, 75.9622477)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  whatsapp = EXCLUDED.whatsapp,
  maps_url = EXCLUDED.maps_url,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng;

-- Seed 58 Pure-Veg Menu Items
INSERT INTO menu_items (id, name, description, category, item_type, price_regular, price_medium, price_large, price, image, is_best_seller, is_new, is_available) VALUES
  ('da-paneer-special', 'Da Paneer Special', 'Black olive, jalapeno, corn, capsicum, red pepper & paneer, pasta topping', 'royal-special', 'pizza', 250, 430, 599, NULL, '/images/pizza-named/da-paneer-special.webp', true, false, true),
  ('tandoori-pizza', 'Tandoori Pizza', 'Onion, red pepper, capsicum, corn, jalapeno, spicy tandoori sauce', 'royal-special', 'pizza', 250, 430, 599, NULL, '/images/pizza-named/tandoori-pizza.webp', false, false, true),
  ('veg-extra-vaganza', 'Veg Extra Vaganza', 'Onion, capsicum, mushroom, corn, black olive, jalapeno, tomato, extra cheese', 'royal-special', 'pizza', 250, 430, 599, NULL, '/images/pizza-named/veg-extra-vaganza.webp', false, false, true),
  ('tandoori-paneer-pizza', 'Tandoori Paneer Pizza', 'Onion, red pepper, capsicum, jalapeno, spicy tandoori paneer', 'royal-special', 'pizza', 250, 430, 599, NULL, '/images/pizza-named/tandoori-paneer-pizza.webp', false, false, true),
  ('chefs-special', 'Chef''s Special', 'Mushroom, jalapeno, corn, capsicum, red pepper & paneer', 'veg-special', 'pizza', 219, 410, 579, NULL, '/images/pizza-named/chefs-special.webp', true, false, true),
  ('veg-exotica', 'Veg. Exotica', 'Onion, capsicum, red pepper, black olive & cheese', 'veg-special', 'pizza', 219, 410, 579, NULL, '/images/pizza-named/veg-exotica.webp', false, false, true),
  ('deluxe-veggie-delight', 'Deluxe Veggie Delight', 'Onion, capsicum, mushroom, corn, paneer & cheese', 'veg-special', 'pizza', 219, 410, 579, NULL, '/images/pizza-named/deluxe-veggie-delight.webp', false, false, true),
  ('veggie-paradise', 'Veggie Paradise', 'Capsicum, red pepper, corn, black olive', 'veg-special', 'pizza', 219, 410, 579, NULL, '/images/pizza-named/veggie-paradise.webp', false, false, true),
  ('farm-house-pizza', 'Farm House Pizza', 'Capsicum, onion, mushroom, tomato & cheese', 'veg-feast', 'pizza', 199, 379, 499, NULL, '/images/pizza-named/farm-house-pizza.webp', true, false, true),
  ('peppy-paneer-special', 'Peppy Paneer Special', 'Paneer, capsicum, red pepper', 'veg-feast', 'pizza', 199, 379, 499, NULL, '/images/pizza-named/peppy-paneer-special.webp', false, false, true),
  ('gourmet-pizza', 'Gourmet Pizza', 'Corn, jalapeno, black olive & cheese', 'veg-feast', 'pizza', 199, 379, 499, NULL, '/images/pizza-named/gourmet-pizza.webp', false, false, true),
  ('maxican-green', 'Maxican Green', 'Onion, capsicum, jalapeno, tomato & cheese', 'veg-feast', 'pizza', 199, 379, 499, NULL, '/images/pizza-named/maxican-green.webp', false, false, true),
  ('spicy-triple-tangy-twist', 'Spicy Triple Tangy Twist', 'Corn, jalapeno & tomato', 'veg-delight', 'pizza', 169, 329, 479, NULL, '/images/pizza-named/spicy-triple-tangy-twist.webp', false, false, true),
  ('super-soft-pizza', 'Super Soft Pizza', 'Capsicum, onion, paneer & cheese', 'veg-delight', 'pizza', 169, 329, 479, NULL, '/images/pizza-named/super-soft-pizza.webp', false, false, true),
  ('spicy-veggie', 'Spicy Veggie', 'Onion, capsicum, corn, spicy & cheese', 'veg-delight', 'pizza', 169, 329, 479, NULL, '/images/pizza-named/spicy-veggie.webp', false, false, true),
  ('country-special', 'Country Special', 'Onion, capsicum, tomato & cheese', 'veg-delight', 'pizza', 169, 329, 479, NULL, '/images/pizza-named/country-special.webp', false, false, true),
  ('double-cheese-margherita', 'Double Cheese Margherita', 'Double cheese, extra cheese', 'veg-treat', 'pizza', 149, 299, 449, NULL, '/images/pizza-named/double-cheese-margherita.webp', true, false, true),
  ('fresh-veggie', 'Fresh Veggie', 'Onion & capsicum', 'veg-treat', 'pizza', 149, 299, 449, NULL, '/images/pizza-named/fresh-veggie.webp', false, false, true),
  ('cheese-and-corn', 'Cheese & Corn', 'Corn & cheese', 'veg-treat', 'pizza', 149, 299, 449, NULL, '/images/pizza-named/cheese-and-corn.webp', false, false, true),
  ('cheese-and-paneer', 'Cheese & Paneer', 'Paneer & cheese', 'veg-treat', 'pizza', 149, 299, 449, NULL, '/images/pizza-named/cheese-and-paneer.webp', false, false, true),
  ('cheese-and-mushroom', 'Cheese & Mushroom', 'Mushroom & cheese', 'veg-treat', 'pizza', 149, 299, 449, NULL, '/images/pizza-named/cheese-mushroom.webp', false, false, true),
  ('cheese-red-pepper', 'Cheese Red Pepper', 'Cheese & red pepper', 'veg-treat', 'pizza', 149, 299, 449, NULL, '/images/pizza-named/cheese-and-redpepper.webp', false, true, true),
  ('margherita-single-cheese', 'Margherita', 'Single cheese topping', 'simply-veg', 'pizza', 120, 229, 369, NULL, '/images/pizza-named/margherita.webp', false, false, true),
  ('margherita-cheese-tomato', 'Margherita', 'Cheese & tomato', 'simply-veg', 'pizza', 120, 229, 369, NULL, '/images/pizza-named/margherita-cheese-tomato.webp', false, false, true),
  ('aloo-tikki', 'Aloo Tikki', '', 'burger', 'simple', NULL, NULL, NULL, 60, '/images/burger/aloo-tikki.webp', false, false, true),
  ('crispy-veggie', 'Crispy Veggie', '', 'burger', 'simple', NULL, NULL, NULL, 65, '/images/burger/crispy-veggie.webp', false, false, true),
  ('spicy-veggie-burger', 'Spicy Veggie', '', 'burger', 'simple', NULL, NULL, NULL, 65, '/images/burger/spicy-veggie-burger.webp', false, false, true),
  ('king-special', 'King Special', '', 'burger', 'simple', NULL, NULL, NULL, 70, '/images/burger/king-special.webp', false, false, true),
  ('paneer-burger', 'Paneer Burger', '', 'burger', 'simple', NULL, NULL, NULL, 80, '/images/burger/paneer-burger.webp', true, false, true),
  ('tandoori-burger', 'Tandoori Burger', '', 'burger', 'simple', NULL, NULL, NULL, 80, '/images/burger/tandoori-burger.webp', false, false, true),
  ('spicy-burger', 'Spicy Burger', '', 'burger', 'simple', NULL, NULL, NULL, 85, '/images/burger/spicy-burger.webp', false, false, true),
  ('pizza-burger', 'Pizza Burger', '', 'burger', 'simple', NULL, NULL, NULL, 85, '/images/burger/pizza-burger.webp', false, false, true),
  ('cheese-burger', 'Cheese Burger', '', 'burger', 'simple', NULL, NULL, NULL, 99, '/images/burger/cheese-burger.webp', true, false, true),
  ('maharaja-burger', 'Maharaja Burger', '', 'burger', 'simple', NULL, NULL, NULL, 99, '/images/burger/maharaja-burger.webp', false, false, true),
  ('french-fries', 'French Fries', '', 'fries', 'simple', NULL, NULL, NULL, 80, '/images/fries/masala-fries.webp', true, false, true),
  ('kungfu-fries', 'Kungfu Fries', '', 'fries', 'simple', NULL, NULL, NULL, 90, '/images/fries/kungfu-fries.webp', false, false, true),
  ('crispers-fries', 'Crispers Fries', '', 'fries', 'simple', NULL, NULL, NULL, 100, '/images/fries/crispers-fries.webp', false, false, true),
  ('masala-fries', 'Masala Fries', '', 'fries', 'simple', NULL, NULL, NULL, 80, '/images/fries/masala-fries.webp', false, false, true),
  ('lemon-peri-peri-fries', 'Lemon Peri Peri Fries', '', 'fries', 'simple', NULL, NULL, NULL, 90, '/images/fries/lemon-peri-peri-fries.webp', false, false, true),
  ('cheese-fries', 'Cheese Fries', '', 'fries', 'simple', NULL, NULL, NULL, 120, '/images/fries/cheese-fries.webp', false, false, true),
  ('white-sauce-pasta', 'White Sauce Pasta', '', 'pasta', 'simple', NULL, NULL, NULL, 120, '/images/pasta/white-sauce-pasta.webp', false, false, true),
  ('red-sauce-pasta', 'Red Sauce Pasta', '', 'pasta', 'simple', NULL, NULL, NULL, 130, '/images/pasta/red-sauce-pasta.webp', false, false, true),
  ('tandoori-sauce-pasta', 'Tandoori Sauce Pasta', '', 'pasta', 'simple', NULL, NULL, NULL, 130, '/images/pasta/tandoori-sauce-pasta.webp', false, false, true),
  ('indian-veg-wrap', 'Indian Veg. Wrap', '', 'wrap', 'simple', NULL, NULL, NULL, 80, '/images/wrap/indian-veg-wrap.webp', false, false, true),
  ('indian-paneer-wrap', 'Indian Paneer Wrap', '', 'wrap', 'simple', NULL, NULL, NULL, 99, '/images/wrap/indian-paneer-wrap.webp', false, false, true),
  ('mexican-aloo-tikki-wrap', 'Mexican Aloo Tikki Wrap', '', 'wrap', 'simple', NULL, NULL, NULL, 99, '/images/wrap/mexican-aloo-tikki-wrap.webp', false, false, true),
  ('stuffed-garlic-bread', 'Stuffed Garlic Bread', '', 'bread', 'simple', NULL, NULL, NULL, 130, '/images/bread/stuff-garlic.webp', true, false, true),
  ('garlic-bread', 'Garlic Bread', '', 'bread', 'simple', NULL, NULL, NULL, 80, '/images/bread/garlic-bread.webp', false, false, true),
  ('garlic-bread-cheese', 'Garlic Bread Cheese', '', 'bread', 'simple', NULL, NULL, NULL, 110, '/images/bread/chesseg.webp', false, false, true),
  ('tandoori-garlic', 'Tandoori Garlic', '', 'bread', 'simple', NULL, NULL, NULL, 140, '/images/bread/tandoori.webp', false, false, true),
  ('cheese-dip', 'Cheese Dip', '', 'bread', 'simple', NULL, NULL, NULL, 30, '/images/dips/cheese.webp', false, false, true),
  ('jalapeno-dip', 'Jalapeno Dip', '', 'bread', 'simple', NULL, NULL, NULL, 30, '/images/dips/jalapeno.webp', false, false, true),
  ('calzone', 'Calzone', '', 'sides-other', 'simple', NULL, NULL, NULL, 110, '/images/pocket parcel/calzone.webp', false, false, true),
  ('pocket-parcel', 'Pocket Parcel', '', 'sides-other', 'simple', NULL, NULL, NULL, 50, '/images/pocket parcel/pocket-parcel.webp', false, false, true),
  ('cheesy-spicy-twists', 'Cheesy Spicy Twists', '', 'sides-other', 'simple', NULL, NULL, NULL, 90, '/images/bread/cheesy-spicy-twists.webp', false, false, true),
  ('cheesy-paneer-spicy-twists', 'Cheesy Paneer Spicy Twists', '', 'sides-other', 'simple', NULL, NULL, NULL, 110, '/images/bread/cheesy-paneer-spicy-twists.webp', false, false, true),
  ('vanilla-shake', 'Vanilla Shake', '', 'shake', 'simple', NULL, NULL, NULL, 80, '/images/shake/vanilla-shake.webp', false, false, true),
  ('chocolate-shake', 'Chocolate Shake', '', 'shake', 'simple', NULL, NULL, NULL, 80, '/images/shake/chocolate-shake.webp', true, false, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Coupons
INSERT INTO coupons (code, type, value, min_order, max_discount, description, usage_limit, used_count, is_active) VALUES
  ('FIRST30', 'percent', 30, 0, 150, '30% OFF up to ₹150 on your first website order', 1000, 18, true),
  ('WELCOME50', 'flat', 50, 300, NULL, 'Flat ₹50 OFF on orders above ₹300', 500, 12, true),
  ('FAMILY100', 'flat', 100, 499, NULL, 'Flat ₹100 OFF on family orders above ₹499', 500, 9, true)
ON CONFLICT (code) DO NOTHING;

NOTIFY pgrst, 'reload schema';
