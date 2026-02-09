-- Users table (extends Supabase auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  role text not null check (role in ('admin', 'author')),
  created_at timestamp with time zone default now()
);

-- Categories
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  slug text unique not null,
  description text,
  created_at timestamp with time zone default now()
);

-- Articles
create table articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  content text not null,
  author_id uuid references profiles(id) on delete cascade not null,
  category_id uuid references categories(id) on delete restrict not null,
  status text not null check (status in ('draft', 'published')),
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Article Likes (PUBLIC - no auth required)
create table article_likes (
  id uuid default gen_random_uuid() primary key,
  article_id uuid references articles(id) on delete cascade not null,
  fingerprint text not null,
  created_at timestamp with time zone default now(),
  unique(article_id, fingerprint)
);

-- Indexes for performance
create index articles_status_idx on articles(status);
create index articles_category_idx on articles(category_id);
create index articles_author_idx on articles(author_id);
create index articles_search_idx on articles using gin(to_tsvector('english', title || ' ' || content));
create index article_likes_article_idx on article_likes(article_id);

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table categories enable row level security;
alter table articles enable row level security;
alter table article_likes enable row level security;

-- RLS Policies: Profiles
create policy "Public profiles viewable by authenticated users"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "Admins can insert users"
  on profiles for insert
  with check ((select role from profiles where id = auth.uid()) = 'admin');

-- RLS Policies: Categories
create policy "Categories viewable by all"
  on categories for select
  using (true);

create policy "Admins can manage categories"
  on categories for all
  using ((select role from profiles where id = auth.uid()) = 'admin');

-- RLS Policies: Articles
create policy "Published articles viewable by all"
  on articles for select
  using (status = 'published' or auth.uid() = author_id or (select role from profiles where id = auth.uid()) = 'admin');

create policy "Authors can create own articles"
  on articles for insert
  with check (auth.uid() = author_id);

create policy "Authors can update own articles, admins can update all"
  on articles for update
  using (auth.uid() = author_id or (select role from profiles where id = auth.uid()) = 'admin');

create policy "Authors can delete own articles, admins can delete all"
  on articles for delete
  using (auth.uid() = author_id or (select role from profiles where id = auth.uid()) = 'admin');

-- RLS Policies: Article Likes (PUBLIC)
create policy "Anyone can view likes"
  on article_likes for select
  using (true);

create policy "Anyone can like articles"
  on article_likes for insert
  with check (true);

create policy "Anyone can unlike articles"
  on article_likes for delete
  using (true);
