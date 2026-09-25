-- ============================================
-- CONTACT MESSAGES TABLE
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Create contact_messages table
create table if not exists public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  user_id uuid references auth.users(id) on delete set null,
  is_read boolean default false,
  is_replied boolean default false,
  admin_reply text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.contact_messages enable row level security;

-- Drop existing policies if any
drop policy if exists "users_insert_own_messages" on public.contact_messages;
drop policy if exists "users_view_own_messages" on public.contact_messages;
drop policy if exists "admin_view_all_messages" on public.contact_messages;
drop policy if exists "admin_update_messages" on public.contact_messages;
drop policy if exists "admin_delete_messages" on public.contact_messages;

-- Users can insert their own messages
create policy "users_insert_own_messages"
  on public.contact_messages for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can insert messages even if not logged in (for contact form)
create policy "public_insert_messages"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

-- Users can view their own messages
create policy "users_view_own_messages"
  on public.contact_messages for select
  to authenticated
  using (user_id = auth.uid());

-- Admins can view all messages
create policy "admin_view_all_messages"
  on public.contact_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Admins can update messages (mark as read, reply)
create policy "admin_update_messages"
  on public.contact_messages for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Admins can delete messages
create policy "admin_delete_messages"
  on public.contact_messages for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
create index if not exists idx_contact_messages_user_id on public.contact_messages(user_id);
create index if not exists idx_contact_messages_is_read on public.contact_messages(is_read);
create index if not exists idx_contact_messages_created_at on public.contact_messages(created_at desc);

-- Verify setup
select '✅ Contact messages table created successfully!' as status;
select count(*) as table_count from information_schema.tables where table_name = 'contact_messages';
