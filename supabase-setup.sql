-- Drop existing tables if they exist (Be careful in production!)
-- DROP TABLE IF EXISTS public.clicks;
-- DROP TABLE IF EXISTS public.links;

-- Create links table
CREATE TABLE public.links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create clicks table
CREATE TABLE public.clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  country TEXT,
  city TEXT,
  browser TEXT,
  device TEXT,
  referrer TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_links_slug ON public.links(slug);
CREATE INDEX idx_clicks_link_id ON public.clicks(link_id);
CREATE INDEX idx_links_created_at ON public.links(created_at);

-- Trigger to update 'updated_at' on links
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_links_modtime
BEFORE UPDATE ON public.links
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- RPC to increment clicks atomically
CREATE OR REPLACE FUNCTION increment_clicks(row_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.links
  SET clicks = clicks + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS) if desired
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;
