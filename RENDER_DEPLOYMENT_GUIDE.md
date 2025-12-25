# 🚀 RENDER DEPLOYMENT - QUICK GUIDE

## ✅ STEP 1: COMPLETED
Your code is already pushed to GitHub: https://github.com/venkatesh7776/google-ranker-new

---

## 📋 STEP 2: CREATE RENDER ACCOUNT

1. Go to: **https://render.com/**
2. Click **"Get Started for Free"**
3. **Sign up with GitHub** (recommended)
4. Authorize Render to access your GitHub repositories

---

## 🎯 STEP 3: DEPLOY USING BLUEPRINT

1. In Render Dashboard, click **"New +"** button (top right)
2. Select **"Blueprint"**
3. Connect repository: **`venkatesh7776/google-ranker-new`**
4. Render will auto-detect `render.yaml`
5. Click **"Apply"**

**This creates 2 services:**
- ✅ `google-ranker-backend` (Web Service - Node.js)
- ✅ `google-ranker-frontend` (Static Site)

**Note:** Both services will initially fail because environment variables are not set yet.

---

## 🔧 STEP 4: CONFIGURE BACKEND ENVIRONMENT

### Method 1: Import .env File (EASIEST)

1. Go to **google-ranker-backend** service
2. Click **"Environment"** tab (left sidebar)
3. Click **"Add from .env"** button
4. Copy and paste the entire content from: **`render-backend.env`**
5. Click **"Save Changes"**

### Method 2: Manual Entry

If import doesn't work, add each variable manually:
- Click **"Add Environment Variable"**
- Copy key-value pairs from `render-backend.env`

---

## 📁 STEP 5: ADD FIREBASE SERVICE ACCOUNT (BACKEND)

**IMPORTANT:** Backend needs Firebase admin credentials

1. Still in **google-ranker-backend** → **Environment** tab
2. Scroll to **"Secret Files"** section
3. Click **"Add Secret File"**
4. Set:
   - **Filename:** `serviceAccountKey.json`
   - **Contents:** Copy entire content from `server/serviceAccountKey.json`
5. Click **"Save Changes"**

**Backend will automatically redeploy after saving**

---

## 🎨 STEP 6: CONFIGURE FRONTEND ENVIRONMENT

1. Go to **google-ranker-frontend** service
2. Click **"Environment"** tab
3. Click **"Add from .env"** button
4. Copy and paste the entire content from: **`render-frontend.env`**
5. Click **"Save Changes"**

**Note:** `VITE_BACKEND_URL` is auto-configured from `render.yaml`, but verify it shows:
```
VITE_BACKEND_URL=https://google-ranker-backend.onrender.com
```

**Frontend will automatically rebuild and redeploy after saving**

---

## 🔐 STEP 7: UPDATE GOOGLE OAUTH SETTINGS

1. Go to: **https://console.cloud.google.com/**
2. Select your project
3. **APIs & Services** → **Credentials**
4. Click your OAuth 2.0 Client ID: `574451618275-vl5r928f5pj6ogj4le1o75tilhiagmfu`

### Add Authorized Redirect URIs:
```
https://google-ranker-backend.onrender.com/auth/google/callback
https://google-ranker-frontend.onrender.com/auth/google/callback
https://google-ranker-frontend.onrender.com
```

### Add Authorized JavaScript Origins:
```
https://google-ranker-frontend.onrender.com
https://google-ranker-backend.onrender.com
```

5. Click **"Save"**

---

## ✅ STEP 8: VERIFY DEPLOYMENT

### 8.1 Check Backend Status
1. In Render Dashboard → **google-ranker-backend**
2. Wait for status to show **"Live"** (green)
3. Open: **https://google-ranker-backend.onrender.com/health**
4. You should see: `{"status":"ok",...}`

### 8.2 Check Frontend Status
1. In Render Dashboard → **google-ranker-frontend**
2. Wait for status to show **"Live"** (green)
3. Open: **https://google-ranker-frontend.onrender.com**
4. You should see your landing page

### 8.3 Test Complete Flow
1. Click **"Login"** or **"Get Started"**
2. Try **Google Sign-In**
3. Should authenticate and redirect to dashboard

---

## 📊 MONITORING & LOGS

### View Logs:
- **Backend:** Render Dashboard → google-ranker-backend → **Logs** tab
- **Frontend:** Render Dashboard → google-ranker-frontend → **Logs** tab

### Common Issues:

**Backend fails to start:**
- Check logs for missing environment variables
- Verify `serviceAccountKey.json` is uploaded correctly
- Ensure all required env vars are set

**Frontend shows blank page:**
- Check browser console for errors
- Verify all `VITE_` variables are set
- Check that `VITE_BACKEND_URL` is correct

**OAuth errors:**
- Verify redirect URIs in Google Cloud Console
- Check that `GOOGLE_CLIENT_ID` matches in both services
- Ensure `FRONTEND_URL` points to correct domain

**Database errors:**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Check Supabase project is active
- Verify tables exist in database

---

## 🎉 SUCCESS CHECKLIST

- [ ] Backend shows "Live" status
- [ ] Frontend shows "Live" status
- [ ] `/health` endpoint returns 200 OK
- [ ] Landing page loads
- [ ] Can sign up with email
- [ ] Can log in with Google
- [ ] Dashboard loads after login
- [ ] Google Business Profile connection works

---

## 🔄 FUTURE DEPLOYMENTS

Once set up, deployments are automatic:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render will:
1. Detect the push
2. Build both services
3. Run health checks
4. Deploy new version (zero downtime)

---

## 📱 YOUR LIVE URLs

- **Frontend:** https://google-ranker-frontend.onrender.com
- **Backend:** https://google-ranker-backend.onrender.com
- **API Health:** https://google-ranker-backend.onrender.com/health

---

## ⚠️ FREE TIER NOTES

- Services sleep after **15 minutes** of inactivity
- First request after sleep takes **30-60 seconds** to wake up
- 750 hours/month free (both services count separately)
- For 24/7 uptime, upgrade backend to **$7/month**

---

## 🆘 NEED HELP?

**Render Documentation:** https://render.com/docs
**Render Community:** https://community.render.com/
**Status Page:** https://status.render.com/

**Check Logs First:**
- Most issues are visible in service logs
- Backend logs show API errors
- Frontend build logs show compile errors

---

**Good luck with your deployment! 🚀**
