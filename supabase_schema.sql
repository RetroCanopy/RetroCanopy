-- ==============================================================================
-- RETROCANOPY SUPABASE DATABASE SCHEMA
-- Execute this script in Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    category TEXT NOT NULL,
    badge TEXT,
    image_url TEXT NOT NULL,
    description TEXT,
    available_sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL'],
    is_featured BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0
);

-- 2. CREATOR APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.creator_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    creator_name TEXT NOT NULL,
    channel_url TEXT NOT NULL,
    audience_size TEXT NOT NULL,
    desired_products TEXT NOT NULL,
    business_email TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'contacted', 'rejected'))
);

-- 3. ORGANIZATION & BULK ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.organization_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    organization_name TEXT NOT NULL,
    organization_type TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    deadline DATE,
    products_needed TEXT[] DEFAULT ARRAY[]::TEXT[],
    quantity_tier TEXT NOT NULL,
    tax_exempt TEXT DEFAULT 'No',
    artwork_link TEXT,
    notes TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'quoting', 'invoiced', 'production', 'shipped', 'cancelled'))
);

-- 4. PRE-ORDERS / VAULT PURCHASES TABLE
CREATE TABLE IF NOT EXISTS public.preorders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    product_name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    size TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'processing', 'shipped', 'delivered'))
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preorders ENABLE ROW LEVEL SECURITY;

-- Anyone can view active products
CREATE POLICY "Public read access for active products"
    ON public.products FOR SELECT
    USING (is_active = true);

-- Anyone can submit creator applications
CREATE POLICY "Public insert access for creator applications"
    ON public.creator_applications FOR INSERT
    WITH CHECK (true);

-- Anyone can submit organization bulk quote requests
CREATE POLICY "Public insert access for organization orders"
    ON public.organization_orders FOR INSERT
    WITH CHECK (true);

-- Anyone can submit pre-orders
CREATE POLICY "Public insert access for preorders"
    ON public.preorders FOR INSERT
    WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA: 7 CURRENT VAULT PRODUCTS
-- ==============================================================================
INSERT INTO public.products (name, slug, price, category, badge, image_url, description, available_sizes, display_order)
VALUES
    ('SIGNATURE LOGO TEE', 'signature-logo-tee', 38.00, 'Apparel', 'LIMITED DROP', 'assets/vault_drop_tee.png', 'Heavyweight 240 GSM combed cotton vintage wash tee featuring the signature Retrocanopy sun and tree silhouette with grid print.', ARRAY['S', 'M', 'L', 'XL'], 1),
    ('RETROCANOPY HOODIE', 'retrocanopy-hoodie', 78.00, 'Apparel', 'HEAVYWEIGHT FLEECE', 'assets/vault_drop_hoodie.png', 'Premium 450 GSM reverse-weave hoodie featuring official Retrocanopy chest print and neon contrast drawstrings.', ARRAY['S', 'M', 'L', 'XL'], 2),
    ('RETROCANOPY SNAPBACK', 'retrocanopy-snapback', 34.00, 'Headwear', '3D PUFF EMBROIDERY', 'assets/vault_drop_cap.png', 'Structured 6-panel snapback cap featuring metallic 3D puff embroidery of the canonical Retrocanopy sun motif.', ARRAY['ONE SIZE'], 3),
    ('ARCADE HERO BOMBER', 'arcade-hero-bomber', 128.00, 'Outerwear', 'COLLECTOR EDITION', 'assets/vault_drop_bomber.jpg', 'Satin finish flight jacket with woven sleeve patches, high-density chest badge, and custom interior synthwave lining.', ARRAY['S', 'M', 'L', 'XL'], 4),
    ('RETROCANOPY BEANIE', 'retrocanopy-beanie', 28.00, 'Headwear', 'WOVEN PATCH', 'assets/vault_drop_beanie.jpg', 'Ribbed acrylic knit beanie with official Retrocanopy branded sunset patch.', ARRAY['ONE SIZE'], 5),
    ('CYBER LASER TUMBLER', 'cyber-laser-tumbler', 36.00, 'Drinkware', 'LASER ETCHED', 'assets/vault_drop_tumbler.jpg', '20oz vacuum-insulated double-wall stainless steel tumbler with precision 360-degree laser engraved branding.', ARRAY['20oz'], 6),
    ('RETROCANOPY DESK MAT', 'retrocanopy-desk-mat', 42.00, 'Accessories', 'STITCHED EDGE', 'assets/vault_drop_deskmat.png', '900x400mm ultra-smooth micro-weave desk mat with non-slip rubber base and edge stitching.', ARRAY['900x400mm'], 7)
ON CONFLICT (slug) DO UPDATE
SET
    price = EXCLUDED.price,
    image_url = EXCLUDED.image_url,
    badge = EXCLUDED.badge;

-- ==============================================================================
-- 5. ADMIN & AUTH ACCOUNTS TABLE (PROTECTED ROUTES & OWNER APPROVAL)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_accounts (
    email_key TEXT PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Denied', 'Revoked')),
    is_owner BOOLEAN NOT NULL DEFAULT false,
    deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_accounts_auth_user_id ON public.admin_accounts(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_status ON public.admin_accounts(status);

INSERT INTO public.admin_accounts (email_key, name, email, status, is_owner, deleted)
VALUES ('josephcole001.ai@gmail.com', 'Joseph Cole (Owner)', 'josephcole001.ai@gmail.com', 'Approved', true, false)
ON CONFLICT (email_key) DO UPDATE
SET status = 'Approved', is_owner = true, deleted = false, updated_at = now();

-- ==============================================================================
-- 6. ARCADE ACCOUNTS & LEADERBOARD TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.arcade_accounts (
    username_key TEXT PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    username TEXT NOT NULL,
    pin TEXT DEFAULT '',
    email TEXT,
    xp INTEGER NOT NULL DEFAULT 0,
    best_score INTEGER NOT NULL DEFAULT 0,
    used_coupons JSONB NOT NULL DEFAULT '{}'::jsonb,
    active_checkout_coupon TEXT DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_arcade_accounts_best_score ON public.arcade_accounts(best_score DESC);
CREATE INDEX IF NOT EXISTS idx_arcade_accounts_auth_user_id ON public.arcade_accounts(auth_user_id);

ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arcade_accounts ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.admin_accounts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.arcade_accounts TO anon, authenticated;

CREATE POLICY "Allow read admin_accounts"
    ON public.admin_accounts FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow insert admin_accounts"
    ON public.admin_accounts FOR INSERT
    TO anon, authenticated
    WITH CHECK (email_key = lower(email));

CREATE POLICY "Allow update admin_accounts"
    ON public.admin_accounts FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (email_key = lower(email));

CREATE POLICY "Allow read arcade_accounts"
    ON public.arcade_accounts FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow insert arcade_accounts"
    ON public.arcade_accounts FOR INSERT
    TO anon, authenticated
    WITH CHECK (username_key = lower(username));

CREATE POLICY "Allow update arcade_accounts"
    ON public.arcade_accounts FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (username_key = lower(username));
