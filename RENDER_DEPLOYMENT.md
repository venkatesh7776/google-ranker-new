# Render Deployment Guide

This application is configured to deploy to Render using the `render.yaml` blueprint.

## Deployment Steps

### 1. Connect Repository to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file

### 2. Configure Environment Variables

You'll need to set up the following environment variables in the Render dashboard:

#### Backend Service Environment Variables

**Google OAuth Configuration:**
- `GOOGLE_CLIENT_ID` - Your Google Cloud Console OAuth 2.0 Client ID
- `GOOGLE_CLIENT_SECRET` - Your Google Cloud Console OAuth 2.0 Client Secret
- `GOOGLE_REDIRECT_URI` - Set to: `https://your-backend-url.onrender.com/auth/google/callback`

**Database & Storage:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key

**Payment Processing (Razorpay):**
- `RAZORPAY_KEY_ID` - Your Razorpay Key ID
- `RAZORPAY_KEY_SECRET` - Your Razorpay Key Secret
- `RAZORPAY_WEBHOOK_SECRET` - Your Razorpay Webhook Secret

**External Services:**
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `RESEND_API_KEY` - Resend API key for email service
- `TWILIO_ACCOUNT_SID` - Twilio Account SID for SMS
- `TWILIO_AUTH_TOKEN` - Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number
- `WHATSAPP_ACCESS_TOKEN` - WhatsApp Business API access token
- `WHATSAPP_PHONE_NUMBER_ID` - WhatsApp phone number ID

**Other Configuration:**
- `HARDCODED_ACCOUNT_ID` - Google Business Profile account ID
- `FRONTEND_URL` - Will be auto-set to your frontend URL

#### Frontend Service Environment Variables

**Firebase Configuration:**
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

**Backend Connection:**
- `VITE_GOOGLE_CLIENT_ID` - Same as backend GOOGLE_CLIENT_ID
- `VITE_BACKEND_URL` - Automatically set to backend service URL

### 3. Add Firebase Service Account

Upload your Firebase service account JSON file:
1. In Render dashboard, go to your backend service
2. Navigate to "Environment" tab
3. Add a "Secret File" with path: `/etc/secrets/serviceAccountKey.json`
4. Paste your Firebase service account JSON content

### 4. Deploy

Once all environment variables are set:
1. Render will automatically build and deploy both services
2. Backend will be available at: `https://google-ranker-backend.onrender.com`
3. Frontend will be available at: `https://google-ranker-frontend.onrender.com`

### 5. Update OAuth Redirect URIs

After deployment, update your Google Cloud Console OAuth 2.0 credentials:

**Authorized Redirect URIs:**
- `https://your-backend-url.onrender.com/auth/google/callback`
- `https://your-frontend-url.onrender.com/auth/google/callback`

**Authorized JavaScript Origins:**
- `https://your-frontend-url.onrender.com`

## Important Notes

### Free Tier Limitations
- Render free tier services spin down after 15 minutes of inactivity
- First request after spindown may take 30-60 seconds
- Consider upgrading to paid tier for production use

### Database
- Ensure Supabase is properly configured with all required tables
- Connection pooling is handled by the application

### Health Checks
- Backend health endpoint: `/health`
- Render uses this to monitor service health

### CORS Configuration
- The backend is configured to accept requests from the frontend URL
- Ensure `FRONTEND_URL` environment variable is set correctly

## Monitoring

- View logs in Render dashboard under each service
- Health status available at backend `/health` endpoint
- Monitor API usage in Google Cloud Console
- Check Supabase dashboard for database metrics

## Troubleshooting

### Build Failures
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Runtime Errors
- Check runtime logs in Render dashboard
- Verify all environment variables are set correctly
- Ensure Firebase service account file is uploaded
- Check Supabase connection and credentials

### OAuth Issues
- Verify redirect URIs match in Google Cloud Console
- Ensure `GOOGLE_REDIRECT_URI` points to deployed backend
- Check that frontend `VITE_BACKEND_URL` is correct

## Deployment from Git

Render automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Render will:
1. Detect the push
2. Build both services
3. Deploy automatically
4. Run health checks
5. Switch traffic to new version

## Manual Redeploy

To manually trigger a redeploy without code changes:
1. Go to Render dashboard
2. Select your service
3. Click "Manual Deploy" → "Deploy latest commit"
