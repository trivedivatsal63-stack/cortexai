-- =====================================================
-- CORTEXAI BLOG SYSTEM - SUPABASE SETUP
-- =====================================================
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create the blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    slug TEXT UNIQUE NOT NULL,
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    read_time TEXT,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blogs_user_id ON public.blogs(user_id);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON public.blogs(published);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON public.blogs(created_at DESC);

-- 3. Row Level Security (RLS) policies
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published blogs
CREATE POLICY "Public published blogs are viewable by everyone"
ON public.blogs FOR SELECT
USING (published = true);

-- Users can view their own blogs (published or not)
CREATE POLICY "Users can view their own blogs"
ON public.blogs FOR SELECT
USING (auth.uid()::text = user_id);

-- Users can create blogs
CREATE POLICY "Users can create blogs"
ON public.blogs FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own blogs
CREATE POLICY "Users can update their own blogs"
ON public.blogs FOR UPDATE
USING (auth.uid()::text = user_id);

-- Users can delete their own blogs
CREATE POLICY "Users can delete their own blogs"
ON public.blogs FOR DELETE
USING (auth.uid()::text = user_id);

-- 4. Create profiles table (if not exists) for author info
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name)
    VALUES (
        NEW.id,
        COALESCE(NEW.full_name, NEW.username, 'Anonymous')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Auto-update updated_at on blog changes
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_blogs_updated_at ON public.blogs;
CREATE TRIGGER update_blogs_updated_at
    BEFORE UPDATE ON public.blogs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. Enable realtime for blogs (optional)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.blogs;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check tables created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Sample insert (for testing - remove in production)
-- INSERT INTO public.blogs (user_id, title, content, slug, category, published)
-- VALUES ('test-user', 'Test Blog', 'This is a test blog post content.', 'test-blog', 'general', true);
