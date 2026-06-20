create table if not exists articles (
  id uuid default gen_random_uuid() primary key,
  blog_id text not null,
  title text not null,
  url text not null unique,
  published_at timestamptz not null,
  summary text,
  thumbnail text,
  tags text[] default '{}',
  created_at timestamptz default now()
);

create index if not exists articles_blog_id_idx on articles(blog_id);
create index if not exists articles_published_at_idx on articles(published_at desc);

-- Row Level Security: 읽기는 public, 쓰기는 service role만
alter table articles enable row level security;

create policy "public read" on articles
  for select using (true);
