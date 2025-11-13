# Web Compatibility Fix - Supabase Storage

## Issue

When running the app on web (using `npx expo start` and opening in browser), you encountered this error:

```
TypeError: ExpoSecureStore.default.getValueWithKeyAsync is not a function
```

## Root Cause

`expo-secure-store` is only available on native platforms (iOS and Android). It doesn't work on web because web browsers don't have access to the native secure storage APIs.

## Solution

Updated `lib/supabase.ts` to use a platform-aware storage adapter:

- **Web**: Uses `localStorage` (browser's local storage)
- **Native (iOS/Android)**: Uses `expo-secure-store` (secure encrypted storage)

### Code Changes

```typescript
// Custom storage adapter that works on both web and native
const createStorageAdapter = () => {
  // Use localStorage for web, SecureStore for native
  if (Platform.OS === "web") {
    return {
      getItem: (key: string) => {
        if (typeof localStorage !== "undefined") {
          return Promise.resolve(localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    };
  } else {
    // Native platforms (iOS, Android)
    return {
      getItem: (key: string) => {
        return SecureStore.getItemAsync(key);
      },
      setItem: (key: string, value: string) => {
        return SecureStore.setItemAsync(key, value);
      },
      removeItem: (key: string) => {
        return SecureStore.deleteItemAsync(key);
      },
    };
  }
};
```

## How It Works

1. **Platform Detection**: Uses `Platform.OS` to detect if running on web or native
2. **Web Storage**: On web, uses browser's `localStorage` API
3. **Native Storage**: On iOS/Android, uses `expo-secure-store` for encrypted storage
4. **Consistent API**: Both adapters provide the same interface (getItem, setItem, removeItem)

## Benefits

✅ **Works on all platforms**: Web, iOS, and Android
✅ **Secure on native**: Uses encrypted storage on mobile devices
✅ **Standard on web**: Uses browser's localStorage (standard practice)
✅ **No code changes needed**: Supabase client works the same way everywhere

## Testing

### Web
```bash
npx expo start
# Press 'w' to open in web browser
```

Should now work without the SecureStore error.

### iOS
```bash
npx expo start
# Press 'i' to open in iOS simulator
```

Uses secure encrypted storage.

### Android
```bash
npx expo start
# Press 'a' to open in Android emulator
```

Uses secure encrypted storage.

## Security Considerations

### Web (localStorage)
- Data stored in browser's localStorage
- Not encrypted (standard for web apps)
- Cleared when user clears browser data
- Accessible via browser DevTools (normal for web)

### Native (SecureStore)
- Data stored in device's secure keychain/keystore
- Encrypted at rest
- Protected by device security (PIN, biometrics)
- Not accessible to other apps

## Alternative Solutions

If you need more security on web, you could:

1. **Use session storage** (cleared when tab closes):
   ```typescript
   sessionStorage.getItem(key)
   sessionStorage.setItem(key, value)
   ```

2. **Encrypt data before storing**:
   ```typescript
   const encrypted = encrypt(value);
   localStorage.setItem(key, encrypted);
   ```

3. **Use IndexedDB** (more storage space):
   ```typescript
   // Use a library like idb or localforage
   ```

## Current Implementation

The current implementation uses:
- **Web**: localStorage (standard practice for web apps)
- **Native**: SecureStore (best practice for mobile apps)

This is the recommended approach for Expo apps that need to work on both web and native platforms.

## Related Files

- `lib/supabase.ts` - Supabase client configuration with storage adapter
- `contexts/AuthContext.tsx` - Uses Supabase for authentication
- All components that use Supabase - Now work on web and native

## Summary

✅ **Fixed**: expo-secure-store error on web
✅ **Works**: App now runs on web, iOS, and Android
✅ **Secure**: Native apps use encrypted storage
✅ **Standard**: Web apps use localStorage (industry standard)
