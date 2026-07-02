-- ─────────────────────────────────────────────────────────────────────────────
-- Sitara Pizza & Fried Chicks — Neon Postgres Schema
-- Run this in: https://console.neon.tech → SQL Editor (or psql)
-- ─────────────────────────────────────────────────────────────────────────────

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()

-- ─── ENUMS ───────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending','confirmed','preparing','out_for_delivery','delivered','cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('cod','jazzcash','easypaisa');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('unpaid','paid','refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer','admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── PROFILES ────────────────────────────────────────────────────────────────
-- Links to Supabase Auth users (uuid). If not using Supabase Auth,
-- handle user registration yourself in the backend.
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT,
  phone       TEXT,
  role        user_role NOT NULL DEFAULT 'customer',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CATEGORIES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  sort_order  INT  NOT NULL DEFAULT 0
);

-- ─── MENU ITEMS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  base_price   NUMERIC(10,2) NOT NULL,
  image_url    TEXT,
  is_available BOOL NOT NULL DEFAULT TRUE,
  is_spicy     BOOL NOT NULL DEFAULT FALSE,
  tags         TEXT[] DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ITEM VARIANTS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS item_variants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id  UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,         -- e.g. "Small (6\")"
  price_delta   NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- ─── ADDONS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id  UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  price         NUMERIC(10,2) NOT NULL
);

-- ─── ADDRESSES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label         TEXT,                  -- "Home", "Work", etc.
  address_line  TEXT NOT NULL,
  city          TEXT NOT NULL,
  is_default    BOOL NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PROMO CODES ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promo_codes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              TEXT NOT NULL UNIQUE,
  discount_percent  NUMERIC(5,2),       -- e.g. 20 for 20%
  discount_flat     NUMERIC(10,2),      -- e.g. 50 for PKR 50 off
  min_order_amount  NUMERIC(10,2) DEFAULT 0,
  max_uses          INT,
  used_count        INT NOT NULL DEFAULT 0,
  active            BOOL NOT NULL DEFAULT TRUE,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ORDERS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  status          order_status NOT NULL DEFAULT 'pending',
  subtotal        NUMERIC(10,2) NOT NULL,
  discount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee    NUMERIC(10,2) NOT NULL,
  total           NUMERIC(10,2) NOT NULL,
  address_id      UUID REFERENCES addresses(id),
  promo_code      TEXT,
  payment_method  payment_method NOT NULL DEFAULT 'cod',
  payment_status  payment_status NOT NULL DEFAULT 'unpaid',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ORDER ITEMS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id  UUID NOT NULL REFERENCES menu_items(id),
  variant_id    UUID,
  quantity      INT NOT NULL DEFAULT 1,
  unit_price    NUMERIC(10,2) NOT NULL,  -- price at time of order
  addons        JSONB NOT NULL DEFAULT '[]',
  notes         TEXT
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── SEED DATA ───────────────────────────────────────────────────────────────
-- Sample categories
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Pizza',         'pizza',          0),
  ('Fried Chicken', 'fried-chicken',  1),
  ('Combos',        'combos',         2),
  ('Sides',         'sides',          3),
  ('Drinks',        'drinks',         4),
  ('Deals',         'deals',          5)
ON CONFLICT (slug) DO NOTHING;

-- Sample promo codes
INSERT INTO promo_codes (code, discount_percent, min_order_amount, active) VALUES
  ('SITARA20', 20, 500, TRUE),
  ('WELCOME50', NULL, 300, TRUE)
ON CONFLICT (code) DO NOTHING;

-- ─── END ─────────────────────────────────────────────────────────────────────
-- After running this schema, add menu items via the admin panel
-- at http://localhost:8000/admin or /admin in the frontend.
