# Environment Variables Checklist

Use this checklist to gather all required credentials BEFORE starting deployment.

---

## BACKEND ENVIRONMENT VARIABLES

### ✅ Google OAuth (REQUIRED)
- [ ] `GOOGLE_CLIENT_ID` - ___________________________
- [ ] `GOOGLE_CLIENT_SECRET` - ___________________________
- [ ] `GOOGLE_REDIRECT_URI` = `https://google-ranker-backend.onrender.com/auth/google/callback`

**Get from:** https://console.cloud.google.com/ → APIs & Services → Credentials

---

### ✅ Supabase Database (REQUIRED)
- [ ] `SUPABASE_URL` - ___________________________
- [ ] `SUPABASE_SERVICE_KEY` - ___________________________

**Get from:** https://supabase.com/dashboard → Your Project → Settings → API

---

### ✅ Firebase Service Account (REQUIRED)
- [ ] `serviceAccountKey.json` file ready

**Get from:**
- Your local: `server/serviceAccountKey.json`
- Or Firebase Console: https://console.firebase.google.com/ → Settings → Service accounts → Generate new private key

---

### ✅ Frontend URL (REQUIRED)
- [ ] `FRONTEND_URL` = `https://google-ranker-frontend.onrender.com`

---

### ✅ Google Business Profile (REQUIRED)
- [ ] `HARDCODED_ACCOUNT_ID` = `106433552101751461082` (or your account ID)

---

### ⚠️ Razorpay Payment (OPTIONAL - Only if using payments)
- [ ] `RAZORPAY_KEY_ID` - ___________________________
- [ ] `RAZORPAY_KEY_SECRET` - ___________________________
- [ ] `RAZORPAY_WEBHOOK_SECRET` - ___________________________

**Get from:** https://dashboard.razorpay.com/ → Settings → API Keys

---

### ⚠️ Email Service (OPTIONAL - Only if using emails)
- [ ] `RESEND_API_KEY` - ___________________________

**Get from:** https://resend.com/api-keys

---

### ⚠️ OpenAI (OPTIONAL - Only if using AI features)
- [ ] `OPENAI_API_KEY` - ___________________________

**Get from:** https://platform.openai.com/api-keys

---

### ⚠️ Twilio SMS (OPTIONAL - Only if using SMS/WhatsApp)
- [ ] `TWILIO_ACCOUNT_SID` - ___________________________
- [ ] `TWILIO_AUTH_TOKEN` - ___________________________
- [ ] `TWILIO_PHONE_NUMBER` - ___________________________
- [ ] `WHATSAPP_ACCESS_TOKEN` - ___________________________
- [ ] `WHATSAPP_PHONE_NUMBER_ID` - ___________________________

**Get from:** https://console.twilio.com/

---

## FRONTEND ENVIRONMENT VARIABLES

### ✅ Firebase Config (REQUIRED)
- [ ] `VITE_FIREBASE_API_KEY` - ___________________________
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` - ___________________________
- [ ] `VITE_FIREBASE_PROJECT_ID` - ___________________________
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` - ___________________________
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` - ___________________________
- [ ] `VITE_FIREBASE_APP_ID` - ___________________________

**Get from:** https://console.firebase.google.com/ → Project Settings → General → Your apps → SDK setup and configuration

---

### ✅ Google Client (REQUIRED)
- [ ] `VITE_GOOGLE_CLIENT_ID` - ___________________________ (same as backend GOOGLE_CLIENT_ID)

---

### ✅ Backend URL (AUTO-SET BY RENDER)
- [ ] `VITE_BACKEND_URL` = `https://google-ranker-backend.onrender.com`

**Note:** This is automatically set by Render from the backend service

---

## Quick Reference - Where Your Credentials Are

### Google Cloud Console
**URL:** https://console.cloud.google.com/
**Provides:**
- Google OAuth Client ID & Secret
- Enable Google Business Profile API

### Firebase Console
**URL:** https://console.firebase.google.com/
**Provides:**
- Firebase config (all VITE_FIREBASE_* variables)
- Service account JSON file

### Supabase Dashboard
**URL:** https://supabase.com/dashboard
**Provides:**
- Database URL
- Service role key

### Razorpay Dashboard (Optional)
**URL:** https://dashboard.razorpay.com/
**Provides:**
- Payment API keys
- Webhook secret

### Resend Dashboard (Optional)
**URL:** https://resend.com/
**Provides:**
- Email API key

### OpenAI Platform (Optional)
**URL:** https://platform.openai.com/
**Provides:**
- OpenAI API key

---

## Total Required Variables

### Backend: 6 Required + 11 Optional
**Absolutely Required (6):**
1. GOOGLE_CLIENT_ID
2. GOOGLE_CLIENT_SECRET
3. GOOGLE_REDIRECT_URI
4. SUPABASE_URL
5. SUPABASE_SERVICE_KEY
6. FRONTEND_URL

**Plus 1 Required File:**
- serviceAccountKey.json

**Optional for full features (11):**
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- RAZORPAY_WEBHOOK_SECRET
- OPENAI_API_KEY
- RESEND_API_KEY
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER
- WHATSAPP_ACCESS_TOKEN
- WHATSAPP_PHONE_NUMBER_ID
- HARDCODED_ACCOUNT_ID

### Frontend: 8 Required
**All Required (8):**
1. VITE_FIREBASE_API_KEY
2. VITE_FIREBASE_AUTH_DOMAIN
3. VITE_FIREBASE_PROJECT_ID
4. VITE_FIREBASE_STORAGE_BUCKET
5. VITE_FIREBASE_MESSAGING_SENDER_ID
6. VITE_FIREBASE_APP_ID
7. VITE_GOOGLE_CLIENT_ID
8. VITE_BACKEND_URL (auto-set)

---

## Tips for Gathering Credentials

1. **Start with Firebase** - Get all Firebase variables first
2. **Then Google Cloud** - Set up OAuth credentials
3. **Then Supabase** - Get database credentials
4. **Optional Services** - Add payment, email, AI as needed

5. **Keep them secure:**
   - Never commit to Git
   - Store in password manager
   - Only enter in Render dashboard

6. **Test locally first:**
   - Set up `.env` files locally
   - Verify everything works
   - Then deploy to Render

---

## Next Steps

Once you have all required variables checked off:
1. Follow the **DEPLOY_TO_RENDER.md** step-by-step guide
2. Copy-paste each variable into Render dashboard
3. Deploy and test

---

**Pro Tip:** Open all the credential dashboards in separate browser tabs before starting deployment. This makes it faster to copy-paste values into Render.
