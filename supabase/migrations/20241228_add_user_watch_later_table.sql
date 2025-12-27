-- Migration: Add user_watch_later table for Watch Later feature
-- This migration creates a table to store videos users want to watch later

-- ============================================
-- Step 1: Create user_watch_later table
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_watch_later (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, video_id)
);

-- ============================================
-- Step 2: Add indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_watch_later_user_id 
  ON public.user_watch_later(user_id);

CREATE INDEX IF NOT EXISTS idx_user_watch_later_video_id 
  ON public.user_watch_later(video_id);

CREATE INDEX IF NOT EXISTS idx_user_watch_later_created_at 
  ON public.user_watch_later(created_at DESC);

-- ============================================
-- Step 3: Enable RLS
-- ============================================
ALTER TABLE public.user_watch_later ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 4: Create RLS policies
-- ============================================
-- Policy: Users can only read their own watch later items
CREATE POLICY "Users can view own watch later items"
  ON public.user_watch_later
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only insert their own watch later items
CREATE POLICY "Users can add to own watch later"
  ON public.user_watch_later
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own watch later items
CREATE POLICY "Users can remove from own watch later"
  ON public.user_watch_later
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE public.user_watch_later IS 'Stores videos users have saved to watch later';
COMMENT ON COLUMN public.user_watch_later.user_id IS 'References the user who saved the video';
COMMENT ON COLUMN public.user_watch_later.video_id IS 'YouTube video ID';
COMMENT ON COLUMN public.user_watch_later.created_at IS 'When the video was added to watch later';

