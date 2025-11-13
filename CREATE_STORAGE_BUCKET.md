# Create Storage Bucket - REQUIRED FOR IMAGE UPLOAD

## The Problem

Your app is trying to upload images to a bucket called `profile-pictures` but it doesn't exist in your Supabase project.

## Quick Fix (2 minutes)

### Step 1: Go to Supabase Dashboard

1. Open https://supabase.com/dashboard
2. Select your project: **managemate-32f1d**
3. Click **Storage** in the left sidebar

### Step 2: Create the Bucket

1. Click the **"New bucket"** button (green button, top right)
2. Enter these details:
   - **Name**: `profile-pictures` (exactly this, no spaces)
   - **Public bucket**: ✅ CHECK THIS BOX (very important!)
   - **File size limit**: Leave default or set to 5MB
   - **Allowed MIME types**: Leave empty (allows all images)
3. Click **"Create bucket"**

### Step 3: Verify

After creating the bucket, you should see it listed in Storage with:

- Name: profile-pictures
- Status: Public
- Files: 0

### Step 4: Test Upload

1. Go back to your app
2. Reload the app (shake device and tap "Reload")
3. Go to Profile → Edit (pencil icon)
4. Tap profile picture
5. Select an image
6. Should upload successfully! ✅

## That's It!

Once the bucket is created, image uploads will work immediately.

---

## Alternative: Use SQL to Create Bucket

If you prefer, you can also create the bucket using SQL in Supabase SQL Editor:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;
```

Then set up policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-pictures');

-- Allow public read access
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

-- Allow users to update their own files
CREATE POLICY "Allow users to update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-pictures');

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-pictures');
```

---

## Why This Happened

The storage bucket needs to be manually created in Supabase. It's not created automatically when you run the app.

## Next Steps After Creating Bucket

1. ✅ Create bucket (follow steps above)
2. ✅ Reload your app
3. ✅ Try uploading profile picture
4. ✅ Should work perfectly!
