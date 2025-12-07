-- Add preview_url column to designs table
alter table designs 
add column if not exists preview_url text;

-- Ensure updated_at is automatically updated (optional but good)
alter table designs 
add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());
