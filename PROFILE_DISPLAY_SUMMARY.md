# Profile Display - What Shows Where

## Header Section (Gradient Background)

✅ **Profile Picture**

- Shows uploaded image if `profile_picture_url` exists
- Shows placeholder icon if no image
- Circular, 100x100px with white border

✅ **Display Name**

- Shows `full_name` from database
- Falls back to Firebase `displayName`
- Falls back to "User" if nothing set

✅ **Email**

- Shows user's email from Firebase auth

✅ **Location Badge** (if set)

- Shows location icon + location text
- Only displays if `location` field has data

✅ **Verified Badge** (if email verified)

- Shows checkmark + "Verified" text
- Only displays if email is verified in Firebase

## Bio Section (if set)

✅ **About**

- Shows the `bio` text
- Only displays if bio is not empty
- White card with padding

## Social Links Section (if any set)

✅ **LinkedIn Link** (if set)

- LinkedIn icon + "LinkedIn" text + arrow
- Clickable - opens LinkedIn URL in browser
- Only shows if `linkedin_url` is not empty

✅ **GitHub Link** (if set)

- GitHub icon + "GitHub" text + arrow
- Clickable - opens GitHub URL in browser
- Only shows if `github_url` is not empty

## Account Information Section

✅ **Email**

- Always shows user's email

✅ **Phone Number** (if set)

- Phone icon + phone number
- Only shows if `phone_number` is not empty

✅ **Display Name**

- Shows full_name or displayName

✅ **Email Status**

- Shows "Verified" (green) or "Not Verified" (red)

## How Data Updates

### When You Save in Edit Modal:

1. Data saves to Supabase database
2. Modal closes
3. Profile automatically reloads from database
4. All changes appear immediately

### Auto-Refresh:

- Profile reloads every 2 seconds when modal is closed
- Ensures data is always up-to-date
- No manual refresh needed

## Testing Checklist

After editing your profile, verify these show correctly:

- [ ] Profile picture displays (if uploaded)
- [ ] Full name shows in header
- [ ] Location badge shows (if set)
- [ ] Bio section appears (if set)
- [ ] LinkedIn link appears and is clickable (if set)
- [ ] GitHub link appears and is clickable (if set)
- [ ] Phone number shows in account info (if set)
- [ ] All data persists after closing and reopening app

## Troubleshooting

**Profile picture not showing?**

- Check if image uploaded successfully
- Verify `profile_picture_url` in Supabase database
- Make sure URL is valid and accessible

**Data not updating?**

- Wait 2 seconds for auto-refresh
- Close and reopen the app
- Check Supabase database to verify data was saved

**Social links not clickable?**

- Make sure URLs include `https://`
- Example: `https://linkedin.com/in/username`
- Example: `https://github.com/username`

**Fields not showing?**

- They only show if data exists
- Empty fields are hidden to keep UI clean
- Fill them in edit modal to make them appear
