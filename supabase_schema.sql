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
