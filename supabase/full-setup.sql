-- ============================================================================
-- DA PIZZA HUB — COMPLETE SUPABASE DATABASE SETUP (100% SUPABASE AUTH + STORE)
-- Paste this entire script into your Supabase SQL Editor and click "Run".
-- ============================================================================

-- 0. CLEAN RESET (Drops old tables cleanly without foreign key lock issues)
DROP TABLE IF EXISTS customer_addresses CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS staff_users CASCADE;

-- ----------------------------------------------------------------------------
-- 1. STAFF USERS (Super Admin & Store Admin accounts)
-- ----------------------------------------------------------------------------
CREATE TABLE staff_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin')),
  password_plain TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. STORE BRANCHES (Hansi Outlet)
-- ----------------------------------------------------------------------------
CREATE TABLE branches (
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

-- ----------------------------------------------------------------------------
-- 3. MENU ITEMS (56 Authentic Handcrafted Dishes with In-Stock Toggle)
-- ----------------------------------------------------------------------------
CREATE TABLE menu_items (
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

-- ----------------------------------------------------------------------------
-- 4. COUPONS (Managed by Super Admin, Displayed Dynamically on Offers Page)
-- ----------------------------------------------------------------------------
CREATE TABLE coupons (
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

-- ----------------------------------------------------------------------------
-- 5. CUSTOMERS (Synced with Supabase Auth: Google OAuth + Email/Password)
-- ----------------------------------------------------------------------------
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Customer',
  phone TEXT,
  email TEXT,
  auth_provider TEXT DEFAULT 'supabase',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 6. CUSTOMER SAVED DELIVERY ADDRESSES
-- ----------------------------------------------------------------------------
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  address_text TEXT NOT NULL,
  landmark TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 7. ORDERS (Live Order Management, Status Workflow, Financial Records)
-- ----------------------------------------------------------------------------
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  branch_id TEXT NOT NULL REFERENCES branches(id),
  order_type TEXT NOT NULL CHECK (order_type IN ('delivery', 'pickup')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
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

-- ----------------------------------------------------------------------------
-- 8. INDEXES FOR LIGHTNING FAST QUERIES
-- ----------------------------------------------------------------------------
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_phone ON orders (customer_phone);
CREATE INDEX idx_orders_email ON orders (customer_email);
CREATE INDEX idx_customers_phone ON customers (phone);
CREATE INDEX idx_customers_email ON customers (email);

-- ----------------------------------------------------------------------------
-- 9. AUTOMATIC TRIGGER: SYNC SUPABASE AUTH USERS TO PUBLIC.CUSTOMERS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customers (id, name, email, phone, auth_provider, avatar_url)
  VALUES (
    NEW.id::text,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'Customer'),
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_app_meta_data->>'provider', 'supabase'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = CASE WHEN customers.name = 'Customer' OR customers.name = '' THEN EXCLUDED.name ELSE customers.name END,
    avatar_url = COALESCE(EXCLUDED.avatar_url, customers.avatar_url),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read branches" ON branches FOR SELECT USING (true);
CREATE POLICY "Public read menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Public insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update customers" ON customers FOR UPDATE USING (true);
CREATE POLICY "Public read addresses" ON customer_addresses FOR SELECT USING (true);
CREATE POLICY "Public insert addresses" ON customer_addresses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete addresses" ON customer_addresses FOR DELETE USING (true);

-- Permissions grants
GRANT ALL ON TABLE staff_users, branches, menu_items, coupons, customers, customer_addresses, orders TO postgres, service_role;
GRANT SELECT ON TABLE branches, menu_items, coupons TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE orders, customers, customer_addresses TO anon, authenticated;
GRANT DELETE ON TABLE customer_addresses TO anon, authenticated;

-- ============================================================================
-- 11. SEED DATA (PRODUCTION READY)
-- ============================================================================

-- 1. Staff Accounts: Super Admin (Owner) & Store Admin (Manager)
INSERT INTO staff_users (username, role, password_plain, display_name) VALUES
  ('superadmin', 'super_admin', 'superadmin123', 'Store Owner / Super Admin'),
  ('admin', 'admin', 'admin123', 'Store Manager')
ON CONFLICT (username) DO NOTHING;

-- 2. Store Branch: Hansi Outlet
INSERT INTO branches (id, name, address, phone, whatsapp, maps_url, zomato_url, lat, lng) VALUES
  ('Hansi', 'Da Pizza Hub – Hansi', 'Shop No. 60, Gandhi Market, Near Ambedkar Chowk, Hansi, Haryana 125033', '9911273199', '919911273199', 'https://maps.app.goo.gl/QkPF8iK4bk3E6MpB6', 'https://www.zomato.com/hansi/da-pizza-hub-hansi-locality', 29.0941994, 75.9622477)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed 56 Authentic Handcrafted Dishes (Pure-Veg, No Shakes/Desserts)
INSERT INTO menu_items (id, name, description, category, item_type, price_regular, price_medium, price_large, price, image, is_best_seller, is_new, is_available) VALUES
  -- Royal Special Pizzas
  ('da-paneer-special', 'Da Paneer Special', 'Black olive, jalapeno, corn, capsicum, red pepper & paneer, pasta topping', 'royal-special', 'pizza', 250, 430, 599, NULL, '/images/pizza-named/da-paneer-special.webp', true, false, true),
  ('tandoori-pizza', 'Tandoori Pizza', 'Onion, red pepper, capsicum, corn, jalapeno, spicy tandoori sauce', 'royal-special', 'pizza', 250, 430, 599, NULL, '/images/pizza-named/tandoori-pizza.webp', false, false, true),
  ('veg-extra-vaganza', 'Veg Extra Vaganza', 'Onion, capsicum, mushroom, corn, black olive, jalapeno, tomato, extra cheese', 'royal-special', 'pizza', 250, 430, 599, NULL, '/images/pizza-named/veg-extra-vaganza.webp', false, false, true),
  ('tandoori-paneer-pizza', 'Tandoori Paneer Pizza', 'Onion, red pepper, capsicum, jalapeno, spicy tandoori paneer', 'royal-special', 'pizza', 250, 430, 599, NULL, '/images/pizza-named/tandoori-paneer-pizza.webp', false, false, true),

  -- Veg Special Pizzas
  ('chefs-special', 'Chef''s Special', 'Mushroom, jalapeno, corn, capsicum, red pepper & paneer', 'veg-special', 'pizza', 219, 410, 579, NULL, '/images/pizza-named/chefs-special.webp', true, false, true),
  ('veg-exotica', 'Veg. Exotica', 'Onion, capsicum, red pepper, black olive & cheese', 'veg-special', 'pizza', 219, 410, 579, NULL, '/images/pizza-named/veg-exotica.webp', false, false, true),
  ('deluxe-veggie-delight', 'Deluxe Veggie Delight', 'Onion, capsicum, mushroom, corn, paneer & cheese', 'veg-special', 'pizza', 219, 410, 579, NULL, '/images/pizza-named/deluxe-veggie-delight.webp', false, false, true),
  ('veggie-paradise', 'Veggie Paradise', 'Capsicum, red pepper, corn, black olive', 'veg-special', 'pizza', 219, 410, 579, NULL, '/images/pizza-named/veggie-paradise.webp', false, false, true),

  -- Veg Feast Pizzas
  ('farm-house-pizza', 'Farm House Pizza', 'Capsicum, onion, mushroom, tomato & cheese', 'veg-feast', 'pizza', 199, 379, 499, NULL, '/images/pizza-named/farm-house-pizza.webp', true, false, true),
  ('peppy-paneer-special', 'Peppy Paneer Special', 'Paneer, capsicum, red pepper', 'veg-feast', 'pizza', 199, 379, 499, NULL, '/images/pizza-named/peppy-paneer-special.webp', false, false, true),
  ('gourmet-pizza', 'Gourmet Pizza', 'Corn, jalapeno, black olive & cheese', 'veg-feast', 'pizza', 199, 379, 499, NULL, '/images/pizza-named/gourmet-pizza.webp', false, false, true),
  ('maxican-green', 'Maxican Green', 'Onion, capsicum, jalapeno, tomato & cheese', 'veg-feast', 'pizza', 199, 379, 499, NULL, '/images/pizza-named/maxican-green.webp', false, false, true),

  -- Veg Delight Pizzas
  ('spicy-triple-tangy-twist', 'Spicy Triple Tangy Twist', 'Corn, jalapeno & tomato', 'veg-delight', 'pizza', 169, 329, 479, NULL, '/images/pizza-named/spicy-triple-tangy-twist.webp', false, false, true),
  ('super-soft-pizza', 'Super Soft Pizza', 'Capsicum, onion, paneer & cheese', 'veg-delight', 'pizza', 169, 329, 479, NULL, '/images/pizza-named/super-soft-pizza.webp', false, false, true),
  ('spicy-veggie', 'Spicy Veggie', 'Onion, capsicum, corn, spicy & cheese', 'veg-delight', 'pizza', 169, 329, 479, NULL, '/images/pizza-named/spicy-veggie.webp', false, false, true),
  ('country-special', 'Country Special', 'Onion, capsicum, tomato & cheese', 'veg-delight', 'pizza', 169, 329, 479, NULL, '/images/pizza-named/country-special.webp', false, false, true),

  -- Veg Treat Pizzas
  ('double-cheese-margherita', 'Double Cheese Margherita', 'Double cheese, extra cheese', 'veg-treat', 'pizza', 149, 299, 449, NULL, '/images/pizza-named/double-cheese-margherita.webp', true, false, true),
  ('fresh-veggie', 'Fresh Veggie', 'Onion & capsicum', 'veg-treat', 'pizza', 149, 299, 449, NULL, '/images/pizza-named/fresh-veggie.webp', false, false, true),
  ('cheese-and-corn', 'Cheese & Corn', 'Corn & cheese', 'veg-treat', 'pizza', 149, 299, 449, NULL, '/images/pizza-named/cheese-and-corn.webp', false, false, true),
  ('cheese-and-paneer', 'Cheese & Paneer', 'Paneer & cheese', 'veg-treat', 'pizza', 149, 299, 449, NULL, '/images/pizza-named/cheese-and-paneer.webp', false, false, true),
  ('cheese-and-mushroom', 'Cheese & Mushroom', 'Mushroom & cheese', 'veg-treat', 'pizza', 149, 299, 449, NULL, '/images/pizza-named/cheese-mushroom.webp', false, false, true),
  ('cheese-red-pepper', 'Cheese Red Pepper', 'Cheese & red pepper', 'veg-treat', 'pizza', 149, 299, 449, NULL, '/images/pizza-named/cheese-and-redpepper.webp', false, true, true),

  -- Simply Veg Pizzas
  ('margherita-single-cheese', 'Classic Margherita', 'Single cheese topping', 'simply-veg', 'pizza', 120, 229, 369, NULL, '/images/pizza-named/margherita.webp', false, false, true),
  ('margherita-cheese-tomato', 'Cheese & Tomato Margherita', 'Cheese & tomato', 'simply-veg', 'pizza', 120, 229, 369, NULL, '/images/pizza-named/margherita-cheese-tomato.webp', false, false, true),

  -- Burgers
  ('aloo-tikki', 'Aloo Tikki', 'Crispy spiced potato patty with house sauce', 'burger', 'simple', NULL, NULL, NULL, 60, '/images/burger/aloo-tikki.webp', false, false, true),
  ('crispy-veggie', 'Crispy Veggie', 'Golden crispy vegetable patty with fresh lettuce', 'burger', 'simple', NULL, NULL, NULL, 65, '/images/burger/crispy-veggie.webp', false, false, true),
  ('spicy-veggie-burger', 'Spicy Veggie Burger', 'Hot chili spiced vegetable patty with cheese', 'burger', 'simple', NULL, NULL, NULL, 65, '/images/burger/spicy-veggie-burger.webp', false, false, true),
  ('king-special', 'King Special', 'Double loaded patty with creamy dressing', 'burger', 'simple', NULL, NULL, NULL, 70, '/images/burger/king-special.webp', false, false, true),
  ('paneer-burger', 'Paneer Burger', 'Fresh cottage cheese slice with herbs & mayo', 'burger', 'simple', NULL, NULL, NULL, 80, '/images/burger/paneer-burger.webp', true, false, true),
  ('tandoori-burger', 'Tandoori Burger', 'Smoky tandoori seasoning with crunchy onion rings', 'burger', 'simple', NULL, NULL, NULL, 80, '/images/burger/tandoori-burger.webp', false, false, true),
  ('spicy-burger', 'Spicy Burger', 'Peri-peri spices with chipotle sauce', 'burger', 'simple', NULL, NULL, NULL, 85, '/images/burger/spicy-burger.webp', false, false, true),
  ('pizza-burger', 'Pizza Burger', 'Pizza sauce, mozzarella cheese inside a toasted bun', 'burger', 'simple', NULL, NULL, NULL, 85, '/images/burger/pizza-burger.webp', false, false, true),
  ('cheese-burger', 'Cheese Burger', 'Melted cheese slice layered over crunchy patty', 'burger', 'simple', NULL, NULL, NULL, 99, '/images/burger/cheese-burger.webp', true, false, true),
  ('maharaja-burger', 'Maharaja Burger', 'Triple layered supreme burger with double cheese', 'burger', 'simple', NULL, NULL, NULL, 99, '/images/burger/maharaja-burger.webp', false, false, true),

  -- Fries
  ('french-fries', 'French Fries', 'Classic salted golden potato fries', 'fries', 'simple', NULL, NULL, NULL, 80, '/images/fries/masala-fries.webp', true, false, true),
  ('masala-fries', 'Masala Fries', 'Tossed in Indian chaat masala & spices', 'fries', 'simple', NULL, NULL, NULL, 80, '/images/fries/masala-fries.webp', false, false, true),
  ('kungfu-fries', 'Kungfu Fries', 'Crispy fries with sweet & spicy Asian glaze', 'fries', 'simple', NULL, NULL, NULL, 90, '/images/fries/kungfu-fries.webp', false, false, true),
  ('lemon-peri-peri-fries', 'Lemon Peri Peri Fries', 'Tangy lemon zest with fiery peri-peri seasoning', 'fries', 'simple', NULL, NULL, NULL, 90, '/images/fries/lemon-peri-peri-fries.webp', false, false, true),
  ('crispers-fries', 'Crispers Fries', 'Extra crunchy crinkle cut potato fries', 'fries', 'simple', NULL, NULL, NULL, 100, '/images/fries/crispers-fries.webp', false, false, true),
  ('cheese-fries', 'Cheese Fries', 'Drenched in hot melted liquid cheese sauce', 'fries', 'simple', NULL, NULL, NULL, 120, '/images/fries/cheese-fries.webp', false, false, true),

  -- Pasta
  ('white-sauce-pasta', 'White Sauce Pasta', 'Rich creamy bechamel sauce with sweet corn & herbs', 'pasta', 'simple', NULL, NULL, NULL, 120, '/images/pasta/white-sauce-pasta.webp', false, false, true),
  ('red-sauce-pasta', 'Red Sauce Pasta', 'Tangy tomato arrabbiata sauce with basil', 'pasta', 'simple', NULL, NULL, NULL, 130, '/images/pasta/red-sauce-pasta.webp', false, false, true),
  ('tandoori-sauce-pasta', 'Tandoori Sauce Pasta', 'Fusion smoky tandoori sauce with diced paneer', 'pasta', 'simple', NULL, NULL, NULL, 130, '/images/pasta/tandoori-sauce-pasta.webp', false, false, true),

  -- Wraps
  ('indian-veg-wrap', 'Indian Veg. Wrap', 'Spiced veggie filling rolled in soft toasted tortilla', 'wrap', 'simple', NULL, NULL, NULL, 80, '/images/wrap/indian-veg-wrap.webp', false, false, true),
  ('indian-paneer-wrap', 'Indian Paneer Wrap', 'Marinated paneer cubes with mint sauce & salad', 'wrap', 'simple', NULL, NULL, NULL, 99, '/images/wrap/indian-paneer-wrap.webp', false, false, true),
  ('mexican-aloo-tikki-wrap', 'Mexican Aloo Tikki Wrap', 'Aloo tikki with jalapenos, salsa & nacho cheese', 'wrap', 'simple', NULL, NULL, NULL, 99, '/images/wrap/mexican-aloo-tikki-wrap.webp', false, false, true),

  -- Garlic Breads
  ('garlic-bread', 'Garlic Bread', 'Toasted artisan bread with garlic butter', 'bread', 'simple', NULL, NULL, NULL, 80, '/images/bread/garlic-bread.webp', false, false, true),
  ('garlic-bread-cheese', 'Garlic Bread Cheese', 'Toasted garlic bread with melted mozzarella', 'bread', 'simple', NULL, NULL, NULL, 110, '/images/bread/chesseg.webp', false, false, true),
  ('stuffed-garlic-bread', 'Stuffed Garlic Bread', 'Stuffed with sweet corn, jalapenos & molten cheese', 'bread', 'simple', NULL, NULL, NULL, 130, '/images/bread/stuff-garlic.webp', true, false, true),
  ('tandoori-garlic', 'Tandoori Garlic', 'Garlic bread with tandoori spices & cheese', 'bread', 'simple', NULL, NULL, NULL, 140, '/images/bread/tandoori.webp', false, false, true),
  ('cheese-dip', 'Cheese Dip', 'Creamy cheese dip cup for crust dipping', 'bread', 'simple', NULL, NULL, NULL, 30, '/images/dips/cheese.webp', false, false, true),
  ('jalapeno-dip', 'Jalapeno Dip', 'Spicy jalapeno dip cup', 'bread', 'simple', NULL, NULL, NULL, 30, '/images/dips/jalapeno.webp', false, false, true),

  -- Sides & Snacks
  ('pocket-parcel', 'Pocket Parcel', 'Flaky pastry pocket with spiced cheesy filling', 'sides-other', 'simple', NULL, NULL, NULL, 50, '/images/pocket parcel/pocket-parcel.webp', false, false, true),
  ('cheesy-spicy-twists', 'Cheesy Spicy Twists', 'Twisted breadsticks baked with cheese & chili flakes', 'sides-other', 'simple', NULL, NULL, NULL, 90, '/images/bread/cheesy-spicy-twists.webp', false, false, true),
  ('calzone', 'Calzone', 'Folded pizza pocket stuffed with cheese & vegetables', 'sides-other', 'simple', NULL, NULL, NULL, 110, '/images/pocket parcel/calzone.webp', false, false, true),
  ('cheesy-paneer-spicy-twists', 'Cheesy Paneer Spicy Twists', 'Twisted breadsticks with paneer, cheese & spices', 'sides-other', 'simple', NULL, NULL, NULL, 110, '/images/bread/cheesy-paneer-spicy-twists.webp', false, false, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Active Discount Promo Coupons
INSERT INTO coupons (code, type, value, min_order, max_discount, description, usage_limit, used_count, is_active) VALUES
  ('FIRST30', 'percent', 30, 0, 150, '30% OFF up to ₹150 on your first website order', 1000, 18, true),
  ('WELCOME50', 'flat', 50, 300, NULL, 'Flat ₹50 OFF on orders above ₹300', 500, 12, true),
  ('FAMILY100', 'flat', 100, 499, NULL, 'Flat ₹100 OFF on family orders above ₹499', 500, 9, true)
ON CONFLICT (code) DO NOTHING;

-- Reload Supabase PostgREST schema cache
NOTIFY pgrst, 'reload schema';
