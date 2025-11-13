# Supabase Storage Setup for Profile Pictures 📸

## Quick Setup Steps

### 1. Create Storage Bucket

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **"New bucket"** button
5. Enter bucket name: `profile-pictures`
6. Set **Public bucket**: ✅ YES (check this box)
7. Click **"Create bucket"**

### 2. Verify Bucket Settings

After creating the bucket:

- Bucket name should be: `profile-pictures`
- Public access should be: **Enabled**
- File size limit: Default (or set your own)

### 3. Set Up Storage Policies (Optional but Recommended)

Go to **Storage > Policies** and add these policies for the `profile-pictures` bucket:

#### Policy 1: Allow Authenticated Users to Upload

```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-pictures');
```

#### Policy 2: Allow Users to Update Their Own Files

```sql
CREATE POLICY "Allow users to update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-pictures');
```

#### Policy 3: Allow Public Read Access

```sql
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');
```

#### Policy 4: Allow Users to Delete Their Own Files

```sql
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-pictures');
```

## Testing the Upload

1. **Open your app**
2. **Go to Profile tab**
3. **Tap the edit button** (pencil icon)
4. **Tap the profile picture**
5. **Select an image** from your camera roll
6. **Wait for upload** (you'll see "Uploading..." text)
7. **Success message** should appear
8. **Profile picture** should display immediately

## Troubleshooting

### Error: "Storage bucket not found"

**Solution:** Create the `profile-pictures` bucket in Supabase Dashboard (see step 1 above)

### Error: "Permission denied"

**Solution:**

- Make sure the bucket is set to **Public**
- Add the storage policies (see step 3 above)
- Check your Supabase URL and anon key in `.env` file

### Error: "Failed to upload image"

**Solution:**

- Check your internet connection
- Verify Supabase project is active
- Check Supabase Dashboard > Storage to see if bucket exists
- Try uploading a smaller image (< 5MB)

### Image uploads but doesn't display

**Solution:**

- Verify the bucket is set to **Public**
- Check the public URL in Supabase Storage
- Clear app cache and restart

## Verify Setup

Run this test in your Supabase SQL Editor to check if the bucket exists:

```sql
SELECT * FROM storage.buckets WHERE name = 'profile-pictures';
```

You should see one row with:

- `name`: profile-pictures
- `public`: true

## Image Upload Flow

1. User taps profile picture in edit modal
2. App requests camera roll permission
3. User selects image
4. Image is read as base64
5. Base64 is converted to ArrayBuffer
6. File is uploaded to Supabase Storage
7. Public URL is generated
8. URL is saved to user profile in database
9. Profile picture displays on profile page

## File Structure in Storage

Images are stored with this structure:

```
profile-pictures/
  └── {user_firebase_uid}/
      └── {timestamp}.jpg
```

Example:

```
profile-pictures/
  └── abc123xyz/
      └── 1699564800000.jpg
```

This keeps each user's images organized in their own folder.

## Next Steps

1. ✅ Create the storage bucket
2. ✅ Set bucket to public
3. ✅ Add storage policies (optional)
4. ✅ Test uploading an image
5. ✅ Verify image displays on profile

---

**Need Help?**

- Check Supabase Storage docs: https://supabase.com/docs/guides/storage
- Verify your `.env` file has correct Supabase credentials
- Check app logs for detailed error messages
