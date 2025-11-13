# Verify Bucket Setup Checklist

## Please confirm you did these steps:

### 1. Bucket Creation

- [ ] Went to https://supabase.com/dashboard
- [ ] Selected the correct project (managemate-32f1d)
- [ ] Clicked "Storage" in left sidebar
- [ ] Clicked "New bucket" button
- [ ] Entered name: `profile-pictures` (exactly, no spaces)
- [ ] **CHECKED the "Public bucket" checkbox** ✅ (VERY IMPORTANT!)
- [ ] Clicked "Create bucket"

### 2. Verify Bucket Exists

After creating, you should see:

- Bucket name: `profile-pictures` in the list
- A green "Public" badge next to it
- 0 files initially

### 3. If Bucket is Private (Not Public)

If you see "Private" instead of "Public":

1. Click on the `profile-pictures` bucket
2. Click the "Settings" or gear icon
3. Find "Public bucket" toggle
4. Turn it ON
5. Save changes

### 4. Check Policies (Optional but Recommended)

Go to Storage > Policies and make sure there are policies for:

- SELECT (read) - for public access
- INSERT (upload) - for authenticated users
- UPDATE - for authenticated users
- DELETE - for authenticated users

If no policies exist, the bucket might not work even if it's public.

## Quick SQL Fix

If the bucket exists but still not working, run this in Supabase SQL Editor:

```sql
-- Make sure bucket is public
UPDATE storage.buckets
SET public = true
WHERE name = 'profile-pictures';

-- Add policies if they don't exist
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-pictures');

CREATE POLICY IF NOT EXISTS "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-pictures');

CREATE POLICY IF NOT EXISTS "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-pictures');
```

## Test Again

After confirming all the above, try uploading in your app:

1. Reload the app (shake device → Reload)
2. Go to Profile tab
3. Tap edit button (pencil icon)
4. Tap profile picture
5. Select an image
6. Should upload successfully!

## Still Not Working?

If you've done all the above and it still doesn't work:

1. Take a screenshot of your Supabase Storage page showing the bucket
2. Check if the bucket name is EXACTLY `profile-pictures` (no typos, no spaces)
3. Verify the bucket shows "Public" badge
4. Try the SQL commands above
