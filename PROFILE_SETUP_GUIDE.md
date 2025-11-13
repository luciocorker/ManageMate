# Profile Features Setup Guide 📸

## What's Been Added ✅

Your profile page now has full editing capabilities with:

- Profile picture upload
- Name, phone number, location
- Bio/about section
- Social links (LinkedIn, GitHub)
- All data saved to Supabase

## Database Setup 🗄️

### 1. Update Users Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Add new columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;
```

### 2. Create Storage Bucket for Profile Pictures

**In Supabase Dashboard:**

1. Go to **Storage** in the left sidebar
2. Click **"New bucket"**
3. Name it: `profile-pictures`
4. Set it to **Public** (so profile pictures are accessible)
5. Click **Create bucket**

### 3. Set Up Storage Policies

After creating the bucket, add these policies in **Storage > Policies**:

```sql
-- Allow users to upload their own profile pictures
CREATE POLICY "Users can upload own profile picture"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update own profile picture"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-pictures'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete own profile picture"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-pictures'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to view profile pictures (public bucket)
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');
```

## Features 🎨

### Profile Page (`app/(tabs)/profile.tsx`)

- Displays user profile picture
- Shows name, email, location
- Displays bio if set
- Shows social links (LinkedIn, GitHub) with clickable buttons
- Shows phone number in account info
- Edit button in top right corner
- All existing features (stats, achievements, activity)

### Edit Profile Page (`app/(tabs)/edit-profile.tsx`)

- Upload/change profile picture from camera roll
- Edit full name
- Add phone number
- Set location
- Write bio
- Add LinkedIn URL
- Add GitHub URL
- All changes save to Supabase

## How to Use 📱

### For Users:

1. **Go to Profile tab**
2. **Tap the edit button** (pencil icon in top right)
3. **Upload profile picture:**
   - Tap the profile picture
   - Select image from camera roll
   - Image uploads automatically
4. **Fill in your information:**
   - Name, phone, location
   - Write a bio
   - Add social links
5. **Tap "Save Changes"**
6. **Return to profile** to see your updates

### Image Upload Process:

1. User taps profile picture
2. App requests camera roll permission
3. User selects image
4. Image is cropped to square (1:1 aspect)
5. Image uploads to Supabase Storage
6. Public URL is generated
7. URL is saved to user profile
8. Profile picture displays immediately

## Files Modified/Created:

### New Files:

- `app/(tabs)/edit-profile.tsx` - Profile editing screen
- `PROFILE_SETUP_GUIDE.md` - This guide

### Modified Files:

- `app/(tabs)/profile.tsx` - Added profile data display, social links, edit button
- `supabase-setup.sql` - Added new columns and storage setup

### Packages Installed:

- `expo-image-picker` - For selecting images from camera roll

## Testing Checklist ✓

- [ ] Run SQL to add new columns to users table
- [ ] Create `profile-pictures` storage bucket in Supabase
- [ ] Set up storage policies
- [ ] Test uploading profile picture
- [ ] Test editing name, phone, location
- [ ] Test adding bio
- [ ] Test adding LinkedIn URL
- [ ] Test adding GitHub URL
- [ ] Test clicking social links (should open in browser)
- [ ] Verify data saves to Supabase
- [ ] Verify profile picture displays on profile page

## Troubleshooting 🔧

### Profile picture not uploading:

- Check if `profile-pictures` bucket exists in Supabase Storage
- Verify bucket is set to public
- Check storage policies are set up correctly
- Check camera roll permissions are granted

### Data not saving:

- Verify new columns exist in users table
- Check Supabase connection in `.env` file
- Check browser console/app logs for errors

### Social links not opening:

- Verify URLs include `https://`
- Check device can open external links

## Next Steps:

1. Run the SQL commands in Supabase
2. Create the storage bucket
3. Set up storage policies
4. Test the profile editing features
5. Customize the UI if needed

---

**Note:** Profile pictures are stored in Supabase Storage and are publicly accessible. Make sure your storage bucket is configured correctly for your use case.
