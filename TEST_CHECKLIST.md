# Testing Checklist ✅

## Before Testing

### 1. Firebase Setup

- [ ] Go to Firebase Console
- [ ] Enable Email/Password authentication
- [ ] Verify email templates are enabled

### 2. Supabase Setup

- [ ] Go to Supabase SQL Editor
- [ ] Run the SQL from `supabase-setup.sql`
- [ ] Verify `users` table exists

### 3. Start the App

```bash
npm start
```

## Test Scenarios

### ✅ Test 1: Sign Up

- [ ] Scan QR code in Expo Go
- [ ] See landing page
- [ ] Tap "Get Started"
- [ ] Fill in: Name, Email, Password, Confirm Password
- [ ] Tap "Create Account"
- [ ] See success message
- [ ] Check email for verification link
- [ ] Click verification link in email

**Expected**: Account created, verification email sent

### ✅ Test 2: Sign In (Unverified Email)

- [ ] Tap "Sign In" on landing page
- [ ] Enter email and password (before verifying)
- [ ] Tap "Sign In"
- [ ] See "Email Not Verified" alert
- [ ] Tap "Resend Email" (optional)
- [ ] Check email for new verification link

**Expected**: Cannot sign in, prompted to verify email

### ✅ Test 3: Sign In (Verified Email)

- [ ] Verify email first (click link in email)
- [ ] Return to app
- [ ] Enter email and password
- [ ] Tap "Sign In"
- [ ] Redirected to dashboard

**Expected**: Successfully signed in, see dashboard

### ✅ Test 4: Forgot Password

- [ ] On sign in screen, tap "Forgot password?"
- [ ] Enter your email
- [ ] Tap "Send Reset Link"
- [ ] See success message
- [ ] Check email for password reset link
- [ ] Click link in email
- [ ] Reset password on Firebase page
- [ ] Return to app and sign in with new password

**Expected**: Password reset email sent, can sign in with new password

### ✅ Test 5: Sign Out

- [ ] While signed in, go to Profile tab
- [ ] Tap "Sign Out" button
- [ ] Confirm sign out
- [ ] Redirected to landing page

**Expected**: Signed out, back to landing page

### ✅ Test 6: Supabase Data Storage

- [ ] Sign up a new user
- [ ] Go to Supabase Dashboard → Table Editor → users
- [ ] Verify new row exists with:
  - firebase_uid
  - email
  - full_name
  - email_verified (false initially)
- [ ] Sign in after verification
- [ ] Check Supabase again
- [ ] Verify email_verified is now true

**Expected**: User data stored in Supabase, verification status updated

## Common Issues

### Issue: Email not received

**Solution**:

- Check spam folder
- Verify Firebase email templates are enabled
- Check Firebase Console → Authentication → Templates

### Issue: "Email Not Verified" even after clicking link

**Solution**:

- Wait a few seconds after clicking verification link
- Try signing in again
- Check Firebase Console → Authentication → Users to verify status

### Issue: Supabase insert fails

**Solution**:

- Run `supabase-setup.sql` in Supabase SQL Editor
- Check Table Editor to verify table exists
- Check RLS policies are created

### Issue: Cannot sign in

**Solution**:

- Verify email first
- Check password is correct
- Check Firebase Console for user status

## Success Criteria

All tests should pass:

- ✅ Users can sign up
- ✅ Verification email is sent
- ✅ Cannot sign in without verification
- ✅ Can resend verification email
- ✅ Can sign in after verification
- ✅ Password reset works
- ✅ Can sign out
- ✅ User data stored in Supabase
- ✅ Verification status updated in Supabase

## Next Steps After Testing

1. Customize email templates in Firebase
2. Add user profile editing
3. Add avatar upload
4. Implement social authentication (Apple, Google)
5. Add more user fields to Supabase table
