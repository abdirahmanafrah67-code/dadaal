-- Create the designs table
create table if not exists designs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text default 'Untitled Design',
  content jsonb default '{}'::jsonb,
  preview_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table designs enable row level security;

-- Create policies
create policy "Users can view their own designs"
  on designs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own designs"
  on designs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own designs"
  on designs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own designs"
  on designs for delete
  using (auth.uid() = user_id);
