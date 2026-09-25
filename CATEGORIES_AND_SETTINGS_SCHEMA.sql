-- ============================================
-- CATEGORIES TABLE
-- ============================================
create table if not exists public.categories (
  id serial primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  image text,
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
alter table public.categories enable row level security;

-- ============================================
-- CATEGORIES POLICIES
-- ============================================
-- Anyone can view active categories
drop policy if exists "categories_select_active" on public.categories;
create policy "categories_select_active"
  on public.categories for select
  using (is_active = true);

-- Admins can view all categories
drop policy if exists "categories_admin_select" on public.categories;
create policy "categories_admin_select"
  on public.categories for select
  to authenticated
  using (public.is_admin());

-- Admins can insert categories
drop policy if exists "categories_admin_insert" on public.categories;
create policy "categories_admin_insert"
  on public.categories for insert
  to authenticated
  with check (public.is_admin());

-- Admins can update categories
drop policy if exists "categories_admin_update" on public.categories;
create policy "categories_admin_update"
  on public.categories for update
  to authenticated
  using (public.is_admin());

-- Admins can delete categories
drop policy if exists "categories_admin_delete" on public.categories;
create policy "categories_admin_delete"
  on public.categories for delete
  to authenticated
  using (public.is_admin());

-- ============================================
-- ENHANCED STORE SETTINGS
-- ============================================
-- Add new settings for images and more
insert into public.store_settings (setting_key, setting_value) values
  ('store_logo', ''),
  ('store_banner', ''),
  ('store_description', 'Discover exquisite traditional clothing crafted with passion and heritage.'),
  ('hero_title', 'Vastra Elegance'),
  ('hero_subtitle', 'Discover exquisite traditional clothing crafted with passion and heritage. Each piece tells a story of artisanal craftsmanship, timeless elegance, and cultural richness.'),
  ('hero_badge', '✨ Premium Collection'),
  ('hero_features', 'Premium Quality,Free Shipping Over ₹5000'),
  ('hero_background_image', ''),
  ('store_facebook', ''),
  ('store_instagram', ''),
  ('store_twitter', ''),
  ('store_youtube', ''),
  ('store_whatsapp', ''),
  ('minimum_order', '0'),
  ('tax_rate', '0'),
  ('enable_reviews', 'true'),
  ('enable_wishlist', 'true'),
  ('enable_notifications', 'true')
on conflict (setting_key) do nothing;

-- ============================================
-- INSERT DEFAULT CATEGORIES
-- ============================================
insert into public.categories (name, slug, description, display_order) values
  ('Saree', 'saree', 'Traditional Indian sarees in various fabrics and designs', 1),
  ('Kurti', 'kurti', 'Stylish kurtis for everyday and festive wear', 2),
  ('Suit Set', 'suit-set', 'Complete suit sets with dupatta', 3),
  ('Lehenga', 'lehenga', 'Bridal and festive lehengas', 4),
  ('Gown', 'gown', 'Designer gowns for special occasions', 5),
  ('Dupatta', 'dupatta', 'Beautiful dupattas to complement your outfit', 6)
on conflict (slug) do nothing;

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_categories_active on public.categories(is_active);
create index if not exists idx_categories_order on public.categories(display_order);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
create or replace function update_categories_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at
  before update on public.categories
  for each row
  execute function update_categories_updated_at();

-- ============================================
-- VERIFICATION
-- ============================================
select '✅ Categories table and settings created successfully!' as status;
select count(*) as categories_count from public.categories;
select count(*) as settings_count from public.store_settings;
