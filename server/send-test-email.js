import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local explicitly
dotenv.config({ path: path.join(__dirname, '.env.local') });

import gmailService from './services/gmailService.js';

const toEmail = process.argv[2] || 'jobspring.help@gmail.com';

console.log('========================================');
console.log('📧 SENDING TEST EMAIL');
console.log('========================================\n');

console.log('Configuration:');
console.log(`   Gmail User: ${process.env.GMAIL_USER}`);
console.log(`   Gmail From Name: ${process.env.GMAIL_FROM_NAME || 'GoogleRanker'}`);
console.log(`   App Password: ${process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Not set'}`);
console.log(`   To: ${toEmail}`);
console.log('');

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.error('❌ Gmail credentials not set!');
  process.exit(1);
}

async function sendTestEmail() {
  try {
    // Re-initialize gmail service with loaded env
    const nodemailer = (await import('nodemailer')).default;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    console.log('📧 Sending test email...\n');

    const result = await transporter.sendMail({
      from: `${process.env.GMAIL_FROM_NAME || 'GoogleRanker'} <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: '✅ GoogleRanker Email Test - System Working!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f3f4f6; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1E2DCD 0%, #4F46E5 100%); padding: 40px; text-align: center; color: white; }
            .logo { font-size: 32px; font-weight: bold; margin: 0; }
            .content { padding: 40px; }
            .success { background: #10B981; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .footer { background: #F9FAFB; padding: 30px; text-align: center; color: #6B7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">GoogleRanker</h1>
              <p>Google Business Profile Automation</p>
            </div>
            <div class="content">
              <div class="success">
                <h2>✅ Email System Working!</h2>
              </div>
              <p>This is a test email from GoogleRanker.</p>
              <p>Your email service is now configured and ready to send:</p>
              <ul>
                <li>Daily activity reports</li>
                <li>Trial reminder emails</li>
                <li>Welcome emails</li>
                <li>System notifications</li>
              </ul>
              <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">
                Sent at: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST
              </p>
            </div>
            <div class="footer">
              <p><strong>GoogleRanker - Google Business Profile Automation</strong></p>
              <p>© 2025 GoogleRanker. All rights reserved.</p>
              <p>www.googleranker.io</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: 'This is a test email from GoogleRanker. Your email service is working!'
    });

    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log('');
    console.log('========================================');
    console.log('✅ TEST COMPLETED');
    console.log('========================================');
    console.log(`\nCheck inbox: ${toEmail}`);

  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    process.exit(1);
  }
}

sendTestEmail();
