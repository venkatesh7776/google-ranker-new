# Step-by-Step Render Deployment Guide

Follow these exact steps to deploy your Google Ranker application to Render.

---

## STEP 1: Push Your Code to GitHub

### 1.1 Stage All Changes
```bash
git add .
```

### 1.2 Commit Changes
```bash
git commit -m "Configure for Render deployment"
```

### 1.3 Push to GitHub
```bash
git push origin main
```

**Status Check:** Your code should now be on GitHub. Verify by visiting your repository URL.

---

## STEP 2: Create Render Account

### 2.1 Sign Up
1. Go to: https://render.com/
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended - easier connection)

### 2.2 Connect GitHub
- If you signed up with GitHub, it's already connected
- If not: Settings → Connected Accounts → Connect GitHub

**Status Check:** You should see your GitHub account connected in Render dashboard.

---

## STEP 3: Deploy Using Blueprint

### 3.1 Create New Blueprint
1. In Render Dashboard, click "New +" button (top right)
2. Select "Blueprint"
3. Connect your `google-ranker-new` repository
4. Render will detect the `render.yaml` file automatically
5. Click "Apply" to create services

**What Happens:**
- Render creates 2 services:
  - `google-ranker-backend` (Node.js API)
  - `google-ranker-frontend` (Static Site)

**Status Check:** You should see 2 services being created. They will show "Deploy failed" - this is normal because we haven't set environment variables yet.

---

## STEP 4: Configure Backend Environment Variables

### 4.1 Go to Backend Service
1. In Render Dashboard, click on `google-ranker-backend` service
2. Go to "Environment" tab on the left

### 4.2 Add Environment Variables
Click "Add Environment Variable" and add each of these:

#### Google OAuth (REQUIRED - Get from Google Cloud Console)
```
GOOGLE_CLIENT_ID = your_google_client_id_here
GOOGLE_CLIENT_SECRET = your_google_client_secret_here
GOOGLE_REDIRECT_URI = https://google-ranker-backend.onrender.com/auth/google/callback
```

**Where to get these:**
1. Go to: https://console.cloud.google.com/
2. Select your project
3. APIs & Services → Credentials
4. Find your OAuth 2.0 Client ID
5. Copy Client ID and Client Secret

#### Frontend URL (REQUIRED)
```
FRONTEND_URL = https://google-ranker-frontend.onrender.com
```

#### Database (REQUIRED - Get from Supabase)
```
SUPABASE_URL = your_supabase_project_url
SUPABASE_SERVICE_KEY = your_supabase_service_role_key
```

**Where to get these:**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy "Project URL" and "service_role key"

#### Payment Processing (REQUIRED if using payments - Get from Razorpay)
```
RAZORPAY_KEY_ID = your_razorpay_key_id
RAZORPAY_KEY_SECRET = your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET = your_razorpay_webhook_secret
```

#### Email Service (REQUIRED if using email - Get from Resend)
```
RESEND_API_KEY = your_resend_api_key
```

#### AI Features (REQUIRED if using AI - Get from OpenAI)
```
OPENAI_API_KEY = your_openai_api_key
```

#### SMS/WhatsApp (OPTIONAL - Get from Twilio)
```
TWILIO_ACCOUNT_SID = your_twilio_account_sid
TWILIO_AUTH_TOKEN = your_twilio_auth_token
TWILIO_PHONE_NUMBER = your_twilio_phone_number
WHATSAPP_ACCESS_TOKEN = your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID = your_whatsapp_phone_number_id
```

#### Google Business Profile (REQUIRED)
```
HARDCODED_ACCOUNT_ID = 106433552101751461082
```
(Or use your specific Google Business Profile account ID)

### 4.3 Add Firebase Service Account (REQUIRED)

1. Still in Backend service, Environment tab
2. Click "Secret Files" section
3. Click "Add Secret File"
4. Set Filename: `serviceAccountKey.json`
5. Paste your Firebase service account JSON content

**Where to get this:**
- Your local file: `server/serviceAccountKey.json`
- Or download from Firebase Console:
  1. Go to: https://console.firebase.google.com/
  2. Select your project
  3. Settings (gear icon) → Service accounts
  4. Click "Generate new private key"
  5. Copy the entire JSON content

### 4.4 Save and Deploy
1. Click "Save Changes"
2. Backend will automatically redeploy

**Status Check:** Wait for backend to show "Live" status (may take 2-3 minutes).

---

## STEP 5: Configure Frontend Environment Variables

### 5.1 Go to Frontend Service
1. In Render Dashboard, click on `google-ranker-frontend` service
2. Go to "Environment" tab

### 5.2 Add Firebase Variables (REQUIRED)

Get these from Firebase Console (https://console.firebase.google.com/):
1. Select your project
2. Settings (gear icon) → General
3. Scroll to "Your apps" section
4. Find your web app config

Add these variables:
```
VITE_FIREBASE_API_KEY = your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN = your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID = your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET = your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID = your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID = your_firebase_app_id
```

### 5.3 Add Google Client ID (REQUIRED)
```
VITE_GOOGLE_CLIENT_ID = same_value_as_backend_GOOGLE_CLIENT_ID
```

### 5.4 Verify Backend URL (AUTO-CONFIGURED)
```
VITE_BACKEND_URL = https://google-ranker-backend.onrender.com
```

**Note:** This should be automatically set by Render. If not, add it manually.

### 5.5 Save and Deploy
1. Click "Save Changes"
2. Frontend will automatically rebuild and deploy

**Status Check:** Wait for frontend to show "Live" status (may take 3-5 minutes for build).

---

## STEP 6: Update Google OAuth Settings

### 6.1 Update Authorized Redirect URIs

1. Go to: https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Click your OAuth 2.0 Client ID
4. Under "Authorized redirect URIs", add:
   ```
   https://google-ranker-backend.onrender.com/auth/google/callback
   https://google-ranker-frontend.onrender.com/auth/google/callback
   ```

### 6.2 Update Authorized JavaScript Origins
Add:
```
https://google-ranker-frontend.onrender.com
https://google-ranker-backend.onrender.com
```

### 6.3 Save Changes
Click "Save" at the bottom

**Status Check:** OAuth should now work with your deployed application.

---

## STEP 7: Verify Deployment

### 7.1 Check Backend Health
1. Open: https://google-ranker-backend.onrender.com/health
2. You should see JSON response: `{"status":"ok",...}`

### 7.2 Access Your App
1. Open: https://google-ranker-frontend.onrender.com
2. You should see your landing page

### 7.3 Test Login
1. Click "Login" or "Get Started"
2. Try signing in with Google
3. Should redirect and authenticate successfully

---

## STEP 8: Monitor Your Application

### 8.1 View Logs
- Backend Logs: Render Dashboard → google-ranker-backend → Logs
- Frontend Logs: Render Dashboard → google-ranker-frontend → Logs

### 8.2 Check Metrics
- Render Dashboard shows:
  - CPU usage
  - Memory usage
  - Request counts
  - Response times

---

## Important Notes About Free Tier

### Service Spin Down
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- Subsequent requests are fast

### Limitations
- 750 hours/month free (one service running 24/7)
- Backend and frontend count separately
- Services restart automatically on code push

### Upgrade Options
If you need 24/7 uptime:
- Upgrade backend to paid tier ($7/month)
- Frontend can stay on free tier

---

## Troubleshooting

### Backend Won't Start
**Check:**
1. Environment variables are all set
2. Firebase service account file is uploaded
3. Check logs for error messages

**Common Issues:**
- Missing `GOOGLE_CLIENT_SECRET`
- Missing `SUPABASE_URL` or `SUPABASE_SERVICE_KEY`
- Invalid Firebase service account JSON

### Frontend Shows Blank Page
**Check:**
1. All `VITE_` environment variables are set
2. `VITE_BACKEND_URL` points to correct backend URL
3. Browser console for errors

### OAuth Not Working
**Check:**
1. `GOOGLE_REDIRECT_URI` matches Google Cloud Console
2. Authorized redirect URIs include Render URLs
3. `FRONTEND_URL` matches actual frontend URL

### Database Connection Errors
**Check:**
1. Supabase credentials are correct
2. Supabase project is active
3. Tables exist in Supabase database

---

## Future Deployments

### Automatic Deployments
Once set up, Render automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render will:
1. Detect the push
2. Build services
3. Run health checks
4. Deploy new version
5. Keep old version running until new version is healthy

### Manual Redeploy
If needed, you can manually redeploy:
1. Go to Render Dashboard
2. Click service
3. Click "Manual Deploy" → "Deploy latest commit"

---

## Getting Help

### Render Support
- Documentation: https://render.com/docs
- Community: https://community.render.com/
- Status: https://status.render.com/

### Your Application Logs
- Always check logs first when debugging
- Backend logs show API errors
- Frontend build logs show compile errors

---

## Checklist

Before considering deployment complete, verify:

- [ ] Backend shows "Live" status
- [ ] Frontend shows "Live" status
- [ ] Health endpoint returns 200 OK
- [ ] Landing page loads correctly
- [ ] Can sign up with email
- [ ] Can log in with Google
- [ ] Dashboard loads after login
- [ ] Google Business Profile connection works
- [ ] All required features work

---

**Congratulations! Your app is now deployed on Render!**

Your URLs:
- **Frontend:** https://google-ranker-frontend.onrender.com
- **Backend:** https://google-ranker-backend.onrender.com
- **API Health:** https://google-ranker-backend.onrender.com/health
