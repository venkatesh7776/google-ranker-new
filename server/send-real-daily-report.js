import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { format } from 'date-fns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local explicitly
dotenv.config({ path: path.join(__dirname, '.env.local') });

const toEmail = process.argv[2] || 'jobspring.help@gmail.com';

console.log('========================================');
console.log('📧 SENDING REAL DAILY ACTIVITY REPORT');
console.log('========================================\n');

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not set!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

async function fetchRealData(userEmail) {
  console.log(`📊 Fetching real data for: ${userEmail}\n`);

  let userName = userEmail.split('@')[0];

  // Get today's date range (start of day in UTC)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // FETCH USER SUBSCRIPTION STATUS from users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('subscription_status, trial_start_date, trial_end_date, display_name')
    .eq('gmail_id', userEmail)
    .single();

  let subscriptionStatus = 'trial';
  let trialEndDate = null;
  let daysRemaining = 0;
  let isTrialUser = false;
  let isExpiredTrial = false;
  let isSubscribed = false;

  if (userError) {
    console.log(`   ⚠️ Error fetching user data: ${userError.message}`);
  } else if (userData) {
    subscriptionStatus = (userData.subscription_status || 'trial').trim();
    trialEndDate = userData.trial_end_date;

    if (userData.display_name) {
      userName = userData.display_name;
    }

    // Calculate trial status
    if (subscriptionStatus === 'trial' && trialEndDate) {
      const endDate = new Date(trialEndDate);
      daysRemaining = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));

      if (daysRemaining > 0) {
        isTrialUser = true;
      } else {
        isExpiredTrial = true;
        daysRemaining = 0;
      }
    } else if (subscriptionStatus === 'expired') {
      isExpiredTrial = true;
    } else if (subscriptionStatus === 'active' || subscriptionStatus === 'admin') {
      isSubscribed = true;
    }

    console.log(`   Subscription Status: ${subscriptionStatus}`);
    console.log(`   Trial End Date: ${trialEndDate || 'N/A'}`);
    console.log(`   Days Remaining: ${daysRemaining}`);
    console.log(`   Is Trial User: ${isTrialUser}`);
    console.log(`   Is Expired: ${isExpiredTrial}`);
    console.log(`   Is Subscribed: ${isSubscribed}`);
  }

  // PRIMARY SOURCE: user_locations table has all the real data
  // This tracks total_posts_created, last_post_date per location
  const { data: userLocations, error: locError } = await supabase
    .from('user_locations')
    .select('*')
    .eq('gmail_id', userEmail);

  if (locError) {
    console.log(`   ❌ Error fetching user_locations: ${locError.message}`);
  }

  let postsCount = 0;
  let reviewsCount = 0;
  let locationsCount = 0;
  let totalPostsAllTime = 0;
  let businessName = userName;

  if (userLocations && userLocations.length > 0) {
    locationsCount = userLocations.length;

    for (const loc of userLocations) {
      totalPostsAllTime += loc.total_posts_created || 0;

      // Check if post was made today (comparing dates)
      if (loc.last_post_date && loc.last_post_success) {
        const lastPost = new Date(loc.last_post_date);
        lastPost.setUTCHours(0, 0, 0, 0);

        if (lastPost.getTime() === today.getTime()) {
          // Post was made today - count it
          postsCount++;
        }
      }

      // Get business name from first location with a name
      if (loc.business_name && loc.business_name !== 'Business') {
        businessName = loc.business_name;
      }
    }

    console.log(`   Business Name: ${businessName}`);
    console.log(`   Total posts all time: ${totalPostsAllTime}`);
    console.log(`   Posts created today: ${postsCount}`);
    console.log(`   Active locations: ${locationsCount}`);
  } else {
    console.log(`   ⚠️ No locations found for ${userEmail}`);
    locationsCount = 1; // Default
  }

  // Reviews count is not tracked yet in user_locations
  console.log(`   Reviews replied today: ${reviewsCount}`);

  return {
    userName: businessName,
    postsCount,
    reviewsCount,
    locationsCount,
    totalPostsAllTime,
    subscriptionStatus,
    isTrialUser,
    isExpiredTrial,
    isSubscribed,
    daysRemaining
  };
}

async function sendRealEmail() {
  try {
    // Fetch real data from database
    const data = await fetchRealData(toEmail);

    const today = format(new Date(), 'MMMM dd, yyyy');
    const websiteUrl = 'https://www.googleranker.io';
    const appUrl = 'https://www.googleranker.io';

    // Generate subscription banner based on status
    let subscriptionBanner = '';

    if (data.isExpiredTrial) {
      // RED EXPIRED BANNER
      subscriptionBanner = `
      <div style="background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); padding: 25px 30px; margin: 0; border-bottom: 3px solid #991B1B;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center;">
              <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 6px 16px; border-radius: 20px; margin-bottom: 12px;">
                <span style="color: #ffffff; font-size: 13px; font-weight: 600;">TRIAL EXPIRED</span>
              </div>
              <h2 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 8px 0;">Your Trial Period Has Ended</h2>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 18px 0; line-height: 1.5;">
                Your automation services have been paused. Upgrade now to continue growing your business with GoogleRanker.
              </p>
              <a href="${appUrl}/dashboard/billing" style="display: inline-block; background-color: #ffffff; color: #DC2626 !important; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 700; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
                Upgrade Now
              </a>
            </td>
          </tr>
        </table>
      </div>`;
    } else if (data.isTrialUser) {
      // ORANGE/AMBER TRIAL WARNING BANNER
      const urgencyColor = data.daysRemaining <= 3 ? '#DC2626' : '#F59E0B';
      const urgencyBg = data.daysRemaining <= 3 ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' : 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)';
      const urgencyText = data.daysRemaining <= 3 ? 'URGENT' : 'TRIAL';

      subscriptionBanner = `
      <div style="background: ${urgencyBg}; padding: 25px 30px; margin: 0; border-bottom: 3px solid #F59E0B;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center;">
              <div style="background: ${data.daysRemaining <= 3 ? '#DC2626' : '#F59E0B'}; display: inline-block; padding: 6px 16px; border-radius: 20px; margin-bottom: 12px;">
                <span style="color: #ffffff; font-size: 13px; font-weight: 600;">${urgencyText} - ${data.daysRemaining} DAY${data.daysRemaining !== 1 ? 'S' : ''} LEFT</span>
              </div>
              <h2 style="color: #92400E; font-size: 22px; font-weight: 700; margin: 0 0 8px 0;">Your Trial is Ending Soon</h2>
              <p style="color: #78350F; font-size: 14px; margin: 0 0 18px 0; line-height: 1.5;">
                Don't lose your automated posts and review responses. Upgrade to keep your business growing!
              </p>
              <a href="${appUrl}/dashboard/billing" style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #ffffff !important; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 700; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
                Upgrade Now
              </a>
            </td>
          </tr>
        </table>
      </div>`;
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Activity Report - ${today}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', Arial, sans-serif; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #1E2DCD 0%, #4F46E5 100%); padding: 40px 30px; text-align: center; color: white; }
    .logo { color: #ffffff; font-size: 32px; font-weight: bold; margin: 0; }
    .date { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px; }
    .content { padding: 30px; }
    .greeting { color: #111827; font-size: 18px; margin-bottom: 15px; font-weight: 600; }
    .intro-text { color: #4B5563; font-size: 15px; line-height: 1.6; margin-bottom: 25px; }
    .section-header { font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 20px; }
    .features-section { background: #F9FAFB; padding: 25px; border-radius: 8px; margin: 25px 0; }
    .feature-item { display: flex; align-items: center; margin-bottom: 12px; }
    .feature-icon { color: #10B981; font-size: 18px; margin-right: 10px; }
    .feature-text { color: #374151; font-size: 14px; }
    .cta-button { display: inline-block; background-color: #1E40AF; color: #ffffff !important; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: #F9FAFB; padding: 30px; text-align: center; color: #6B7280; font-size: 13px; border-top: 1px solid #E5E7EB; }
    .footer-links { margin: 15px 0; }
    .footer-link { color: #1E40AF; text-decoration: none; margin: 0 15px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1 class="logo">GoogleRanker</h1>
      <p class="date">Daily Activity Report - ${today}</p>
    </div>

    <!-- Subscription Status Banner (Trial/Expired only) -->
    ${subscriptionBanner}

    <!-- Content -->
    <div class="content">
      <p class="greeting">Hi ${data.userName},</p>
      <p class="intro-text">Your Google Business Profile is being optimized automatically. GoogleRanker is working around the clock to boost your local search rankings and engage with your customers.</p>

      <!-- Daily Activity Section -->
      <h3 class="section-header">Today's Activity Summary</h3>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
        <tr>
          <td width="32%" style="background: #F0F7FF; border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #E5E5E5;">
            <h2 style="font-size: 36px; font-weight: 800; color: #EF4444; margin: 0;">${data.postsCount}</h2>
            <p style="color: #111827; font-size: 14px; margin: 8px 0 0 0; font-weight: 600;">Posts Published</p>
          </td>
          <td width="2%"></td>
          <td width="32%" style="background: #F0F7FF; border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #E5E5E5;">
            <h2 style="font-size: 36px; font-weight: 800; color: #EF4444; margin: 0;">${data.reviewsCount}</h2>
            <p style="color: #111827; font-size: 14px; margin: 8px 0 0 0; font-weight: 600;">Reviews Responded</p>
          </td>
          <td width="2%"></td>
          <td width="32%" style="background: #F0F7FF; border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #E5E5E5;">
            <h2 style="font-size: 36px; font-weight: 800; color: #3B82F6; margin: 0;">${data.locationsCount}</h2>
            <p style="color: #111827; font-size: 14px; margin: 8px 0 0 0; font-weight: 600;">Active Locations</p>
          </td>
        </tr>
      </table>

      <!-- Features Active -->
      <div class="features-section">
        <h4 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 15px 0;">What GoogleRanker Did Today:</h4>

        ${data.postsCount > 0 ? `
        <div class="feature-item">
          <span class="feature-icon">✓</span>
          <span class="feature-text"><strong>Auto-Posted</strong> ${data.postsCount} engaging post${data.postsCount !== 1 ? 's' : ''} to your Google Business Profile</span>
        </div>
        ` : ''}

        ${data.reviewsCount > 0 ? `
        <div class="feature-item">
          <span class="feature-icon">✓</span>
          <span class="feature-text"><strong>AI-Replied</strong> to ${data.reviewsCount} customer review${data.reviewsCount !== 1 ? 's' : ''} automatically</span>
        </div>
        ` : ''}

        <div class="feature-item">
          <span class="feature-icon">✓</span>
          <span class="feature-text"><strong>Monitored</strong> your profile for new reviews and insights</span>
        </div>

        <div class="feature-item">
          <span class="feature-icon">✓</span>
          <span class="feature-text"><strong>Optimized</strong> your local SEO presence on Google Search</span>
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/dashboard" class="cta-button">View Full Dashboard</a>
      </div>

      <p style="color: #6B7280; font-size: 14px; text-align: center;">
        Questions? Reply to this email or visit our <a href="${websiteUrl}" style="color: #1E40AF;">website</a>.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-links">
        <a href="${appUrl}/dashboard" class="footer-link">Dashboard</a>
        |
        <a href="${appUrl}/dashboard/posts" class="footer-link">Manage Posts</a>
        |
        <a href="${appUrl}/dashboard/reviews" class="footer-link">Manage Reviews</a>
        |
        <a href="${appUrl}/dashboard/settings" class="footer-link">Settings</a>
      </div>

      <p style="margin: 20px 0; font-size: 13px; color: #6B7280;">
        © ${new Date().getFullYear()} GoogleRanker. All rights reserved.
      </p>

      <p style="color: #9CA3AF; font-size: 12px;">
        You're receiving this daily report because you have an active GoogleRanker account.<br>
        <a href="${appUrl}/dashboard/settings" style="color: #9CA3AF; text-decoration: underline;">Manage email preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
GoogleRanker Daily Activity Report - ${today}

Hi ${data.userName}!

Your Google Business Profile is being optimized automatically. GoogleRanker is working around the clock to boost your local search rankings and engage with your customers.

Today's Activity Summary:
- Posts Published: ${data.postsCount}
- Reviews Responded: ${data.reviewsCount}
- Active Locations: ${data.locationsCount}

What GoogleRanker Did Today:
${data.postsCount > 0 ? `✓ Auto-Posted ${data.postsCount} engaging post${data.postsCount !== 1 ? 's' : ''} to your Google Business Profile\n` : ''}${data.reviewsCount > 0 ? `✓ AI-Replied to ${data.reviewsCount} customer review${data.reviewsCount !== 1 ? 's' : ''} automatically\n` : ''}✓ Monitored your profile for new reviews and insights
✓ Optimized your local SEO presence on Google Search

View your dashboard: ${appUrl}/dashboard

© ${new Date().getFullYear()} GoogleRanker. All rights reserved.
    `;

    console.log('\n========================================');
    console.log('📧 SENDING EMAIL WITH REAL DATA');
    console.log('========================================');
    console.log(`To: ${toEmail}`);
    console.log(`Subject: Daily Activity Report - ${today}`);
    console.log(`Posts Today: ${data.postsCount} | Reviews: ${data.reviewsCount} | Locations: ${data.locationsCount}`);
    console.log(`Total Posts All Time: ${data.totalPostsAllTime}`);
    console.log('');
    console.log('📋 Subscription Status:');
    console.log(`   Status: ${data.subscriptionStatus}`);
    console.log(`   Is Trial: ${data.isTrialUser} | Is Expired: ${data.isExpiredTrial} | Is Subscribed: ${data.isSubscribed}`);
    console.log(`   Days Remaining: ${data.daysRemaining}`);
    console.log(`   Banner: ${data.isExpiredTrial ? '🔴 EXPIRED' : data.isTrialUser ? '🟡 TRIAL WARNING' : '✅ NO BANNER (Subscribed)'}`);
    console.log('');

    const result = await transporter.sendMail({
      from: `${process.env.GMAIL_FROM_NAME || 'GoogleRanker'} <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: `Daily Activity Report - ${today}`,
      html,
      text
    });

    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log('');
    console.log('========================================');
    console.log('✅ REAL DAILY REPORT SENT');
    console.log('========================================');
    console.log(`\nCheck inbox: ${toEmail}`);

  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    process.exit(1);
  }
}

sendRealEmail();
