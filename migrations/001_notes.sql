-- Run this in your Supabase SQL editor

create extension if not exists vector;

create table if not exists notes (
  id               uuid primary key default gen_random_uuid(),
  telegram_user_id text not null,
  content          text not null,
  tags             text[] default '{}',
  category         text,
  embedding        vector(768),
  created_at       timestamptz default now()
);

create index if not exists notes_embedding_idx
  on notes using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists notes_user_created_idx
  on notes (telegram_user_id, created_at desc);

-- Vector similarity search function
create or replace function match_notes(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_user_id text
)
returns table (
  id          uuid,
  content     text,
  tags        text[],
  category    text,
  created_at  timestamptz,
  similarity  float
)
language sql stable as $$
  select
    id,
    content,
    tags,
    category,
    created_at,
    1 - (embedding <=> query_embedding) as similarity
  from notes
  where telegram_user_id = p_user_id
    and 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
