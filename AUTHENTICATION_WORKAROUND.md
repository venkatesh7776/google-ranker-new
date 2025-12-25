# Authentication Workaround Guide

## Changes Made

### 1. Switched Google Sign-In from Popup to Redirect
- Changed `signInWithPopup` to `signInWithRedirect` in `AuthContext.tsx`
- This method is less strict about domain authorization
- The page will now redirect to Google and back instead of using a popup

### 2. How It Works Now
1. Click "Sign in with Google"
2. Page redirects to Google login
3. After signing in, Google redirects back to your app
4. The redirect result is automatically handled

## If Redirect Still Fails

### Quick Fix: Add localhost to Firebase Console (RECOMMENDED)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select project**: `gmb-automation-474209-549ee`
3. **Navigate**: Authentication → Settings → Authorized domains
4. **Add domain**: `localhost`
5. **Save**

### Alternative: Use Email/Password Sign In

Your app already supports email/password authentication. Use the sign-up form on the login page:
1. Create an account with email and password
2. Use that to log in instead of Google

### Alternative: Access via Production Domain

If your app is deployed, try accessing it via the production URL instead of localhost. The production domain should already be authorized in Firebase.

### Alternative: Use Different Port

If port 3000 is causing issues, try running on a different port that might be authorized:
```bash
npm run dev -- --port 5173
```

## Testing the Fix

1. **Clear browser cache** or use **Incognito mode**
2. **Refresh the page**
3. Click **"Sign in with Google"**
4. Should redirect to Google login page
5. After signing in, should redirect back to your app

## Still Not Working?

The most reliable fix is adding `localhost` to Firebase Console authorized domains. This is a 2-minute fix that will permanently solve the issue.
