# Quick Start - Deploy to Render in 10 Minutes

Follow these 5 simple steps to deploy your app.

---

## ⚡ STEP 1: Push to GitHub (2 minutes)

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

---

## ⚡ STEP 2: Create Render Account (1 minute)

1. Go to https://render.com/
2. Click "Get Started for Free"
3. Sign up with GitHub (easiest option)

---

## ⚡ STEP 3: Deploy Blueprint (1 minute)

1. In Render Dashboard, click "New +" → "Blueprint"
2. Select your `google-ranker-new` repository
3. Click "Apply"

**Result:** 2 services created (will fail initially - this is normal)

---

## ⚡ STEP 4: Add Environment Variables (5 minutes)

### Backend Service:
1. Click `google-ranker-backend`
2. Go to "Environment" tab
3. Add these **6 REQUIRED** variables:

```
GOOGLE_CLIENT_ID = (from Google Cloud Console)
GOOGLE_CLIENT_SECRET = (from Google Cloud Console)
GOOGLE_REDIRECT_URI = https://google-ranker-backend.onrender.com/auth/google/callback
SUPABASE_URL = (from Supabase Dashboard)
SUPABASE_SERVICE_KEY = (from Supabase Dashboard)
FRONTEND_URL = https://google-ranker-frontend.onrender.com
```

4. Add Secret File:
   - Filename: `serviceAccountKey.json`
   - Content: (paste your Firebase service account JSON)

5. Click "Save Changes"

### Frontend Service:
1. Click `google-ranker-frontend`
2. Go to "Environment" tab
3. Add these **7 REQUIRED** variables:

```
VITE_FIREBASE_API_KEY = (from Firebase Console)
VITE_FIREBASE_AUTH_DOMAIN = (from Firebase Console)
VITE_FIREBASE_PROJECT_ID = (from Firebase Console)
VITE_FIREBASE_STORAGE_BUCKET = (from Firebase Console)
VITE_FIREBASE_MESSAGING_SENDER_ID = (from Firebase Console)
VITE_FIREBASE_APP_ID = (from Firebase Console)
VITE_GOOGLE_CLIENT_ID = (same as backend GOOGLE_CLIENT_ID)
```

4. Click "Save Changes"

---

## ⚡ STEP 5: Update Google OAuth (1 minute)

1. Go to https://console.cloud.google.com/
2. APIs & Services → Credentials → Your OAuth Client
3. Add to "Authorized redirect URIs":
   ```
   https://google-ranker-backend.onrender.com/auth/google/callback
   https://google-ranker-frontend.onrender.com/auth/google/callback
   ```
4. Add to "Authorized JavaScript origins":
   ```
   https://google-ranker-frontend.onrender.com
   ```
5. Click "Save"

---

## ✅ Done! Your App is Live

- **Your App:** https://google-ranker-frontend.onrender.com
- **API:** https://google-ranker-backend.onrender.com
- **Health Check:** https://google-ranker-backend.onrender.com/health

---

## 📋 Need the Credentials?

**Don't have credentials ready?** Use these checklists:

1. **ENV_VARIABLES_CHECKLIST.md** - Complete list of all variables
2. **DEPLOY_TO_RENDER.md** - Detailed step-by-step guide with screenshots context

---

## 🆘 Troubleshooting

**Backend not starting?**
- Check all 6 required variables are set
- Verify Firebase service account JSON is uploaded
- Check logs for errors

**Frontend blank page?**
- Check all 7 VITE_ variables are set
- Verify VITE_BACKEND_URL is correct
- Check browser console for errors

**OAuth not working?**
- Verify redirect URIs in Google Cloud Console
- Check GOOGLE_REDIRECT_URI matches
- Ensure FRONTEND_URL is correct

---

## 💡 Pro Tips

1. **Free Tier:** Services sleep after 15 min inactivity (first request takes 30-60 sec to wake)
2. **Auto-Deploy:** Push to GitHub = automatic deployment
3. **Logs:** Always check logs when debugging
4. **Upgrade:** Backend to paid ($7/mo) for 24/7 uptime

---

**That's it! You're deployed! 🚀**
