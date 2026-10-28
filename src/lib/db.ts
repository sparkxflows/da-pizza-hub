import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Pool, type PoolConfig } from "pg";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import seedMenuJson from "./seed-menu.json";
import { DEFAULT_BRANCHES } from "./constants";
import type {
  Branch,
  Coupon,
  Customer,
  CustomerAddress,
  MenuItem,
  Order,
  OrderStatus,
} from "./types";

interface DatabaseSchema {
  branches: Branch[];
  menuItems: MenuItem[];
  coupons: Coupon[];
  orders: Order[];
  customers: Customer[];
  customerAddresses: CustomerAddress[];
}

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL
  ? path.join("/tmp", "dapizzahub-data")
  : path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const SEED_MENU_ITEMS = seedMenuJson as MenuItem[];
const SEED_MENU_ORDER = new Map<string, number>(
  SEED_MENU_ITEMS.map((item, idx) => [item.id, idx])
);
const DEFAULT_BRANCH_ORDER = new Map<string, number>(
  DEFAULT_BRANCHES.map((b, idx) => [b.id, idx])
);

const DEFAULT_COUPONS: Coupon[] = [
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
    description: "Flat ₹100 OFF on family orders above ₹499",
    usageLimit: 500,
    usedCount: 9,
    isActive: true,
  },
];

function getStarterOrders(): Order[] {
  const now = Date.now();
  return [
    {
      id: "00000000-0000-4000-8000-000000001001",
      orderNumber: "DPH-1042",
      branchId: "Hansi",
      orderType: "delivery",
      customerName: "Aarav Sharma",
      customerPhone: "9911273199",
      deliveryAddress: "Shop No. 60, Gandhi Market, Hansi",
      customerLat: 29.0942,
      customerLng: 75.9622,
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
      scheduledFor: null,
      status: "completed",
      createdAt: new Date(now - 20 * 3600 * 1000).toISOString(),
    },
    {
      id: "00000000-0000-4000-8000-000000001002",
      orderNumber: "DPH-1043",
      branchId: "Hansi",
      orderType: "delivery",
      customerName: "Priya Verma",
      customerPhone: "9123456780",
      deliveryAddress: "Model Town, Near Barsi Gate, Hansi",
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
      scheduledFor: null,
      status: "completed",
      createdAt: new Date(now - 5 * 86400 * 1000).toISOString(),
    },
    {
      id: "00000000-0000-4000-8000-000000001003",
      orderNumber: "DPH-1044",
      branchId: "Hansi",
      orderType: "delivery",
      customerName: "Rohan Gupta",
      customerPhone: "9988776655",
      deliveryAddress: "Near Bus Stand, Hansi, Haryana",
      customerLat: 29.096,
      customerLng: 75.964,
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
      scheduledFor: null,
      status: "completed",
      createdAt: new Date(now - 18 * 86400 * 1000).toISOString(),
    },
  ];
}

// ---------------------------------------------------------------------------
// Connection Management (PostgreSQL via `pg` + Supabase REST fallback + JSON)
// ---------------------------------------------------------------------------

declare global {
  // eslint-disable-next-line no-var
  var __dphPgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __dphPgInitPromise: Promise<void> | undefined;
  // eslint-disable-next-line no-var
  var __dphSupabaseClient: SupabaseClient | undefined;
}

function getPostgresUrl(): string | null {
  return (
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    null
  );
}

function getSupabaseRestCredentials(): { url: string; key: string } | null {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  if (url && key) return { url, key };
  return null;
}

function buildPgPoolConfig(rawUrl: string): PoolConfig {
  const parsed = new URL(rawUrl);
  parsed.searchParams.delete("sslmode");
  parsed.searchParams.delete("sslrootcert");
  parsed.searchParams.delete("sslcert");
  parsed.searchParams.delete("sslkey");
  return {
    connectionString: parsed.toString(),
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true,
  };
}

function getPgPool(): Pool | null {
  const rawUrl = getPostgresUrl();
  if (!rawUrl) return null;
  if (!globalThis.__dphPgPool) {
    globalThis.__dphPgPool = new Pool(buildPgPoolConfig(rawUrl));
  }
  return globalThis.__dphPgPool;
}

function getSupabaseClient(): SupabaseClient | null {
  const creds = getSupabaseRestCredentials();
  if (!creds) return null;
  if (!globalThis.__dphSupabaseClient) {
    globalThis.__dphSupabaseClient = createClient(creds.url, creds.key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return globalThis.__dphSupabaseClient;
}

async function ensurePostgresInitialized(pool: Pool): Promise<void> {
  if (!globalThis.__dphPgInitPromise) {
    globalThis.__dphPgInitPromise = (async () => {
      try {
        await pool.query(`
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

        await pool.query(`
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

        await pool.query(`
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

        await pool.query(`
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

        const [bRes, mRes] = await Promise.all([
          pool.query<{ cnt: number }>(`SELECT COUNT(*)::int AS cnt FROM branches`),
          pool.query<{ cnt: number }>(`SELECT COUNT(*)::int AS cnt FROM menu_items`),
        ]);

        const bCount = bRes.rows[0]?.cnt ?? 0;
        const mCount = mRes.rows[0]?.cnt ?? 0;
        const isFresh = bCount === 0 && mCount === 0;

        // Always ensure the active Hansi branch exists in branches table
        for (const b of DEFAULT_BRANCHES) {
          await pool.query(
            `INSERT INTO branches (id, name, address, phone, whatsapp, maps_url, swiggy_url, zomato_url, lat, lng)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
             ON CONFLICT (id) DO UPDATE SET
               name = EXCLUDED.name,
               address = EXCLUDED.address,
               phone = EXCLUDED.phone,
               whatsapp = EXCLUDED.whatsapp,
               maps_url = EXCLUDED.maps_url,
               lat = EXCLUDED.lat,
               lng = EXCLUDED.lng`,
            [
              b.id,
              b.name,
              b.address,
              b.phone,
              b.whatsapp,
              b.mapsUrl,
              b.swiggyUrl ?? null,
              b.zomatoUrl ?? null,
              b.lat,
              b.lng,
            ]
          );
        }

        if (mCount === 0) {
          for (const item of SEED_MENU_ITEMS) {
            const isPizza = item.type === "pizza";
            await pool.query(
              `INSERT INTO menu_items (
                 id, name, description, category, item_type,
                 price_regular, price_medium, price_large, price,
                 image, is_best_seller, is_new, is_available
               ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
               ON CONFLICT (id) DO NOTHING`,
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
        }

        if (isFresh) {
          for (const c of DEFAULT_COUPONS) {
            await pool.query(
              `INSERT INTO coupons (code, type, value, min_order, max_discount, description, usage_limit, used_count, is_active)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
               ON CONFLICT (code) DO NOTHING`,
              [
                c.code,
                c.type,
                c.value,
                c.minOrder,
                c.maxDiscount ?? null,
                c.description,
                c.usageLimit ?? null,
                c.usedCount,
                c.isActive,
              ]
            );
          }

          for (const ord of getStarterOrders()) {
            await pool.query(
              `INSERT INTO orders (
                 id, order_number, branch_id, order_type, customer_name, customer_phone,
                 delivery_address, customer_lat, customer_lng, distance_km, items,
                 subtotal, discount, coupon_code, delivery_fee, total,
                 payment_method, schedule_mode, scheduled_for, status, idempotency_key, created_at
               ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
               ON CONFLICT (order_number) DO NOTHING`,
              [
                ord.id,
                ord.orderNumber,
                ord.branchId,
                ord.orderType,
                ord.customerName,
                ord.customerPhone,
                ord.deliveryAddress,
                ord.customerLat ?? null,
                ord.customerLng ?? null,
                ord.distanceKm ?? null,
                JSON.stringify(ord.items),
                ord.subtotal,
                ord.discount,
                ord.couponCode ?? null,
                ord.deliveryFee,
                ord.total,
                ord.paymentMethod,
                ord.scheduleMode,
                ord.scheduledFor ?? null,
                ord.status,
                ord.idempotencyKey ?? null,
                ord.createdAt,
              ]
            );
          }
        }
      } catch (err) {
        globalThis.__dphPgInitPromise = undefined;
        throw err;
      }
    })();
  }
  return globalThis.__dphPgInitPromise;
}

// ---------------------------------------------------------------------------
// Row Mappers (DB snake_case <-> Domain camelCase)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBranchRow(r: any): Branch {
  return {
    id: String(r.id),
    name: String(r.name),
    address: String(r.address),
    phone: String(r.phone),
    whatsapp: String(r.whatsapp),
    mapsUrl: String(r.maps_url ?? ""),
    swiggyUrl: r.swiggy_url ? String(r.swiggy_url) : undefined,
    zomatoUrl: r.zomato_url ? String(r.zomato_url) : undefined,
    lat: Number(r.lat),
    lng: Number(r.lng),
  };
}

function sortBranches(list: Branch[]): Branch[] {
  return [...list].sort((a, b) => {
    const ia = DEFAULT_BRANCH_ORDER.get(a.id) ?? 999;
    const ib = DEFAULT_BRANCH_ORDER.get(b.id) ?? 999;
    if (ia !== ib) return ia - ib;
    return a.name.localeCompare(b.name);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMenuRow(r: any): MenuItem {
  const base = {
    id: String(r.id),
    name: String(r.name),
    description: String(r.description ?? ""),
    category: r.category as MenuItem["category"],
    image: String(r.image || "/images/pizza-generic/pizza-1.webp"),
    isBestSeller: Boolean(r.is_best_seller),
    isNew: Boolean(r.is_new),
    isAvailable: r.is_available !== false,
  };
  if (r.item_type === "pizza") {
    return {
      ...base,
      type: "pizza",
      prices: {
        regular: Number(r.price_regular ?? 0),
        medium: Number(r.price_medium ?? 0),
        large: Number(r.price_large ?? 0),
      },
    };
  }
  return {
    ...base,
    type: "simple",
    price: Number(r.price ?? 0),
  };
}

function sortMenuItems(list: MenuItem[]): MenuItem[] {
  return [...list].sort((a, b) => {
    const ia = SEED_MENU_ORDER.get(a.id) ?? 9999;
    const ib = SEED_MENU_ORDER.get(b.id) ?? 9999;
    if (ia !== ib) return ia - ib;
    return a.name.localeCompare(b.name);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCouponRow(r: any): Coupon {
  return {
    code: String(r.code),
    type: r.type === "percent" ? "percent" : "flat",
    value: Number(r.value),
    minOrder: Number(r.min_order ?? 0),
    maxDiscount:
      r.max_discount !== null && r.max_discount !== undefined
        ? Number(r.max_discount)
        : undefined,
    description: String(r.description ?? ""),
    usageLimit:
      r.usage_limit !== null && r.usage_limit !== undefined
        ? Number(r.usage_limit)
        : undefined,
    usedCount: Number(r.used_count ?? 0),
    isActive: r.is_active !== false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrderRow(r: any): Order {
  const rawItems =
    typeof r.items === "string"
      ? JSON.parse(r.items)
      : Array.isArray(r.items)
        ? r.items
        : [];
  const createdAt =
    r.created_at instanceof Date
      ? r.created_at.toISOString()
      : String(r.created_at ?? new Date().toISOString());

  return {
    id: String(r.id),
    orderNumber: String(r.order_number),
    branchId: String(r.branch_id),
    orderType: r.order_type === "pickup" ? "pickup" : "delivery",
    customerName: String(r.customer_name),
    customerPhone: String(r.customer_phone),
    deliveryAddress: String(r.delivery_address ?? ""),
    customerLat:
      r.customer_lat !== null && r.customer_lat !== undefined
        ? Number(r.customer_lat)
        : null,
    customerLng:
      r.customer_lng !== null && r.customer_lng !== undefined
        ? Number(r.customer_lng)
        : null,
    distanceKm:
      r.distance_km !== null && r.distance_km !== undefined
        ? Number(r.distance_km)
        : null,
    items: rawItems,
    subtotal: Number(r.subtotal ?? 0),
    discount: Number(r.discount ?? 0),
    couponCode: r.coupon_code ? String(r.coupon_code) : null,
    deliveryFee: Number(r.delivery_fee ?? 0),
    total: Number(r.total ?? 0),
    paymentMethod: r.payment_method === "upi" ? "upi" : "cod",
    scheduleMode: r.schedule_mode === "scheduled" ? "scheduled" : "now",
    scheduledFor: r.scheduled_for ? String(r.scheduled_for) : null,
    status: (r.status as OrderStatus) ?? "new",
    idempotencyKey: r.idempotency_key ? String(r.idempotency_key) : undefined,
    createdAt,
  };
}

// ---------------------------------------------------------------------------
// Local JSON Fallback (used in local dev when Supabase env vars aren't set)
// ---------------------------------------------------------------------------

function seedLocalDatabase(): DatabaseSchema {
  return {
    branches: DEFAULT_BRANCHES,
    menuItems: SEED_MENU_ITEMS.map((item) => ({
      ...item,
      isAvailable: item.isAvailable ?? true,
    })),
    coupons: DEFAULT_COUPONS,
    orders: getStarterOrders(),
    customers: [
      {
        id: "c-hansi-01",
        phone: "9911273199",
        name: "Naman Verma",
        email: "naman@example.com",
        authProvider: "phone",
        createdAt: new Date().toISOString(),
      },
    ],
    customerAddresses: [
      {
        id: "addr-01",
        customerId: "c-hansi-01",
        label: "Home",
        addressText: "Shop No. 60, Gandhi Market, Near Ambedkar Chowk, Hansi, Haryana 125033",
        landmark: "Ambedkar Chowk",
        lat: 29.0941994,
        lng: 75.9622477,
        isDefault: true,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

function readLocalDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = seedLocalDatabase();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
    return {
      branches: parsed.branches?.length ? parsed.branches : DEFAULT_BRANCHES,
      menuItems: parsed.menuItems?.length
        ? parsed.menuItems
        : seedLocalDatabase().menuItems,
      coupons: parsed.coupons ?? DEFAULT_COUPONS,
      orders: parsed.orders ?? [],
      customers: parsed.customers ?? [],
      customerAddresses: parsed.customerAddresses ?? [],
    };
  } catch {
    return seedLocalDatabase();
  }
}

function writeLocalDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmp = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tmp, DB_FILE);
  } catch (err) {
    console.error("Failed to write local DB:", err);
  }
}

// ---------------------------------------------------------------------------
// Public Async Data Layer (Supabase PostgreSQL -> Supabase REST -> Local JSON)
// ---------------------------------------------------------------------------

export async function getBranches(): Promise<Branch[]> {
  const pool = getPgPool();
  if (pool) {
    try {
      await ensurePostgresInitialized(pool);
      const { rows } = await pool.query(
        `SELECT * FROM branches WHERE id = 'Hansi' OR address ILIKE '%Hansi%'`
      );
      if (rows && rows.length > 0) {
        return sortBranches(rows.map(mapBranchRow));
      }
    } catch (err) {
      console.warn("Postgres getBranches fallback:", err);
    }
  }

  const sb = getSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("branches")
        .select("*")
        .or("id.eq.Hansi,address.ilike.%Hansi%");
      if (!error && data && data.length > 0) {
        return sortBranches(data.map(mapBranchRow));
      }
    } catch (err) {
      console.warn("Supabase REST getBranches fallback:", err);
    }
  }

  const local = readLocalDb().branches;
  const filtered = local.filter(
    (b) => b.id === "Hansi" || b.address.toLowerCase().includes("hansi")
  );
  return filtered.length > 0 ? filtered : DEFAULT_BRANCHES;
}

export async function upsertBranch(branch: Branch): Promise<Branch> {
  const pool = getPgPool();
  if (pool) {
    await ensurePostgresInitialized(pool);
    const { rows } = await pool.query(
      `INSERT INTO branches (id, name, address, phone, whatsapp, maps_url, swiggy_url, zomato_url, lat, lng)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         address = EXCLUDED.address,
         phone = EXCLUDED.phone,
         whatsapp = EXCLUDED.whatsapp,
         maps_url = EXCLUDED.maps_url,
         swiggy_url = EXCLUDED.swiggy_url,
         zomato_url = EXCLUDED.zomato_url,
         lat = EXCLUDED.lat,
         lng = EXCLUDED.lng
       RETURNING *`,
      [
        branch.id,
        branch.name,
        branch.address,
        branch.phone,
        branch.whatsapp,
        branch.mapsUrl,
        branch.swiggyUrl ?? null,
        branch.zomatoUrl ?? null,
        branch.lat,
        branch.lng,
      ]
    );
    return mapBranchRow(rows[0]);
  }

  const sb = getSupabaseClient();
  if (sb) {
    const { data, error } = await sb
      .from("branches")
      .upsert(
        {
          id: branch.id,
          name: branch.name,
          address: branch.address,
          phone: branch.phone,
          whatsapp: branch.whatsapp,
          maps_url: branch.mapsUrl,
          swiggy_url: branch.swiggyUrl ?? null,
          zomato_url: branch.zomatoUrl ?? null,
          lat: branch.lat,
          lng: branch.lng,
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();
    if (!error && data) return mapBranchRow(data);
  }

  const db = readLocalDb();
  const idx = db.branches.findIndex((b) => b.id === branch.id);
  if (idx >= 0) db.branches[idx] = branch;
  else db.branches.push(branch);
  writeLocalDb(db);
  return branch;
}

export async function getMenuItems(
  includeUnavailable = false
): Promise<MenuItem[]> {
  const pool = getPgPool();
  if (pool) {
    try {
      await ensurePostgresInitialized(pool);
      const { rows } = includeUnavailable
        ? await pool.query(`SELECT * FROM menu_items`)
        : await pool.query(
            `SELECT * FROM menu_items WHERE is_available IS NOT FALSE`
          );
      if (rows && rows.length > 0) {
        return sortMenuItems(rows.map(mapMenuRow));
      }
    } catch (err) {
      console.warn("Postgres getMenuItems fallback:", err);
    }
  }

  const sb = getSupabaseClient();
  if (sb) {
    try {
      const q = sb.from("menu_items").select("*");
      const { data, error } = includeUnavailable
        ? await q
        : await q.neq("is_available", false);
      if (!error && data && data.length > 0) {
        return sortMenuItems(data.map(mapMenuRow));
      }
    } catch (err) {
      console.warn("Supabase REST getMenuItems fallback:", err);
    }
  }

  const items = readLocalDb().menuItems;
  const source = items && items.length > 0 ? items : SEED_MENU_ITEMS;
  if (includeUnavailable) return source;
  return source.filter((item) => item.isAvailable !== false);
}

export async function upsertMenuItem(item: MenuItem): Promise<MenuItem> {
  const isPizza = item.type === "pizza";
  const pool = getPgPool();
  if (pool) {
    await ensurePostgresInitialized(pool);
    const { rows } = await pool.query(
      `INSERT INTO menu_items (
         id, name, description, category, item_type,
         price_regular, price_medium, price_large, price,
         image, is_best_seller, is_new, is_available
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         category = EXCLUDED.category,
         item_type = EXCLUDED.item_type,
         price_regular = EXCLUDED.price_regular,
         price_medium = EXCLUDED.price_medium,
         price_large = EXCLUDED.price_large,
         price = EXCLUDED.price,
         image = EXCLUDED.image,
         is_best_seller = EXCLUDED.is_best_seller,
         is_new = EXCLUDED.is_new,
         is_available = EXCLUDED.is_available
       RETURNING *`,
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
    return mapMenuRow(rows[0]);
  }

  const sb = getSupabaseClient();
  if (sb) {
    const { data, error } = await sb
      .from("menu_items")
      .upsert(
        {
          id: item.id,
          name: item.name,
          description: item.description ?? "",
          category: item.category,
          item_type: isPizza ? "pizza" : "simple",
          price_regular: isPizza ? item.prices.regular : null,
          price_medium: isPizza ? item.prices.medium : null,
          price_large: isPizza ? item.prices.large : null,
          price: isPizza ? null : item.price,
          image: item.image ?? "/images/pizza-generic/pizza-1.webp",
          is_best_seller: !!item.isBestSeller,
          is_new: !!item.isNew,
          is_available: item.isAvailable !== false,
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();
    if (!error && data) return mapMenuRow(data);
  }

  const db = readLocalDb();
  const idx = db.menuItems.findIndex((i) => i.id === item.id);
  if (idx >= 0) db.menuItems[idx] = item;
  else db.menuItems.push(item);
  writeLocalDb(db);
  return item;
}

export async function patchMenuItem(
  id: string,
  patch: Partial<{
    name: string;
    description: string;
    category: MenuItem["category"];
    image: string;
    isBestSeller: boolean;
    isNew: boolean;
    isAvailable: boolean;
    price: number;
    priceRegular: number;
    priceMedium: number;
    priceLarge: number;
  }>
): Promise<MenuItem | null> {
  const all = await getMenuItems(true);
  const current = all.find((i) => i.id === id);
  if (!current) return null;

  let next: MenuItem;
  if (current.type === "pizza") {
    next = {
      ...current,
      name: patch.name ?? current.name,
      description: patch.description ?? current.description,
      category: patch.category ?? current.category,
      image: patch.image ?? current.image,
      isBestSeller: patch.isBestSeller ?? current.isBestSeller,
      isNew: patch.isNew ?? current.isNew,
      isAvailable: patch.isAvailable ?? current.isAvailable,
      prices: {
        regular: patch.priceRegular ?? current.prices.regular,
        medium: patch.priceMedium ?? current.prices.medium,
        large: patch.priceLarge ?? current.prices.large,
      },
    };
  } else {
    next = {
      ...current,
      name: patch.name ?? current.name,
      description: patch.description ?? current.description,
      category: patch.category ?? current.category,
      image: patch.image ?? current.image,
      isBestSeller: patch.isBestSeller ?? current.isBestSeller,
      isNew: patch.isNew ?? current.isNew,
      isAvailable: patch.isAvailable ?? current.isAvailable,
      price: patch.price ?? current.price,
    };
  }

  return upsertMenuItem(next);
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  const pool = getPgPool();
  if (pool) {
    await ensurePostgresInitialized(pool);
    const res = await pool.query(`DELETE FROM menu_items WHERE id = $1`, [id]);
    return (res.rowCount ?? 0) > 0;
  }

  const sb = getSupabaseClient();
  if (sb) {
    const { error } = await sb.from("menu_items").delete().eq("id", id);
    return !error;
  }

  const db = readLocalDb();
  const prevLen = db.menuItems.length;
  db.menuItems = db.menuItems.filter((i) => i.id !== id);
  if (db.menuItems.length === prevLen) return false;
  writeLocalDb(db);
  return true;
}

export async function getCoupons(): Promise<Coupon[]> {
  const pool = getPgPool();
  if (pool) {
    await ensurePostgresInitialized(pool);
    const { rows } = await pool.query(
      `SELECT * FROM coupons ORDER BY created_at ASC, code ASC`
    );
    return rows.map(mapCouponRow);
  }

  const sb = getSupabaseClient();
  if (sb) {
    const { data, error } = await sb
      .from("coupons")
      .select("*")
      .order("code", { ascending: true });
    if (!error && data) return data.map(mapCouponRow);
  }

  return readLocalDb().coupons;
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  const pool = getPgPool();
  if (pool) {
    await ensurePostgresInitialized(pool);
    const { rows } = await pool.query(
      `SELECT * FROM coupons WHERE UPPER(code) = $1 LIMIT 1`,
      [normalized]
    );
    return rows[0] ? mapCouponRow(rows[0]) : null;
  }

  const sb = getSupabaseClient();
  if (sb) {
    const { data, error } = await sb
      .from("coupons")
      .select("*")
      .eq("code", normalized)
      .maybeSingle();
    if (!error && data) return mapCouponRow(data);
  }

  return (
    readLocalDb().coupons.find((c) => c.code.toUpperCase() === normalized) ??
    null
  );
}

export async function upsertCoupon(coupon: Coupon): Promise<Coupon> {
  const normalized: Coupon = {
    ...coupon,
    code: coupon.code.trim().toUpperCase(),
  };

  const pool = getPgPool();
  if (pool) {
    await ensurePostgresInitialized(pool);
    const { rows } = await pool.query(
      `INSERT INTO coupons (
         code, type, value, min_order, max_discount,
         description, usage_limit, used_count, is_active
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (code) DO UPDATE SET
         type = EXCLUDED.type,
         value = EXCLUDED.value,
         min_order = EXCLUDED.min_order,
         max_discount = EXCLUDED.max_discount,
         description = EXCLUDED.description,
         usage_limit = EXCLUDED.usage_limit,
         used_count = EXCLUDED.used_count,
         is_active = EXCLUDED.is_active
       RETURNING *`,
      [
        normalized.code,
        normalized.type,
        normalized.value,
        normalized.minOrder,
        normalized.maxDiscount ?? null,
        normalized.description,
        normalized.usageLimit ?? null,
        normalized.usedCount,
        normalized.isActive,
      ]
    );
    return mapCouponRow(rows[0]);
  }

  const sb = getSupabaseClient();
  if (sb) {
    const { data, error } = await sb
      .from("coupons")
      .upsert(
        {
          code: normalized.code,
          type: normalized.type,
          value: normalized.value,
          min_order: normalized.minOrder,
          max_discount: normalized.maxDiscount ?? null,
          description: normalized.description,
          usage_limit: normalized.usageLimit ?? null,
          used_count: normalized.usedCount,
          is_active: normalized.isActive,
        },
        { onConflict: "code" }
      )
      .select("*")
      .single();
    if (!error && data) return mapCouponRow(data);
  }

  const db = readLocalDb();
  const idx = db.coupons.findIndex((c) => c.code === normalized.code);
  if (idx >= 0) db.coupons[idx] = normalized;
  else db.coupons.push(normalized);
  writeLocalDb(db);
  return normalized;
}

export async function patchCoupon(
  code: string,
  patch: Partial<Coupon>
): Promise<Coupon | null> {
  const existing = await getCouponByCode(code);
  if (!existing) return null;

  return upsertCoupon({
    ...existing,
    ...patch,
    code: existing.code, // keep primary key intact
  });
}

export async function deleteCoupon(code: string): Promise<boolean> {
  const normalized = code.trim().toUpperCase();
  const pool = getPgPool();
  if (pool) {
    await ensurePostgresInitialized(pool);
    const res = await pool.query(
      `DELETE FROM coupons WHERE UPPER(code) = $1`,
      [normalized]
    );
    return (res.rowCount ?? 0) > 0;
  }

  const sb = getSupabaseClient();
  if (sb) {
    const { error } = await sb
      .from("coupons")
      .delete()
      .eq("code", normalized);
    return !error;
  }

  const db = readLocalDb();
  const prev = db.coupons.length;
  db.coupons = db.coupons.filter((c) => c.code.toUpperCase() !== normalized);
  if (db.coupons.length === prev) return false;
  writeLocalDb(db);
  return true;
}

export async function incrementCouponUsage(code: string): Promise<void> {
  const normalized = code.trim().toUpperCase();
  const pool = getPgPool();
  if (pool) {
    await ensurePostgresInitialized(pool);
    await pool.query(
      `UPDATE coupons SET used_count = COALESCE(used_count, 0) + 1 WHERE UPPER(code) = $1`,
      [normalized]
    );
    return;
  }

  const existing = await getCouponByCode(normalized);
  if (!existing) return;
  await patchCoupon(normalized, { usedCount: existing.usedCount + 1 });
}

export async function getOrders(): Promise<Order[]> {
  const pool = getPgPool();
  if (pool) {
    await ensurePostgresInitialized(pool);
    const { rows } = await pool.query(
      `SELECT * FROM orders ORDER BY created_at DESC`
    );
    return rows.map(mapOrderRow);
  }

  const sb = getSupabaseClient();
  if (sb) {
    const { data, error } = await sb
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) return data.map(mapOrderRow);
  }

  return [...readLocalDb().orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getOrderByNumberOrId(ref: string): Promise<Order | null> {
  const cleanRef = ref.trim();
  if (!cleanRef) return null;

  const pool = getPgPool();
  if (pool) {
    await ensurePostgresInitialized(pool);
    const { rows } = await pool.query(
      `SELECT * FROM orders WHERE order_number = $1 OR id::text = $1 LIMIT 1`,
      [cleanRef]
    );
    return rows[0] ? mapOrderRow(rows[0]) : null;
  }

  const sb = getSupabaseClient();
  if (sb) {
    const byNumber = await sb
      .from("orders")
      .select("*")
      .eq("order_number", cleanRef)
      .maybeSingle();
    if (!byNumber.error && byNumber.data) return mapOrderRow(byNumber.data);

    if (UUID_REGEX.test(cleanRef)) {
      const byId = await sb
        .from("orders")
        .select("*")
        .eq("id", cleanRef)
        .maybeSingle();
      if (!byId.error && byId.data) return mapOrderRow(byId.data);
    }
  }

  const orders = readLocalDb().orders;
  return (
    orders.find((o) => o.orderNumber === cleanRef || o.id === cleanRef) ?? null
  );
}

export async function createOrder(order: Order): Promise<Order> {
  const normalizedId = UUID_REGEX.test(order.id)
    ? order.id
    : crypto.randomUUID();
  const cleanIdempotencyKey = order.idempotencyKey?.trim() || null;
  const targetBranchId = order.branchId || "Hansi";

  const pool = getPgPool();
  if (pool) {
    try {
      await ensurePostgresInitialized(pool);

      // Self-healing: Ensure target branch exists in branches table to satisfy FK constraint
      await pool.query(
        `INSERT INTO branches (id, name, address, phone, whatsapp, maps_url, lat, lng)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [
          targetBranchId,
          targetBranchId === "Hansi" ? "Da Pizza Hub – Hansi" : targetBranchId,
          "Shop No. 60, Gandhi Market, Near Ambedkar Chowk, Hansi, Haryana 125033",
          "9911273199",
          "919911273199",
          "https://maps.app.goo.gl/QkPF8iK4bk3E6MpB6",
          29.0941994,
          75.9622477,
        ]
      );

      if (cleanIdempotencyKey) {
        const existing = await pool.query(
          `SELECT * FROM orders WHERE idempotency_key = $1 LIMIT 1`,
          [cleanIdempotencyKey]
        );
        if (existing.rows[0]) {
          return mapOrderRow(existing.rows[0]);
        }
      }

      const { rows } = await pool.query(
        `INSERT INTO orders (
           id, order_number, branch_id, order_type, customer_name, customer_phone,
           delivery_address, customer_lat, customer_lng, distance_km, items,
           subtotal, discount, coupon_code, delivery_fee, total,
           payment_method, schedule_mode, scheduled_for, status, idempotency_key, created_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
         RETURNING *`,
        [
          normalizedId,
          order.orderNumber,
          targetBranchId,
          order.orderType,
          order.customerName,
          order.customerPhone,
          order.deliveryAddress,
          order.customerLat ?? null,
          order.customerLng ?? null,
          order.distanceKm ?? null,
          JSON.stringify(order.items),
          order.subtotal,
          order.discount,
          order.couponCode ?? null,
          order.deliveryFee,
          order.total,
          order.paymentMethod,
          order.scheduleMode,
          order.scheduledFor ?? null,
          order.status,
          cleanIdempotencyKey,
          order.createdAt,
        ]
      );
      if (rows && rows[0]) {
        return mapOrderRow(rows[0]);
      }
    } catch (pgErr) {
      console.warn("Postgres createOrder error, trying fallback:", pgErr);
    }
  }

  const sb = getSupabaseClient();
  if (sb) {
    try {
      await sb.from("branches").upsert(
        {
          id: targetBranchId,
          name: "Da Pizza Hub – Hansi",
          address:
            "Shop No. 60, Gandhi Market, Near Ambedkar Chowk, Hansi, Haryana 125033",
          phone: "9911273199",
          whatsapp: "919911273199",
          maps_url: "https://maps.app.goo.gl/QkPF8iK4bk3E6MpB6",
          lat: 29.0941994,
          lng: 75.9622477,
        },
        { onConflict: "id" }
      );

      if (cleanIdempotencyKey) {
        const existing = await sb
          .from("orders")
          .select("*")
          .eq("idempotency_key", cleanIdempotencyKey)
          .maybeSingle();
        if (!existing.error && existing.data) return mapOrderRow(existing.data);
      }

      const { data, error } = await sb
        .from("orders")
        .insert({
          id: normalizedId,
          order_number: order.orderNumber,
          branch_id: targetBranchId,
          order_type: order.orderType,
          customer_name: order.customerName,
          customer_phone: order.customerPhone,
          delivery_address: order.deliveryAddress,
          customer_lat: order.customerLat ?? null,
          customer_lng: order.customerLng ?? null,
          distance_km: order.distanceKm ?? null,
          items: order.items,
          subtotal: order.subtotal,
          discount: order.discount,
          coupon_code: order.couponCode ?? null,
          delivery_fee: order.deliveryFee,
          total: order.total,
          payment_method: order.paymentMethod,
          schedule_mode: order.scheduleMode,
          scheduled_for: order.scheduledFor ?? null,
          status: order.status,
          idempotency_key: cleanIdempotencyKey,
          created_at: order.createdAt,
        })
        .select("*")
        .single();
      if (!error && data) return mapOrderRow(data);
    } catch (sbErr) {
      console.warn("Supabase REST createOrder error, trying local fallback:", sbErr);
    }
  }

  const db = readLocalDb();
  if (cleanIdempotencyKey) {
    const existing = db.orders.find(
      (o) => o.idempotencyKey === cleanIdempotencyKey
    );
    if (existing) return existing;
  }
  const toSave: Order = {
    ...order,
    id: normalizedId,
    branchId: targetBranchId,
  };
  db.orders.unshift(toSave);
  writeLocalDb(db);
  return toSave;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  const cleanId = id.trim();
  if (!cleanId) return null;

  const pool = getPgPool();
  if (pool) {
    await ensurePostgresInitialized(pool);
    const { rows } = await pool.query(
      `UPDATE orders SET status = $2 WHERE id::text = $1 OR order_number = $1 RETURNING *`,
      [cleanId, status]
    );
    return rows[0] ? mapOrderRow(rows[0]) : null;
  }

  const sb = getSupabaseClient();
  if (sb) {
    const col = UUID_REGEX.test(cleanId) ? "id" : "order_number";
    const { data, error } = await sb
      .from("orders")
      .update({ status })
      .eq(col, cleanId)
      .select("*")
      .maybeSingle();
    if (!error && data) return mapOrderRow(data);
  }

  const db = readLocalDb();
  const target = db.orders.find(
    (o) => o.id === cleanId || o.orderNumber === cleanId
  );
  if (!target) return null;
  target.status = status;
  writeLocalDb(db);
  return target;
}

export async function getDatabaseHealth(): Promise<{
  provider: "supabase-postgres" | "supabase-rest" | "local-json";
  connected: boolean;
  dbRegion: string | null;
  counts: {
    branches: number;
    menuItems: number;
    coupons: number;
    orders: number;
  };
}> {
  const hostHint = process.env.POSTGRES_HOST || process.env.POSTGRES_URL || "";
  const regionMatch = hostHint.match(/([a-z]{2}-[a-z]+-\d)/i);
  const dbRegion = regionMatch ? regionMatch[1].toLowerCase() : null;

  const pool = getPgPool();
  if (pool) {
    await ensurePostgresInitialized(pool);
    const [b, m, c, o] = await Promise.all([
      pool.query<{ cnt: number }>(`SELECT COUNT(*)::int AS cnt FROM branches`),
      pool.query<{ cnt: number }>(`SELECT COUNT(*)::int AS cnt FROM menu_items`),
      pool.query<{ cnt: number }>(`SELECT COUNT(*)::int AS cnt FROM coupons`),
      pool.query<{ cnt: number }>(`SELECT COUNT(*)::int AS cnt FROM orders`),
    ]);
    return {
      provider: "supabase-postgres",
      connected: true,
      dbRegion,
      counts: {
        branches: b.rows[0]?.cnt ?? 0,
        menuItems: m.rows[0]?.cnt ?? 0,
        coupons: c.rows[0]?.cnt ?? 0,
        orders: o.rows[0]?.cnt ?? 0,
      },
    };
  }

  const sb = getSupabaseClient();
  if (sb) {
    const [branches, menuItems, coupons, orders] = await Promise.all([
      getBranches(),
      getMenuItems(true),
      getCoupons(),
      getOrders(),
    ]);
    return {
      provider: "supabase-rest",
      connected: true,
      dbRegion,
      counts: {
        branches: branches.length,
        menuItems: menuItems.length,
        coupons: coupons.length,
        orders: orders.length,
      },
    };
  }

  const local = readLocalDb();
  return {
    provider: "local-json",
    connected: true,
    dbRegion: null,
    counts: {
      branches: local.branches.length,
      menuItems: local.menuItems.length,
      coupons: local.coupons.length,
      orders: local.orders.length,
    },
  };
}

// ---------------------------------------------------------------------------
// Customer & Customer Addresses CRUD
// ---------------------------------------------------------------------------

export async function findCustomerByPhone(phone: string): Promise<Customer | null> {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const sb = getSupabaseClient();
  if (sb) {
    try {
      const { data } = await sb.from("customers").select("*").eq("phone", cleanPhone).maybeSingle();
      if (data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          authProvider: data.auth_provider,
          avatarUrl: data.avatar_url,
          createdAt: data.created_at,
        };
      }
    } catch {}
  }
  const db = readLocalDb();
  const c = db.customers.find((cust) => cust.phone && cust.phone.replace(/\D/g, "").slice(-10) === cleanPhone);
  return c ?? null;
}

export async function findCustomerById(id: string): Promise<Customer | null> {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      const { data } = await sb.from("customers").select("*").eq("id", id).maybeSingle();
      if (data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          authProvider: data.auth_provider,
          avatarUrl: data.avatar_url,
          createdAt: data.created_at,
        };
      }
    } catch {}
  }
  const db = readLocalDb();
  return db.customers.find((c) => c.id === id) ?? null;
}

export async function findCustomerByEmail(email: string): Promise<Customer | null> {
  const clean = email.trim().toLowerCase();
  const sb = getSupabaseClient();
  if (sb) {
    try {
      const { data } = await sb.from("customers").select("*").eq("email", clean).maybeSingle();
      if (data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          authProvider: data.auth_provider,
          avatarUrl: data.avatar_url,
          createdAt: data.created_at,
        };
      }
    } catch {}
  }
  const db = readLocalDb();
  return db.customers.find((c) => c.email?.trim().toLowerCase() === clean) ?? null;
}

export interface CustomerWithStats extends Customer {
  orderCount: number;
  totalSpent: number;
  lastOrderDate?: string | null;
}

export async function getAllCustomersWithStats(): Promise<CustomerWithStats[]> {
  const sb = getSupabaseClient();
  let customers: Customer[] = [];
  let ordersList: any[] = [];

  if (sb) {
    try {
      const { data: custData } = await sb
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (custData && custData.length > 0) {
        customers = custData.map((c: any) => ({
          id: c.id,
          name: c.name || "Customer",
          email: c.email || null,
          phone: c.phone || undefined,
          authProvider: c.auth_provider || "supabase",
          avatarUrl: c.avatar_url || null,
          createdAt: c.created_at || new Date().toISOString(),
        }));
      }

      const { data: ordData } = await sb
        .from("orders")
        .select("id, total, customer_phone, customer_email, created_at");
      if (ordData) {
        ordersList = ordData;
      }
    } catch (e) {
      console.error("Error fetching customers from Supabase:", e);
    }
  }

  if (customers.length === 0) {
    const db = readLocalDb();
    customers = db.customers;
    ordersList = db.orders;
  }

  return customers.map((c) => {
    const cPhone = c.phone ? c.phone.replace(/\D/g, "").slice(-10) : "";
    const cEmail = c.email ? c.email.trim().toLowerCase() : "";

    const userOrders = ordersList.filter((o: any) => {
      const oPhone = (o.customer_phone || o.customerPhone || "")
        .replace(/\D/g, "")
        .slice(-10);
      const oEmail = (o.customer_email || o.customerEmail || "")
        .trim()
        .toLowerCase();
      if (cPhone && oPhone && cPhone === oPhone) return true;
      if (cEmail && oEmail && cEmail === oEmail) return true;
      return false;
    });

    const totalSpent = userOrders.reduce(
      (sum, o) => sum + (Number(o.total) || 0),
      0
    );
    const lastOrderDate =
      userOrders.length > 0
        ? userOrders[0].created_at || userOrders[0].createdAt
        : null;

    return {
      ...c,
      orderCount: userOrders.length,
      totalSpent,
      lastOrderDate,
    };
  });
}

export async function createOrUpdateCustomer(data: {
  id?: string;
  phone?: string | null;
  name?: string;
  email?: string | null;
  authProvider?: "phone" | "supabase" | "google" | string;
  avatarUrl?: string | null;
}): Promise<Customer> {
  const cleanPhone = data.phone ? data.phone.replace(/\D/g, "").slice(-10) : "";
  const cleanEmail = data.email?.trim().toLowerCase() || "";
  const cleanName = data.name?.trim() || (cleanEmail ? cleanEmail.split("@")[0] : "Customer");
  const provider = data.authProvider || (cleanEmail ? "supabase" : "phone");

  const sb = getSupabaseClient();
  if (sb) {
    try {
      let existingId = data.id;
      if (!existingId && cleanEmail) {
        const { data: byEmail } = await sb.from("customers").select("id").eq("email", cleanEmail).maybeSingle();
        if (byEmail?.id) existingId = byEmail.id;
      }
      if (!existingId && cleanPhone) {
        const { data: byPhone } = await sb.from("customers").select("id").eq("phone", cleanPhone).maybeSingle();
        if (byPhone?.id) existingId = byPhone.id;
      }

      const id = existingId || `cust_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const payload: any = {
        id,
        name: cleanName,
        email: cleanEmail || null,
        phone: cleanPhone || null,
        auth_provider: provider,
      };
      if (data.avatarUrl) payload.avatar_url = data.avatarUrl;

      const { data: saved, error } = await sb.from("customers").upsert(payload).select().single();
      if (!error && saved) {
        return {
          id: saved.id,
          name: saved.name,
          email: saved.email,
          phone: saved.phone || undefined,
          authProvider: saved.auth_provider,
          avatarUrl: saved.avatar_url,
          createdAt: saved.created_at,
        };
      }
    } catch (e) {
      console.error("Supabase customer upsert error:", e);
    }
  }

  const db = readLocalDb();
  let existing = db.customers.find((c) => {
    if (cleanEmail && c.email?.trim().toLowerCase() === cleanEmail) return true;
    if (cleanPhone && c.phone && c.phone.replace(/\D/g, "").slice(-10) === cleanPhone) return true;
    return false;
  });

  if (existing) {
    if (cleanName) existing.name = cleanName;
    if (cleanEmail) existing.email = cleanEmail;
    if (cleanPhone) existing.phone = cleanPhone;
    if (provider) existing.authProvider = provider;
    if (data.avatarUrl) existing.avatarUrl = data.avatarUrl;
    writeLocalDb(db);
    return existing;
  }

  const newCust: Customer = {
    id: data.id || `cust_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    phone: cleanPhone || undefined,
    name: cleanName,
    email: cleanEmail || null,
    authProvider: provider,
    avatarUrl: data.avatarUrl || null,
    createdAt: new Date().toISOString(),
  };

  db.customers.unshift(newCust);
  writeLocalDb(db);
  return newCust;
}

export async function getCustomerAddresses(customerId: string): Promise<CustomerAddress[]> {
  const db = readLocalDb();
  return db.customerAddresses.filter((a) => a.customerId === customerId);
}

export async function addCustomerAddress(data: {
  customerId: string;
  label: string;
  addressText: string;
  landmark?: string;
  lat?: number | null;
  lng?: number | null;
  isDefault?: boolean;
}): Promise<CustomerAddress> {
  const db = readLocalDb();
  if (data.isDefault) {
    db.customerAddresses.forEach((a) => {
      if (a.customerId === data.customerId) a.isDefault = false;
    });
  }

  const newAddr: CustomerAddress = {
    id: `addr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    customerId: data.customerId,
    label: data.label || "Home",
    addressText: data.addressText,
    landmark: data.landmark || "",
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    isDefault: data.isDefault ?? db.customerAddresses.filter((a) => a.customerId === data.customerId).length === 0,
    createdAt: new Date().toISOString(),
  };

  db.customerAddresses.unshift(newAddr);
  writeLocalDb(db);
  return newAddr;
}

export async function deleteCustomerAddress(
  customerId: string,
  addressId: string
): Promise<boolean> {
  const db = readLocalDb();
  const initLen = db.customerAddresses.length;
  db.customerAddresses = db.customerAddresses.filter(
    (a) => !(a.id === addressId && a.customerId === customerId)
  );
  if (db.customerAddresses.length !== initLen) {
    writeLocalDb(db);
    return true;
  }
  return false;
}

export async function getCustomerOrders(
  phone?: string,
  name?: string,
  email?: string | null
): Promise<Order[]> {
  const cleanPhone = phone ? phone.replace(/\D/g, "").slice(-10) : "";
  const cleanName = name ? name.trim().toLowerCase() : "";
  const cleanEmail = email ? email.trim().toLowerCase() : "";
  const allOrders = await getOrders();
  return allOrders.filter((o) => {
    if (
      cleanPhone &&
      o.customerPhone &&
      o.customerPhone.replace(/\D/g, "").slice(-10) === cleanPhone
    ) {
      return true;
    }
    if (
      cleanEmail &&
      o.customerEmail &&
      o.customerEmail.trim().toLowerCase() === cleanEmail
    ) {
      return true;
    }
    if (
      cleanName &&
      o.customerName &&
      o.customerName.trim().toLowerCase() === cleanName
    ) {
      return true;
    }
    return false;
  });
}

