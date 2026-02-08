-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your news articles
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  url text unique not null,
  title text,
  date text,
  themes text,
  location_names text,
  
  -- Embeddings (using 384 dimensions for all-MiniLM-L6-v2)
  title_embedding vector(384),
  themes_embedding vector(384),
  locations_embedding vector(384)
);

-- Optional: Create indexes for faster similarity search
-- create index on articles using hnsw (title_embedding vector_cosine_ops);
-- create index on articles using hnsw (themes_embedding vector_cosine_ops);
-- create index on articles using hnsw (locations_embedding vector_cosine_ops);

-- Create a function to search articles by similarity on a specific vector column
create or replace function match_articles (
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  search_field text default 'title_embedding'
)
returns table (
  id uuid,
  url text,
  title text,
  date text,
  similarity float
)
language plpgsql
as $$
begin
  return query execute format('
    select
      id,
      url,
      title,
      date,
      1 - (%I <=> $1) as similarity
    from articles
    where 1 - (%I <=> $1) > $2
    order by %I <=> $1
    limit $3
  ', search_field, search_field, search_field)
  using query_embedding, match_threshold, match_count;
end;
$$;

-- Create a function to search articles by combined Title + Theme similarity
-- Useful for broad topic filters (e.g. "Tech", "Politics")
create or replace function match_articles_topic (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  url text,
  title text,
  date text,
  themes text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    articles.id,
    articles.url,
    articles.title,
    articles.date,
    articles.themes,
    -- Calculate max similarity between title and themes
    -- GREATEST(a, b) returns the larger value
    GREATEST(
      1 - (articles.title_embedding <=> query_embedding),
      1 - (articles.themes_embedding <=> query_embedding)
    ) as similarity
  from articles
  where 
    GREATEST(
      1 - (articles.title_embedding <=> query_embedding),
      1 - (articles.themes_embedding <=> query_embedding)
    ) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;
