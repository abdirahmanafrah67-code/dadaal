-- Drop the table if it exists (to reset schema)
drop table if exists designs;

-- Re-create the designs table with compatible types for Firebase
create table designs (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- Changed from uuid to text to store Firebase UID
  name text default 'Untitled Design',
  content jsonb default '{}'::jsonb,
  preview_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- We are disabling RLS because you are using Firebase Auth.
-- Supabase doesn't know your Firebase user automatically, so standard RLS policies
-- would block you from valid operations.
alter table designs disable row level security;
