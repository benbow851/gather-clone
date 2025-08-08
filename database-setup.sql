-- Database setup for Gather Clone
-- Run this SQL in your Supabase SQL Editor

-- Create realms table
CREATE TABLE IF NOT EXISTS public.realms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    share_id TEXT UNIQUE DEFAULT gen_random_uuid()::text,
    map_data JSONB,
    only_owner BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    skin TEXT DEFAULT '009',
    visited_realms TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.realms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for realms table
CREATE POLICY "Users can view realms they own" ON public.realms
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert realms they own" ON public.realms
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update realms they own" ON public.realms
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete realms they own" ON public.realms
    FOR DELETE USING (auth.uid() = owner_id);

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_realms_owner_id ON public.realms(owner_id);
CREATE INDEX IF NOT EXISTS idx_realms_share_id ON public.realms(share_id);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
