-- Fix for existing users without profiles
-- Run this after the main database setup

-- Create profiles for any existing users who don't have them
INSERT INTO public.profiles (id, skin, visited_realms)
SELECT 
    id,
    '009',
    '{}'
FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Update existing profiles that have 'default' skin to use '009'
UPDATE public.profiles 
SET skin = '009' 
WHERE skin = 'default';

-- Update the trigger to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, skin, visited_realms)
    VALUES (NEW.id, '009', '{}')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
