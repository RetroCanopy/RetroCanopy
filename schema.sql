-- ==============================================================================
-- RETROCANOPY COMPLETE DATABASE SCHEMA
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL DEFAULT 'apparel',
    badge TEXT DEFAULT 'VAULT DROP',
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT NOT NULL,
    available_sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL'],
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
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

-- 3. ORGANIZATION & BULK QUOTE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.organization_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    organization_name TEXT NOT NULL,
    organization_type TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    deadline DATE NOT NULL,
    products_needed TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    quantity_tier TEXT NOT NULL,
    tax_exempt TEXT DEFAULT 'No',
    artwork_link TEXT,
    notes TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'quoted', 'in_production', 'completed', 'canceled'))
);

-- 4. DIRECT PRE-ORDERS / CHECKOUT TABLE
CREATE TABLE IF NOT EXISTS public.pre_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    product_name TEXT NOT NULL,
    size TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    customer_email TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'fulfilled', 'canceled'))
);

-- 5. SEED PRODUCTS (Matches current Retrocanopy website catalog)
INSERT INTO public.products (name, slug, category, badge, price, image_url, available_sizes, display_order)
VALUES
    ('SIGNATURE LOGO TEE', 'signature-logo-tee', 'tees', 'VAULT DROP #001', 32.00, 'assets/vault_drop_tee.png', ARRAY['S', 'M', 'L', 'XL'], 1),
    ('RETROCANOPY HOODIE', 'retrocanopy-hoodie', 'hoodies', 'VAULT DROP #002', 68.00, 'assets/vault_drop_hoodie.png', ARRAY['S', 'M', 'L', 'XL'], 2),
    ('RETROCANOPY SNAPBACK', 'retrocanopy-snapback', 'headwear', 'LIMITED DROP', 34.00, 'assets/vault_drop_cap.png', ARRAY['ONE SIZE'], 3),
    ('ARCADE HERO BOMBER', 'arcade-hero-bomber', 'jackets', 'VAULT EXCLUSIVE', 115.00, 'assets/vault_drop_bomber.jpg', ARRAY['S', 'M', 'L', 'XL'], 4),
    ('RETROCANOPY BEANIE', 'retrocanopy-beanie', 'headwear', 'LIMITED DROP', 26.00, 'assets/vault_drop_beanie.jpg', ARRAY['ONE SIZE'], 5),
    ('CYBER LASER TUMBLER', 'cyber-laser-tumbler', 'accessories', 'VAULT DROP #003', 38.00, 'assets/vault_drop_tumbler.jpg', ARRAY['20oz'], 6),
    ('RETROCANOPY DESK MAT', 'retrocanopy-desk-mat', 'accessories', 'ACCESSORIES', 42.00, 'assets/vault_drop_deskmat.png', ARRAY['900x400mm'], 7)
ON CONFLICT (slug) DO NOTHING;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_orders ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read active products
CREATE POLICY "Allow public read access to active products"
    ON public.products FOR SELECT
    USING (is_active = TRUE);

-- Creator Applications: Anyone can submit an application
CREATE POLICY "Allow public to submit creator applications"
    ON public.creator_applications FOR INSERT
    WITH CHECK (TRUE);

-- Organization Orders: Anyone can submit a bulk order quote request
CREATE POLICY "Allow public to submit bulk order requests"
    ON public.organization_orders FOR INSERT
    WITH CHECK (TRUE);

-- Pre-orders: Anyone can submit a pre-order
CREATE POLICY "Allow public to submit pre-orders"
    ON public.pre_orders FOR INSERT
    WITH CHECK (TRUE);
