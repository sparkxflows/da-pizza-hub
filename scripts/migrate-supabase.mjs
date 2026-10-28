import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const DEFAULT_BRANCHES = [
  {
    id: "Hansi",
    name: "Da Pizza Hub – Hansi",
    address:
      "Shop No. 60, Gandhi Market, Near Ambedkar Chowk, Hansi, Haryana 125033",
    phone: "9911273199",
    whatsapp: "919911273199",
    mapsUrl: "https://maps.app.goo.gl/QkPF8iK4bk3E6MpB6",
    swiggyUrl: null,
    zomatoUrl: "https://www.zomato.com/hansi/da-pizza-hub-hansi-locality",
    lat: 29.0941994,
    lng: 75.9622477,
  },
];

const DEFAULT_COUPONS = [
  {
    code: "FIRST30",
    type: "percent",
    value: 30,
    minOrder: 0,
    maxDiscount: 150,
    description: "30% OFF up to ₹150 on your first website order",
    usageLimit: 1000,
    usedCount: 18,
    isActive: true,
  },
  {
    code: "WELCOME50",
    type: "flat",
    value: 50,
    minOrder: 300,
    maxDiscount: null,
    description: "Flat ₹50 OFF on orders above ₹300",
    usageLimit: 500,
    usedCount: 12,
    isActive: true,
  },
  {
    code: "FAMILY100",
    type: "flat",
    value: 100,
    minOrder: 499,
    maxDiscount: null,
    description: "Flat ₹100 OFF on family orders above ₹499",
    usageLimit: 500,
    usedCount: 9,
    isActive: true,
  },
];

function buildPgConfig(rawUrl) {
  const parsed = new URL(rawUrl);
  parsed.searchParams.delete("sslmode");
  parsed.searchParams.delete("sslrootcert");
  parsed.searchParams.delete("sslcert");
  parsed.searchParams.delete("sslkey");
  return {
    connectionString: parsed.toString(),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 12000,
  };
}

async function main() {
  const rawUrl =
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL;

  if (!rawUrl) {
    console.log(
      "[migrate-supabase] No POSTGRES_URL detected in build env — skipping build-time migration (local JSON or runtime init will handle DB)."
    );
    return;
  }

  console.log("[migrate-supabase] Connecting to Supabase PostgreSQL...");
  const { default: pg } = await import("pg");
  const { Client } = pg;
  const client = new Client(buildPgConfig(rawUrl));

  try {
    await client.connect();

    await client.query(`
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
    `);

    await client.query(`
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
    `);

    await client.query(`
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
    `);

    await client.query(`
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
    `);

    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_orders_branch ON orders (branch_id);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders (customer_phone);`
    );

    // Ensure Supabase roles & RLS allow service_role full access and public catalog read
    try {
      await client.query(`ALTER TABLE branches ENABLE ROW LEVEL SECURITY;`);
      await client.query(`ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;`);
      await client.query(`ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;`);
      await client.query(`ALTER TABLE orders ENABLE ROW LEVEL SECURITY;`);
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'branches' AND policyname = 'Public read branches'
          ) THEN
            CREATE POLICY "Public read branches" ON branches FOR SELECT USING (true);
          END IF;
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'menu_items' AND policyname = 'Public read menu_items'
          ) THEN
            CREATE POLICY "Public read menu_items" ON menu_items FOR SELECT USING (true);
          END IF;
        END $$;
      `);
      await client.query(
        `GRANT ALL ON TABLE branches, menu_items, coupons, orders TO postgres, service_role;`
      );
      await client.query(
        `GRANT SELECT ON TABLE branches, menu_items TO anon, authenticated;`
      );
    } catch (permErr) {
      console.warn(
        "[migrate-supabase] Non-fatal permission/RLS note:",
        permErr.message
      );
    }

    // Check existing counts for idempotent seeding
    const branchCountRes = await client.query(
      `SELECT COUNT(*)::int AS cnt FROM branches;`
    );
    const menuCountRes = await client.query(
      `SELECT COUNT(*)::int AS cnt FROM menu_items;`
    );
    const branchCount = branchCountRes.rows[0]?.cnt ?? 0;
    const menuCount = menuCountRes.rows[0]?.cnt ?? 0;
    const isFreshDatabase = branchCount === 0 && menuCount === 0;

    // Ensure only the active Hansi branch is present in branches table
    await client.query(`DELETE FROM branches WHERE id != 'Hansi';`);
    for (const b of DEFAULT_BRANCHES) {
      await client.query(
        `INSERT INTO branches (id, name, address, phone, whatsapp, maps_url, swiggy_url, zomato_url, lat, lng)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           address = EXCLUDED.address,
           phone = EXCLUDED.phone,
           whatsapp = EXCLUDED.whatsapp,
           maps_url = EXCLUDED.maps_url,
           lat = EXCLUDED.lat,
           lng = EXCLUDED.lng;`,
        [
          b.id,
          b.name,
          b.address,
          b.phone,
          b.whatsapp,
          b.mapsUrl,
          b.swiggyUrl,
          b.zomatoUrl,
          b.lat,
          b.lng,
        ]
      );
    }
    console.log(`[migrate-supabase] Hansi branch synced in Supabase branches table.`);

    if (menuCount === 0) {
      const seedMenuPath = path.join(ROOT, "src", "lib", "seed-menu.json");
      const seedMenu = JSON.parse(fs.readFileSync(seedMenuPath, "utf-8"));
      for (const item of seedMenu) {
        const isPizza = item.type === "pizza";
        await client.query(
          `INSERT INTO menu_items (
             id, name, description, category, item_type,
             price_regular, price_medium, price_large, price,
             image, is_best_seller, is_new, is_available
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
           ON CONFLICT (id) DO NOTHING;`,
          [
            item.id,
            item.name,
            item.description ?? "",
            item.category,
            isPizza ? "pizza" : "simple",
            isPizza ? item.prices.regular : null,
            isPizza ? item.prices.medium : null,
            isPizza ? item.prices.large : null,
            isPizza ? null : item.price,
            item.image ?? "/images/pizza-generic/pizza-1.webp",
            !!item.isBestSeller,
            !!item.isNew,
            item.isAvailable !== false,
          ]
        );
      }
      console.log(`[migrate-supabase] Seeded ${seedMenu.length} menu items.`);
    }

    if (isFreshDatabase) {
      for (const c of DEFAULT_COUPONS) {
        await client.query(
          `INSERT INTO coupons (code, type, value, min_order, max_discount, description, usage_limit, used_count, is_active)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           ON CONFLICT (code) DO NOTHING;`,
          [
            c.code,
            c.type,
            c.value,
            c.minOrder,
            c.maxDiscount,
            c.description,
            c.usageLimit,
            c.usedCount,
            c.isActive,
          ]
        );
      }

      const now = Date.now();
      const starterOrders = [
        {
          id: "00000000-0000-4000-8000-000000001001",
          orderNumber: "DPH-1042",
          branchId: "Panki",
          orderType: "delivery",
          customerName: "Aarav Sharma",
          customerPhone: "9876543210",
          deliveryAddress: "MIG-42, Block B, Panki, Kanpur",
          customerLat: 26.4651,
          customerLng: 80.2562,
          distanceKm: 0.8,
          items: [
            {
              lineId: "da-paneer-special-medium",
              itemId: "da-paneer-special",
              name: "Da Paneer Special",
              image: "/images/pizza-named/da-paneer-special.webp",
              basePrice: 369,
              unitPrice: 454,
              quantity: 1,
              customizationSummary: "Medium • Cheese Burst",
            },
            {
              lineId: "choco-lava-cake",
              itemId: "choco-lava-cake",
              name: "Choco Lava Cake",
              image: "/images/dessert/choco-lava-cake.webp",
              basePrice: 109,
              unitPrice: 109,
              quantity: 1,
            },
          ],
          subtotal: 563,
          discount: 100,
          couponCode: "FAMILY100",
          deliveryFee: 0,
          total: 463,
          paymentMethod: "upi",
          scheduleMode: "now",
          status: "completed",
          createdAt: new Date(now - 20 * 3600 * 1000).toISOString(),
        },
        {
          id: "00000000-0000-4000-8000-000000001002",
          orderNumber: "DPH-1043",
          branchId: "Raniya",
          orderType: "pickup",
          customerName: "Priya Verma",
          customerPhone: "9123456780",
          deliveryAddress: "Pickup at Da Pizza Hub – Raniya",
          customerLat: null,
          customerLng: null,
          distanceKm: null,
          items: [
            {
              lineId: "combo-2",
              itemId: "combo-2",
              name: "Combo 2 — 2 Regular Pizzas + Garlic Bread + Coke",
              image: "/images/combos/combo-2.webp",
              basePrice: 349,
              unitPrice: 349,
              quantity: 1,
            },
          ],
          subtotal: 349,
          discount: 50,
          couponCode: "WELCOME50",
          deliveryFee: 0,
          total: 299,
          paymentMethod: "cod",
          scheduleMode: "now",
          status: "completed",
          createdAt: new Date(now - 5 * 86400 * 1000).toISOString(),
        },
        {
          id: "00000000-0000-4000-8000-000000001003",
          orderNumber: "DPH-1044",
          branchId: "Panki",
          orderType: "delivery",
          customerName: "Rohan Gupta",
          customerPhone: "9988776655",
          deliveryAddress: "Flat 302, Swaraj Enclave, Kalyanpur, Kanpur",
          customerLat: 26.479,
          customerLng: 80.268,
          distanceKm: 2.2,
          items: [
            {
              lineId: "tandoori-paneer-medium",
              itemId: "tandoori-paneer",
              name: "Tandoori Paneer",
              image: "/images/pizza-named/tandoori-paneer-pizza.webp",
              basePrice: 309,
              unitPrice: 309,
              quantity: 2,
              customizationSummary: "Medium",
            },
          ],
          subtotal: 618,
          discount: 100,
          couponCode: "FAMILY100",
          deliveryFee: 0,
          total: 518,
          paymentMethod: "upi",
          scheduleMode: "now",
          status: "completed",
          createdAt: new Date(now - 18 * 86400 * 1000).toISOString(),
        },
      ];

      for (const ord of starterOrders) {
        await client.query(
          `INSERT INTO orders (
             id, order_number, branch_id, order_type, customer_name, customer_phone,
             delivery_address, customer_lat, customer_lng, distance_km, items,
             subtotal, discount, coupon_code, delivery_fee, total,
             payment_method, schedule_mode, scheduled_for, status, idempotency_key, created_at
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
           ON CONFLICT (order_number) DO NOTHING;`,
          [
            ord.id,
            ord.orderNumber,
            ord.branchId,
            ord.orderType,
            ord.customerName,
            ord.customerPhone,
            ord.deliveryAddress,
            ord.customerLat,
            ord.customerLng,
            ord.distanceKm,
            JSON.stringify(ord.items),
            ord.subtotal,
            ord.discount,
            ord.couponCode,
            ord.deliveryFee,
            ord.total,
            ord.paymentMethod,
            ord.scheduleMode,
            null,
            ord.status,
            null,
            ord.createdAt,
          ]
        );
      }
      console.log(
        `[migrate-supabase] Seeded ${DEFAULT_COUPONS.length} coupons and ${starterOrders.length} starter orders.`
      );
    }

    try {
      await client.query(`NOTIFY pgrst, 'reload schema';`);
    } catch {
      // ignore if pooler blocks NOTIFY
    }

    console.log("[migrate-supabase] Migration & seed verification complete!");
  } catch (err) {
    console.warn(
      "[migrate-supabase] Warning during build-time migration (runtime init will retry):",
      err.message
    );
  } finally {
    try {
      await client.end();
    } catch {
      // ignore
    }
  }
}

main();
