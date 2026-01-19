import supabaseAutomationService from './supabaseAutomationService.js';
import { createClient } from '@supabase/supabase-js';

// Admin emails that bypass subscription checks
const ADMIN_EMAILS = [
  'digibusy01shakti@gmail.com',
  'admin@googleranker.io',
  'meenakarjale73@gmail.com'
];

/**
 * Subscription Guard Service
 * Enforces feature access based on subscription/trial status
 * Automatically disables features when trial/subscription expires
 * ADMINS BYPASS ALL CHECKS
 *
 * NEW SCHEMA: Uses `users` table with `subscription_status` field
 */
class SubscriptionGuard {
  constructor() {
    this.checkInterval = null;
    this.supabase = null;
    console.log('[SubscriptionGuard] Initializing subscription enforcement system...');
  }

  async getSupabaseClient() {
    if (!this.supabase) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
      }
    }
    return this.supabase;
  }

  /**
   * Check if user is admin (bypasses subscription checks)
   * NEW: Check via hardcoded admin list or users table is_admin field
   */
  async isAdmin(userId) {
    try {
      if (!userId) return false;

      // Check hardcoded admin list first (by email)
      if (ADMIN_EMAILS.includes(userId.toLowerCase())) {
        console.log(`[SubscriptionGuard] ✅ User ${userId} is ADMIN (hardcoded) - bypassing subscription checks`);
        return true;
      }

      // Check users table for is_admin flag
      const client = await this.getSupabaseClient();
      if (client) {
        const { data } = await client
          .from('users')
          .select('is_admin')
          .eq('gmail_id', userId)
          .single();

        if (data?.is_admin) {
          console.log(`[SubscriptionGuard] ✅ User ${userId} is ADMIN (database) - bypassing subscription checks`);
          return true;
        }
      }

      return false;
    } catch (error) {
      // Don't log error for normal users, just return false
      return false;
    }
  }

  /**
   * Get subscription status from users table
   * NEW SCHEMA: subscription_status is in users table, not separate subscriptions table
   */
  async getSubscriptionFromUsers(userId) {
    try {
      const client = await this.getSupabaseClient();
      if (!client) return null;

      const { data, error } = await client
        .from('users')
        .select('gmail_id, subscription_status, trial_end_date, subscription_end_date')
        .eq('gmail_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        userId: data.gmail_id,
        status: data.subscription_status || 'trial',
        trialEndDate: data.trial_end_date,
        subscriptionEndDate: data.subscription_end_date
      };
    } catch (error) {
      console.error('[SubscriptionGuard] Error getting subscription from users:', error.message);
      return null;
    }
  }

  /**
   * Check if user has valid access (trial or active subscription)
   * ADMINS ALWAYS HAVE ACCESS
   */
  async hasValidAccess(userId, gbpAccountId) {
    try {
      // 🔓 ADMIN CHECK - Admins bypass all subscription checks
      if (userId) {
        const isAdminUser = await this.isAdmin(userId);
        if (isAdminUser) {
          return {
            hasAccess: true,
            status: 'admin',
            daysRemaining: 999999,
            subscription: null,
            message: 'Admin access - unlimited'
          };
        }
      }

      // NEW: Get subscription from users table
      const subscription = await this.getSubscriptionFromUsers(userId);

      if (!subscription) {
        // No user record - allow access (new user gets trial)
        console.log(`[SubscriptionGuard] No user record for ${userId}, allowing access as trial`);
        return {
          hasAccess: true,
          status: 'trial',
          daysRemaining: 7,
          subscription: null,
          message: 'New user - trial access granted'
        };
      }

      const now = new Date();

      // Check if active subscription
      if (subscription.status === 'active') {
        const endDate = subscription.subscriptionEndDate ? new Date(subscription.subscriptionEndDate) : null;

        if (endDate && endDate > now) {
          const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
          return {
            hasAccess: true,
            status: 'active',
            daysRemaining,
            subscription,
            message: `Subscription active - ${daysRemaining} days remaining`
          };
        } else {
          // Subscription expired - disable features
          await this.disableAllFeatures(userId, gbpAccountId, 'subscription_expired');

          return {
            hasAccess: false,
            reason: 'subscription_expired',
            message: 'Your subscription has expired. Please renew to continue.',
            requiresPayment: true,
            subscription
          };
        }
      }

      // Check if in trial period
      if (subscription.status === 'trial') {
        const trialEndDate = subscription.trialEndDate ? new Date(subscription.trialEndDate) : null;

        // If trial_end_date is NULL, this is a new user - set up their trial now
        if (!trialEndDate) {
          console.log(`[SubscriptionGuard] User ${userId} has trial status but no end date - setting up 7-day trial`);

          try {
            const client = await this.getSupabaseClient();
            if (client) {
              const newTrialEndDate = new Date();
              newTrialEndDate.setDate(newTrialEndDate.getDate() + 7);

              await client
                .from('users')
                .update({ trial_end_date: newTrialEndDate.toISOString() })
                .eq('gmail_id', userId);

              console.log(`[SubscriptionGuard] ✅ Set trial_end_date to ${newTrialEndDate.toISOString()} for user ${userId}`);
            }
          } catch (updateError) {
            console.error(`[SubscriptionGuard] Failed to set trial end date:`, updateError.message);
          }

          return {
            hasAccess: true,
            status: 'trial',
            daysRemaining: 7,
            subscription,
            message: 'Free trial - 7 days remaining (just activated)'
          };
        }

        if (trialEndDate > now) {
          const daysRemaining = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));
          return {
            hasAccess: true,
            status: 'trial',
            daysRemaining,
            subscription,
            message: `Free trial - ${daysRemaining} days remaining`
          };
        } else {
          // Trial expired - disable features
          await this.disableAllFeatures(userId, gbpAccountId, 'trial_expired');

          return {
            hasAccess: false,
            reason: 'trial_expired',
            message: 'Your free trial has ended. Upgrade to continue using all features.',
            requiresPayment: true,
            subscription
          };
        }
      }

      // If status is 'none' or empty, grant trial access automatically
      // This ensures new users can use the platform without manual intervention
      if (!subscription.status || subscription.status === 'none' || subscription.status === '') {
        console.log(`[SubscriptionGuard] User ${userId} has no subscription status, granting automatic trial access`);

        // Auto-set trial for this user in database
        try {
          const client = await this.getSupabaseClient();
          if (client) {
            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 7); // 7-day trial

            await client
              .from('users')
              .update({
                subscription_status: 'trial',
                trial_end_date: trialEndDate.toISOString()
              })
              .eq('gmail_id', userId);

            console.log(`[SubscriptionGuard] ✅ Auto-created 7-day trial for user ${userId}`);
          }
        } catch (updateError) {
          console.error(`[SubscriptionGuard] Failed to auto-create trial:`, updateError.message);
        }

        return {
          hasAccess: true,
          status: 'trial',
          daysRemaining: 7,
          subscription,
          message: 'Automatic trial access granted'
        };
      }

      // Invalid status (not none, not trial, not active)
      return {
        hasAccess: false,
        reason: 'invalid_status',
        message: 'Subscription status invalid. Please contact support.',
        requiresPayment: true,
        subscription
      };

    } catch (error) {
      console.error('[SubscriptionGuard] Error checking access:', error);
      return {
        hasAccess: false,
        reason: 'error',
        message: 'Unable to verify subscription status',
        requiresPayment: false
      };
    }
  }

  /**
   * Disable all automation features for a user
   */
  async disableAllFeatures(userId, gbpAccountId, reason) {
    try {
      console.log(`[SubscriptionGuard] 🔒 Disabling all features for user ${userId} - Reason: ${reason}`);

      // Get all automation settings for this user
      const settings = await supabaseAutomationService.getAllSettingsForUser(userId);

      // Disable each automation
      for (const setting of settings) {
        await supabaseAutomationService.saveSettings(userId, setting.location_id, {
          ...setting.settings,
          enabled: false,
          autoPosting: {
            ...setting.settings?.autoPosting,
            enabled: false
          },
          autoReply: {
            ...setting.settings?.autoReply,
            enabled: false
          },
          autoReplyEnabled: false,
          disabledReason: reason,
          disabledAt: new Date().toISOString()
        });

        console.log(`[SubscriptionGuard] ✅ Disabled automation for location: ${setting.location_id}`);
      }

      // Log this action
      await supabaseAutomationService.logActivity(
        userId,
        'system',
        'features_disabled',
        null,
        'success',
        {
          reason,
          locationsAffected: settings.length,
          timestamp: new Date().toISOString()
        }
      );

      console.log(`[SubscriptionGuard] ✅ All features disabled for user ${userId}`);
      return true;
    } catch (error) {
      console.error('[SubscriptionGuard] Error disabling features:', error);
      return false;
    }
  }

  /**
   * Check if a specific feature is allowed
   */
  async canUseFeature(userId, gbpAccountId, featureName) {
    const access = await this.hasValidAccess(userId, gbpAccountId);

    if (!access.hasAccess) {
      console.log(`[SubscriptionGuard] ❌ Feature "${featureName}" blocked for user ${userId} - ${access.reason}`);
      return {
        allowed: false,
        reason: access.reason,
        message: access.message,
        requiresPayment: access.requiresPayment
      };
    }

    console.log(`[SubscriptionGuard] ✅ Feature "${featureName}" allowed for user ${userId}`);
    return {
      allowed: true,
      status: access.status,
      daysRemaining: access.daysRemaining
    };
  }

  /**
   * Start periodic subscription checks (runs every hour)
   */
  startPeriodicChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    console.log('[SubscriptionGuard] ⏰ Starting periodic subscription checks (every hour)');

    // Check all subscriptions every hour
    this.checkInterval = setInterval(async () => {
      console.log('[SubscriptionGuard] 🔍 Running periodic subscription check...');
      await this.checkAllSubscriptions();
    }, 60 * 60 * 1000); // 1 hour

    // Run initial check
    this.checkAllSubscriptions();
  }

  /**
   * Check all subscriptions and disable expired ones
   * NEW: Uses users table instead of subscriptions table
   */
  async checkAllSubscriptions() {
    try {
      const client = await this.getSupabaseClient();
      if (!client) {
        console.log('[SubscriptionGuard] No Supabase client, skipping check');
        return;
      }

      // Get all users with trial or active subscriptions from users table
      const { data: users, error } = await client
        .from('users')
        .select('gmail_id, subscription_status, trial_end_date, subscription_end_date')
        .in('subscription_status', ['trial', 'active']);

      if (error) {
        console.error('[SubscriptionGuard] Error fetching users:', error.message);
        return;
      }

      console.log(`[SubscriptionGuard] Checking ${users?.length || 0} subscriptions...`);

      const now = new Date();
      let expiredCount = 0;

      for (const user of (users || [])) {
        const userId = user.gmail_id;

        // Check if trial expired
        if (user.subscription_status === 'trial' && user.trial_end_date) {
          const trialEndDate = new Date(user.trial_end_date);
          if (trialEndDate <= now) {
            console.log(`[SubscriptionGuard] ⚠️ Trial expired for user ${userId}`);
            await this.disableAllFeatures(userId, null, 'trial_expired');
            // Update user status
            await client.from('users').update({ subscription_status: 'expired' }).eq('gmail_id', userId);
            expiredCount++;
          }
        }

        // Check if subscription expired
        if (user.subscription_status === 'active' && user.subscription_end_date) {
          const endDate = new Date(user.subscription_end_date);
          if (endDate <= now) {
            console.log(`[SubscriptionGuard] ⚠️ Subscription expired for user ${userId}`);
            await this.disableAllFeatures(userId, null, 'subscription_expired');
            // Update user status
            await client.from('users').update({ subscription_status: 'expired' }).eq('gmail_id', userId);
            expiredCount++;
          }
        }
      }

      console.log(`[SubscriptionGuard] ✅ Subscription check complete - ${expiredCount} expired`);
    } catch (error) {
      console.error('[SubscriptionGuard] Error checking subscriptions:', error);
    }
  }

  /**
   * Stop periodic checks
   */
  stopPeriodicChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('[SubscriptionGuard] ✅ Periodic checks stopped');
    }
  }

  /**
   * Validate before running automation
   */
  async validateBeforeAutomation(userId, gbpAccountId, automationType) {
    const access = await this.hasValidAccess(userId, gbpAccountId);

    if (!access.hasAccess) {
      console.error(`[SubscriptionGuard] ❌ Automation blocked: ${automationType} for user ${userId}`);
      console.error(`[SubscriptionGuard] Reason: ${access.message}`);

      // Ensure features are disabled
      await this.disableAllFeatures(userId, gbpAccountId, access.reason);

      return {
        allowed: false,
        reason: access.reason,
        message: access.message
      };
    }

    return {
      allowed: true,
      status: access.status,
      daysRemaining: access.daysRemaining
    };
  }
}

// Create singleton instance
const subscriptionGuard = new SubscriptionGuard();

export default subscriptionGuard;
