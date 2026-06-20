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

-- Jobs
create table if not exists jobs (
  id uuid default gen_random_uuid() primary key,
  company_id text not null,
  title text not null,
  url text not null unique,
  department text,
  location text,
  employment_type text,
  posted_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists jobs_company_id_idx on jobs(company_id);
create index if not exists jobs_posted_at_idx on jobs(posted_at desc nulls last);

alter table jobs enable row level security;

create policy "public read jobs" on jobs
  for select using (true);

-- ───────────────────────────────────────────
-- Blog Platform
-- ───────────────────────────────────────────

create table if not exists blog_users (
  id text primary key,
  username text unique not null,
  name text,
  email text,
  avatar_url text,
  bio text,
  github_url text,
  created_at timestamptz default now()
);
alter table blog_users enable row level security;
create policy "public read blog_users" on blog_users for select using (true);
create policy "self write blog_users" on blog_users for all using (auth.uid()::text = id);

create table if not exists blog_series (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  description text,
  author_id text references blog_users(id) on delete cascade,
  is_private boolean default false,
  created_at timestamptz default now()
);
alter table blog_series enable row level security;
create policy "public read public series" on blog_series for select using (not is_private or author_id = auth.uid()::text);

create table if not exists blog_posts (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  content text not null default '',
  excerpt text,
  cover_url text,
  author_id text references blog_users(id) on delete cascade,
  is_published boolean default false,
  published_at timestamptz,
  series_id uuid references blog_series(id) on delete set null,
  series_order int,
  view_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists blog_posts_author_idx on blog_posts(author_id);
create index if not exists blog_posts_published_at_idx on blog_posts(published_at desc nulls last);
create index if not exists blog_posts_slug_idx on blog_posts(slug);
alter table blog_posts enable row level security;
create policy "public read published posts" on blog_posts for select using (is_published = true or author_id = auth.uid()::text);
create policy "author write posts" on blog_posts for all using (author_id = auth.uid()::text);

create table if not exists blog_tags (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  slug text unique not null
);
alter table blog_tags enable row level security;
create policy "public read tags" on blog_tags for select using (true);
create policy "auth write tags" on blog_tags for insert with check (auth.uid() is not null);

create table if not exists blog_post_tags (
  post_id uuid references blog_posts(id) on delete cascade,
  tag_id uuid references blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);
alter table blog_post_tags enable row level security;
create policy "public read post_tags" on blog_post_tags for select using (true);

create table if not exists blog_likes (
  post_id uuid references blog_posts(id) on delete cascade,
  user_id text references blog_users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);
alter table blog_likes enable row level security;
create policy "public read likes" on blog_likes for select using (true);
create policy "auth write likes" on blog_likes for all using (user_id = auth.uid()::text);

create table if not exists blog_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references blog_posts(id) on delete cascade,
  author_id text references blog_users(id) on delete cascade,
  parent_id uuid references blog_comments(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);
create index if not exists blog_comments_post_idx on blog_comments(post_id);
alter table blog_comments enable row level security;
create policy "public read comments" on blog_comments for select using (true);
create policy "auth write comments" on blog_comments for all using (author_id = auth.uid()::text);

create table if not exists blog_follows (
  follower_id text references blog_users(id) on delete cascade,
  following_id text references blog_users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);
alter table blog_follows enable row level security;
create policy "public read follows" on blog_follows for select using (true);
create policy "auth write follows" on blog_follows for all using (follower_id = auth.uid()::text);
