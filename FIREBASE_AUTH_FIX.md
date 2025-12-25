# Firebase Authentication Fix - Invalid Continue URI

## Problem
Getting error: `Firebase: Error (auth/invalid-continue-uri)` when trying to sign in with Google.

## Root Cause
The Firebase project doesn't have `localhost:3000` in its authorized domains list.

## Solution - Add Authorized Domain in Firebase Console

### Steps:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **gmb-automation-474209-549ee**
3. Click on **Authentication** in the left sidebar
4. Go to **Settings** tab → **Authorized domains**
5. Click **Add domain**
6. Add: `localhost`
7. Click **Add**

### Alternative: Use 127.0.0.1 instead
If you can't access Firebase Console right now, try accessing the app via:
- `http://127.0.0.1:3000` instead of `http://localhost:3000`

This might work if `127.0.0.1` is already authorized.

## What Was Fixed in Code
- Updated hardcoded Firebase config fallback values to match `.env.development`
- Changed from old project `gbp-467810-a56e2` to correct project `gmb-automation-474209-549ee`

## After Adding Domain
1. Clear browser cache or use incognito mode
2. Refresh the page
3. Try Google sign-in again
