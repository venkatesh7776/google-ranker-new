import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { format } from 'date-fns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local explicitly
dotenv.config({ path: path.join(__dirname, '.env.local') });

const toEmail = process.argv[2] || 'jobspring.help@gmail.com';
const userName = process.argv[3] || 'there';

console.log('========================================');
console.log('📧 SENDING DAILY ACTIVITY REPORT EMAIL');
console.log('========================================\n');

const today = format(new Date(), 'MMMM dd, yyyy');
const websiteUrl = 'https://www.googleranker.io';
const appUrl = 'https://www.googleranker.io';

// Sample activity data
const postsCreated = 3;
const reviewsReplied = 5;
const locations = 2;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

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
    .stats-grid { display: flex; gap: 15px; margin: 20px 0; }
    .stat-card { flex: 1; background: #F0F7FF; border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #E5E5E5; }
    .stat-number { font-size: 36px; font-weight: 800; color: #EF4444; margin: 0; }
    .stat-number.blue { color: #3B82F6; }
    .stat-label { color: #111827; font-size: 14px; margin: 8px 0 0 0; font-weight: 600; }
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
      <p class="date">Daily Activity Report • ${today}</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Hi ${userName},</p>
      <p class="intro-text">Your Google Business Profile is being optimized automatically. GoogleRanker is working around the clock to boost your local search rankings and engage with your customers.</p>

      <!-- Daily Activity Section -->
      <h3 class="section-header">📊 Today's Activity Summary</h3>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
        <tr>
          <td width="32%" style="background: #F0F7FF; border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #E5E5E5;">
            <h2 style="font-size: 36px; font-weight: 800; color: #EF4444; margin: 0;">${postsCreated}</h2>
            <p style="color: #111827; font-size: 14px; margin: 8px 0 0 0; font-weight: 600;">Posts Published</p>
          </td>
          <td width="2%"></td>
          <td width="32%" style="background: #F0F7FF; border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #E5E5E5;">
            <h2 style="font-size: 36px; font-weight: 800; color: #EF4444; margin: 0;">${reviewsReplied}</h2>
            <p style="color: #111827; font-size: 14px; margin: 8px 0 0 0; font-weight: 600;">Reviews Responded</p>
          </td>
          <td width="2%"></td>
          <td width="32%" style="background: #F0F7FF; border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #E5E5E5;">
            <h2 style="font-size: 36px; font-weight: 800; color: #3B82F6; margin: 0;">${locations}</h2>
            <p style="color: #111827; font-size: 14px; margin: 8px 0 0 0; font-weight: 600;">Active Locations</p>
          </td>
        </tr>
      </table>

      <!-- Features Active -->
      <div class="features-section">
        <h4 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 15px 0;">🚀 What GoogleRanker Did Today:</h4>

        <div class="feature-item">
          <span class="feature-icon">✓</span>
          <span class="feature-text"><strong>Auto-Posted</strong> ${postsCreated} engaging posts to your Google Business Profile</span>
        </div>

        <div class="feature-item">
          <span class="feature-icon">✓</span>
          <span class="feature-text"><strong>AI-Replied</strong> to ${reviewsReplied} customer reviews automatically</span>
        </div>

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
        <a href="${appUrl}/posts" class="footer-link">Manage Posts</a>
        |
        <a href="${appUrl}/reviews" class="footer-link">Manage Reviews</a>
        |
        <a href="${appUrl}/settings" class="footer-link">Settings</a>
      </div>

      <p style="margin: 20px 0; font-size: 13px; color: #6B7280;">
        © ${new Date().getFullYear()} GoogleRanker. All rights reserved.
      </p>

      <p style="color: #9CA3AF; font-size: 12px;">
        You're receiving this daily report because you have an active GoogleRanker account.<br>
        <a href="${appUrl}/settings" style="color: #9CA3AF; text-decoration: underline;">Manage email preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

const text = `
GoogleRanker Daily Activity Report - ${today}

Hi ${userName}!

Your Google Business Profile is being optimized automatically. GoogleRanker is working around the clock to boost your local search rankings and engage with your customers.

Today's Activity Summary:
- Posts Published: ${postsCreated}
- Reviews Responded: ${reviewsReplied}
- Active Locations: ${locations}

What GoogleRanker Did Today:
✓ Auto-Posted ${postsCreated} engaging posts to your Google Business Profile
✓ AI-Replied to ${reviewsReplied} customer reviews automatically
✓ Monitored your profile for new reviews and insights
✓ Optimized your local SEO presence on Google Search

View your dashboard: ${appUrl}/dashboard

© ${new Date().getFullYear()} GoogleRanker. All rights reserved.
`;

async function sendEmail() {
  try {
    console.log(`To: ${toEmail}`);
    console.log(`Subject: 📊 Daily Activity Report - ${today}`);
    console.log('');
    console.log('Sending email...\n');

    const result = await transporter.sendMail({
      from: `${process.env.GMAIL_FROM_NAME || 'GoogleRanker'} <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: `📊 Daily Activity Report - ${today}`,
      html,
      text
    });

    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log('');
    console.log('========================================');
    console.log('✅ DAILY REPORT SENT');
    console.log('========================================');
    console.log(`\nCheck inbox: ${toEmail}`);

  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    process.exit(1);
  }
}

sendEmail();
