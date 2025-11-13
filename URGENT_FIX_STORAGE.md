# URGENT: Fix Storage Policies

## Good News!

✅ The bucket `profile-pictures` EXISTS in your Supabase project!

## The Problem

❌ The bucket has Row Level Security (RLS) blocking uploads

## The Fix (2 minutes)

### Option 1: Run SQL Script (Recommended)

1. **Go to Supabase Dashboard**

   - https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**

   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste this SQL:**

```sql
-- Make bucket public
UPDATE storage.buckets
SET public = true
WHERE name = 'profile-pictures';

-- Create policies for profile-pictures bucket
CREATE POLICY "profile_pictures_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

CREATE POLICY "profile_pictures_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-pictures');

CREATE POLICY "profile_pictures_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-pictures');

CREATE POLICY "profile_pictures_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-pictures');
```

4. **Click "Run"** (or press Cmd/Ctrl + Enter)

5. **You should see:** "Success. No rows returned"

### Option 2: Use Dashboard (Alternative)

1. Go to **Storage** in Supabase Dashboard
2. Click on `profile-pictures` bucket
3. Click **"Policies"** tab
4. Click **"New Policy"**
5. Create these 4 policies:

**Policy 1: Public Read**

- Name: `profile_pictures_public_read`
- Allowed operation: SELECT
- Target roles: public
- USING expression: `bucket_id = 'profile-pictures'`

**Policy 2: Authenticated Insert**

- Name: `profile_pictures_authenticated_insert`
- Allowed operation: INSERT
- Target roles: authenticated
- WITH CHECK expression: `bucket_id = 'profile-pictures'`

**Policy 3: Authenticated Update**

- Name: `profile_pictures_authenticated_update`
- Allowed operation: UPDATE
- Target roles: authenticated
- USING expression: `bucket_id = 'profile-pictures'`

**Policy 4: Authenticated Delete**

- Name: `profile_pictures_authenticated_delete`
- Allowed operation: DELETE
- Target roles: authenticated
- USING expression: `bucket_id = 'profile-pictures'`

## Test After Fix

After running the SQL or creating policies:

1. **Test from terminal:**

   ```bash
   node test-upload.js
   ```

   Should show: ✅ Upload successful!

2. **Test in app:**
   - Reload app (shake device → Reload)
   - Go to Profile → Edit
   - Tap profile picture
   - Select image
   - Should upload! 🎉

## Why This Happened

Supabase Storage has Row Level Security (RLS) enabled by default. When you create a bucket, you need to also create policies that allow:

- Public users to READ (view) images
- Authenticated users to INSERT (upload), UPDATE, and DELETE images

Without these policies, all operations are blocked.

## Next Steps

1. ✅ Run the SQL script above
2. ✅ Test with: `node test-upload.js`
3. ✅ Test in your app
4. ✅ Upload should work perfectly!
