-- Check current authenticated user and their data

-- 1. Check your user ID (run this to see who you are)
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Check your profile
SELECT 
  id,
  email,
  full_name,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

-- 3. Check projects owned by you (replace YOUR_USER_ID with your actual user ID from query 1)
-- SELECT * FROM public.projects WHERE owner_id = 'YOUR_USER_ID';
