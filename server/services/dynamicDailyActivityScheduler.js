import cron from 'node-cron';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import newDailyActivityEmailService from './newDailyActivityEmailService.js';
import supabaseSubscriptionService from './supabaseSubscriptionService.js';
import supabaseAuditService from './supabaseAuditService.js';
import supabaseTokenStorage from './supabaseTokenStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client directly for reliable data access
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Dynamic Daily Activity Scheduler
 * Sends emails with real database data:
 * - Daily emails for trial users
 * - Weekly emails for subscribed users
 * - Fetches real activity data, audit data, and subscription status
 */
class DynamicDailyActivityScheduler {
  constructor() {
    this.scheduledJobs = [];
    this.emailTracking = new Map(); // Track last email sent time for each user

    console.log('[DynamicDailyActivityScheduler] Initializing...');
  }

  /**
   * Calculate trial days remaining
   */
  calculateTrialDaysRemaining(trialEndDate) {
    if (!trialEndDate) return 0;

    const now = new Date();
    const endDate = new Date(trialEndDate);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  /**
   * Check if user is in trial period
   */
  isUserInTrial(subscription) {
    if (subscription.status !== 'trial') return false;

    const trialEndDate = new Date(subscription.trial_end_date || subscription.trialEndDate);
    const now = new Date();

    return now < trialEndDate;
  }

  /**
   * Check if trial is expired
   */
  isTrialExpired(subscription) {
    if (subscription.status !== 'trial') return false;

    const trialEndDate = new Date(subscription.trial_end_date || subscription.trialEndDate);
    const now = new Date();

    return now >= trialEndDate;
  }

  /**
   * Get user activity data from Supabase
   * Checks both automation_logs AND automation_post_history/automation_reply_history tables
   */
  async getUserActivityData(userId, timeframe = 'today') {
    try {
      await supabaseAuditService.initialize();

      const now = new Date();
      let startDate;

      if (timeframe === 'today') {
        startDate = new Date(now.setHours(0, 0, 0, 0));
      } else if (timeframe === 'week') {
        startDate = new Date(now.setDate(now.getDate() - 7));
      }

      let postsCreated = [];
      let reviewsReplied = [];

      // Try automation_logs table first
      const { data: postsData, error: postsError } = await supabaseAuditService.client
        .from('automation_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('action_type', 'post_created')
        .eq('status', 'success')
        .gte('created_at', startDate.toISOString());

      if (!postsError && postsData && postsData.length > 0) {
        postsCreated = postsData.map(log => ({
          postId: log.details?.postId || '',
          content: log.details?.content || '',
          timestamp: log.created_at,
          locationId: log.location_id
        }));
      }

      // If no posts in automation_logs, try automation_post_history table
      if (postsCreated.length === 0) {
        const { data: postHistoryData, error: postHistoryError } = await supabaseAuditService.client
          .from('automation_post_history')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'success')
          .gte('created_at', startDate.toISOString());

        if (!postHistoryError && postHistoryData) {
          postsCreated = postHistoryData.map(log => ({
            postId: log.id || '',
            content: log.post_content || log.post_summary || '',
            timestamp: log.created_at,
            locationId: log.location_id
          }));
        }
      }

      // Try automation_logs for reviews
      const { data: reviewsData, error: reviewsError } = await supabaseAuditService.client
        .from('automation_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('action_type', 'review_replied')
        .eq('status', 'success')
        .gte('created_at', startDate.toISOString());

      if (!reviewsError && reviewsData && reviewsData.length > 0) {
        reviewsReplied = reviewsData.map(log => ({
          reviewId: log.review_id || log.details?.reviewId || '',
          replyText: log.details?.replyText || '',
          rating: log.details?.rating || 0,
          timestamp: log.created_at,
          locationId: log.location_id
        }));
      }

      // If no reviews in automation_logs, try automation_reply_history table
      if (reviewsReplied.length === 0) {
        const { data: replyHistoryData, error: replyHistoryError } = await supabaseAuditService.client
          .from('automation_reply_history')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'success')
          .gte('created_at', startDate.toISOString());

        if (!replyHistoryError && replyHistoryData) {
          reviewsReplied = replyHistoryData.map(log => ({
            reviewId: log.review_id || '',
            replyText: log.reply_content || '',
            rating: log.review_rating || 0,
            timestamp: log.created_at,
            locationId: log.location_id
          }));
        }
      }

      console.log(`[DynamicDailyActivityScheduler] 📊 Fetched activity for ${userId}:`, {
        postsCreated: postsCreated.length,
        reviewsReplied: reviewsReplied.length,
        timeframe
      });

      return {
        postsCreated,
        reviewsReplied,
        locations: [] // This gets filled later with getUserLocationsCount
      };
    } catch (error) {
      console.error('[DynamicDailyActivityScheduler] Error fetching activity data from Supabase:', error);
      return {
        postsCreated: [],
        reviewsReplied: [],
        locations: []
      };
    }
  }

  /**
   * Get latest audit data for user
   */
  async getUserAuditData(userId) {
    try {
      await supabaseAuditService.initialize();

      // Get the most recent audit result for this user
      const { data, error } = await supabaseAuditService.client
        .from('audit_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.log(`[DynamicDailyActivityScheduler] No audit data found for user ${userId}`);
        return null;
      }

      // Parse audit data
      const auditData = data.audit_data || {};

      return {
        googleSearchRank: auditData.googleSearchRank || auditData.searchRank || 5,
        profileCompletion: auditData.profileCompletion || 67,
        seoScore: auditData.seoScore || 100,
        reviewReplyScore: auditData.reviewReplyScore || 100
      };
    } catch (error) {
      console.error('[DynamicDailyActivityScheduler] Error fetching audit data:', error);
      return null;
    }
  }

  /**
   * Get user's connected locations count
   */
  async getUserLocationsCount(gbpAccountId) {
    try {
      // Query user's connected GBP locations
      const tokens = await supabaseTokenStorage.getTokens(gbpAccountId);

      if (!tokens || !tokens.length) {
        return 1; // Default to 1 if no tokens found
      }

      // You could also query the actual locations from GBP API here
      return tokens.length;
    } catch (error) {
      console.error('[DynamicDailyActivityScheduler] Error getting locations count:', error);
      return 1;
    }
  }

  /**
   * Check if email should be sent based on frequency
   * UPDATED: Send to ALL users daily (trial AND subscribed) at 6 PM
   */
  shouldSendEmail(subscription) {
    const userId = subscription.user_id || subscription.userId;
    const status = subscription.status;
    const lastSent = this.emailTracking.get(userId);

    const now = new Date();

    // 🔧 FIX: Send to EVERYONE daily at 6 PM (trial AND subscribed users)
    // Check if already sent TODAY (not 24 hours ago)
    if (!lastSent) {
      return true; // Never sent before - send now
    }

    // Check if already sent today
    const today = now.toDateString();
    const lastSentDate = new Date(lastSent).toDateString();

    // If not sent today, send now
    if (today !== lastSentDate) {
      return true;
    }

    // Already sent today - skip
    console.log(`[DynamicDailyActivityScheduler] ⏭️ Already sent today to ${subscription.email}`);
    return false;
  }

  /**
   * Send daily activity email for a single user
   * Updated to use user_locations table for real data
   */
  async sendUserDailyReport(subscription) {
    try {
      const userId = subscription.user_id || subscription.userId;
      const email = subscription.email;
      const status = (subscription.status || 'trial').trim();

      console.log(`[DynamicDailyActivityScheduler] 📧 Processing ${email} (Status: ${status})`);

      // Get real activity data from user_locations table
      const activityData = await this.getUserActivityFromLocations(email);

      // Determine subscription status
      let isTrialUser = false;
      let isExpiredTrial = false;
      let isSubscribed = false;
      let daysRemaining = 0;

      if (status === 'trial' && subscription.trial_end_date) {
        const endDate = new Date(subscription.trial_end_date);
        daysRemaining = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));

        if (daysRemaining > 0) {
          isTrialUser = true;
        } else {
          isExpiredTrial = true;
          daysRemaining = 0;
        }
      } else if (status === 'expired') {
        isExpiredTrial = true;
      } else if (status === 'active' || status === 'admin') {
        isSubscribed = true;
      }

      // Get user name (from display_name or business name or email)
      const userName = subscription.display_name || activityData.businessName || email.split('@')[0];

      console.log(`[DynamicDailyActivityScheduler] 📊 ${email}:`, {
        status,
        isTrialUser,
        isExpiredTrial,
        isSubscribed,
        daysRemaining,
        postsCount: activityData.postsCount,
        locationsCount: activityData.locationsCount,
        banner: isExpiredTrial ? '🔴 EXPIRED' : isTrialUser ? '🟡 TRIAL' : '✅ SUBSCRIBED'
      });

      // Prepare user data for email template
      const userData = {
        userName: userName,
        userEmail: email,
        isTrialUser: isTrialUser,
        trialDaysRemaining: daysRemaining,
        isTrialExpired: isExpiredTrial
      };

      // Format activity data for email service
      const formattedActivityData = {
        postsCreated: Array(activityData.postsCount).fill({ postId: '', content: '', timestamp: new Date() }),
        reviewsReplied: Array(activityData.reviewsCount).fill({ reviewId: '', replyText: '', rating: 5 }),
        locations: Array(activityData.locationsCount).fill({ id: 'location', name: 'Location' })
      };

      // Send email using the email service
      const result = await newDailyActivityEmailService.sendDailyReport(
        email,
        userData,
        formattedActivityData,
        null // No audit data for now
      );

      if (result.success) {
        this.emailTracking.set(userId, new Date());
        console.log(`[DynamicDailyActivityScheduler] ✅ Email sent to ${email}`);
      } else {
        console.error(`[DynamicDailyActivityScheduler] ❌ Failed: ${email} - ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error(`[DynamicDailyActivityScheduler] ❌ Exception for ${subscription.email}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all users from the users table (PRIMARY SOURCE)
   * This is more reliable than subscriptions table
   */
  async getAllUsersFromDatabase() {
    try {
      if (!supabase) {
        console.error('[DynamicDailyActivityScheduler] ❌ Supabase not initialized');
        return [];
      }

      // Get all users from users table
      const { data: users, error } = await supabase
        .from('users')
        .select('gmail_id, display_name, subscription_status, trial_start_date, trial_end_date')
        .not('gmail_id', 'is', null);

      if (error) {
        console.error('[DynamicDailyActivityScheduler] ❌ Error fetching users:', error);
        return [];
      }

      console.log(`[DynamicDailyActivityScheduler] 📋 Found ${users?.length || 0} users in database`);

      // Format users to match subscription format
      return (users || []).map(user => ({
        user_id: user.gmail_id,
        email: user.gmail_id,
        status: (user.subscription_status || 'trial').trim(),
        trial_start_date: user.trial_start_date,
        trial_end_date: user.trial_end_date,
        display_name: user.display_name
      }));
    } catch (error) {
      console.error('[DynamicDailyActivityScheduler] ❌ Exception fetching users:', error);
      return [];
    }
  }

  /**
   * Get user activity data from user_locations table (PRIMARY SOURCE)
   * This is more reliable than automation_logs
   */
  async getUserActivityFromLocations(userEmail) {
    try {
      if (!supabase) return { postsCount: 0, reviewsCount: 0, locationsCount: 1, businessName: userEmail.split('@')[0] };

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const { data: userLocations, error } = await supabase
        .from('user_locations')
        .select('*')
        .eq('gmail_id', userEmail);

      if (error) {
        console.log(`[DynamicDailyActivityScheduler] ⚠️ Error fetching locations: ${error.message}`);
        return { postsCount: 0, reviewsCount: 0, locationsCount: 1, businessName: userEmail.split('@')[0] };
      }

      let postsCount = 0;
      let reviewsCount = 0;
      let locationsCount = userLocations?.length || 1;
      let totalPostsAllTime = 0;
      let businessName = userEmail.split('@')[0];

      if (userLocations && userLocations.length > 0) {
        for (const loc of userLocations) {
          totalPostsAllTime += loc.total_posts_created || 0;

          // Check if post was made today
          if (loc.last_post_date && loc.last_post_success) {
            const lastPost = new Date(loc.last_post_date);
            lastPost.setUTCHours(0, 0, 0, 0);
            if (lastPost.getTime() === today.getTime()) {
              postsCount++;
            }
          }

          // Get business name
          if (loc.business_name && loc.business_name !== 'Business') {
            businessName = loc.business_name;
          }
        }
      }

      return { postsCount, reviewsCount, locationsCount, totalPostsAllTime, businessName };
    } catch (error) {
      console.error('[DynamicDailyActivityScheduler] ❌ Exception fetching locations:', error);
      return { postsCount: 0, reviewsCount: 0, locationsCount: 1, businessName: userEmail.split('@')[0] };
    }
  }

  /**
   * Send emails to all users based on their subscription status
   */
  async sendAllDailyReports() {
    try {
      console.log('[DynamicDailyActivityScheduler] 🚀 Starting daily email batch...');
      console.log(`[DynamicDailyActivityScheduler] ⏰ Current time: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST`);

      // Load all users from users table (PRIMARY SOURCE)
      const users = await this.getAllUsersFromDatabase();

      // Fallback to subscriptions if users table is empty
      let subscriptions = users;
      if (!users || users.length === 0) {
        console.log('[DynamicDailyActivityScheduler] ⚠️ No users in users table, trying subscriptions...');
        subscriptions = await supabaseSubscriptionService.getAllSubscriptions();
      }

      console.log(`[DynamicDailyActivityScheduler] Found ${subscriptions.length} users to email`);

      const results = {
        total: subscriptions.length,
        sent: 0,
        skipped: 0,
        failed: 0,
        details: []
      };

      // Process each subscription
      for (const subscription of subscriptions) {
        const email = subscription.email;

        try {
          const result = await this.sendUserDailyReport(subscription);

          if (result.success) {
            results.sent++;
          } else if (result.reason) {
            results.skipped++;
          } else {
            results.failed++;
          }

          results.details.push({
            email: email,
            status: subscription.status,
            result: result.success ? 'sent' : (result.reason ? 'skipped' : 'failed'),
            reason: result.reason || result.error
          });

          // 🔧 Add 500ms delay between emails to avoid Gmail rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          console.error(`[DynamicDailyActivityScheduler] Error processing ${email}:`, error);
          results.failed++;
          results.details.push({
            email: email,
            status: subscription.status,
            result: 'failed',
            error: error.message
          });
        }
      }

      console.log('[DynamicDailyActivityScheduler] 📊 Batch completed:', {
        total: results.total,
        sent: results.sent,
        skipped: results.skipped,
        failed: results.failed
      });

      return results;
    } catch (error) {
      console.error('[DynamicDailyActivityScheduler] ❌ Error in batch send:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Start the scheduler
   * Runs daily at 6:00 PM
   */
  start() {
    console.log('[DynamicDailyActivityScheduler] 🚀 Starting scheduler...');

    // Schedule daily email batch at 6:00 PM every day
    const dailyJob = cron.schedule('0 18 * * *', async () => {
      console.log('[DynamicDailyActivityScheduler] ⏰ Running scheduled email batch (6:00 PM)');
      await this.sendAllDailyReports();
    }, {
      timezone: "Asia/Kolkata" // Adjust timezone as needed
    });

    this.scheduledJobs.push(dailyJob);

    console.log('[DynamicDailyActivityScheduler] ✅ Scheduler started successfully');
    console.log('[DynamicDailyActivityScheduler] 📅 ALL users will receive daily emails at 6:00 PM IST');
    console.log('[DynamicDailyActivityScheduler] 📧 Trial users: Show "Upgrade" button in email');
    console.log('[DynamicDailyActivityScheduler] 📧 Subscribed users: NO "Upgrade" button in email');
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    console.log('[DynamicDailyActivityScheduler] 🛑 Stopping scheduler...');

    this.scheduledJobs.forEach(job => job.stop());
    this.scheduledJobs = [];

    console.log('[DynamicDailyActivityScheduler] ✅ Scheduler stopped');
  }
}

export default new DynamicDailyActivityScheduler();
