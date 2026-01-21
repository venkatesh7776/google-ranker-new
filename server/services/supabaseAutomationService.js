/**
 * Supabase Automation Service
 * Uses NEW SCHEMA with gmail_id as primary identifier
 * Tables: users, user_locations
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

class SupabaseAutomationService {
  constructor() {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[SupabaseAutomationService] ❌ Missing Supabase configuration');
    }
    this.client = createClient(supabaseUrl, supabaseServiceKey);
    console.log('[SupabaseAutomationService] ✅ Initialized with new schema (gmail_id)');
  }

  /**
   * Save automation settings for a location
   * @param {string} gmailId - User's Gmail (PRIMARY KEY)
   * @param {string} locationId - GBP Location ID
   * @param {object} settings - Automation settings
   */
  async saveSettings(gmailId, locationId, settings) {
    try {
      console.log(`[SupabaseAutomationService] 💾 Saving settings for ${gmailId}, location: ${locationId}`);
      console.log(`[SupabaseAutomationService] 📋 Full settings:`, JSON.stringify(settings, null, 2));

      const upsertData = {
        gmail_id: gmailId,
        location_id: locationId,
        updated_at: new Date().toISOString()
      };

      // Map settings to database columns
      if (settings.businessName !== undefined) upsertData.business_name = settings.businessName;
      if (settings.address !== undefined) upsertData.address = settings.address;
      if (settings.category !== undefined) upsertData.category = settings.category;
      if (settings.keywords !== undefined) upsertData.keywords = settings.keywords;

      // Auto-posting settings
      if (settings.autoPosting) {
        console.log(`[SupabaseAutomationService] 🔍 autoPosting settings:`, {
          enabled: settings.autoPosting.enabled,
          schedule: settings.autoPosting.schedule,
          frequency: settings.autoPosting.frequency,
          timezone: settings.autoPosting.timezone
        });

        upsertData.autoposting_enabled = settings.autoPosting.enabled || false;
        if (settings.autoPosting.schedule) upsertData.autoposting_schedule = settings.autoPosting.schedule;
        if (settings.autoPosting.frequency) upsertData.autoposting_frequency = settings.autoPosting.frequency;
        if (settings.autoPosting.timezone) upsertData.autoposting_timezone = settings.autoPosting.timezone;
        if (settings.autoPosting.keywords) upsertData.keywords = settings.autoPosting.keywords;
        if (settings.autoPosting.businessName) upsertData.business_name = settings.autoPosting.businessName;

        // Calculate and save next_post_date when enabling
        if (settings.autoPosting.enabled && settings.autoPosting.schedule && settings.autoPosting.frequency) {
          console.log(`[SupabaseAutomationService] ⏰ Calculating next_post_date...`);
          const nextPostDate = this.calculateNextPostDate(
            settings.autoPosting.schedule,
            settings.autoPosting.frequency,
            settings.autoPosting.timezone || 'Asia/Kolkata'
          );
          console.log(`[SupabaseAutomationService] ⏰ Calculated next_post_date: ${nextPostDate}`);
          if (nextPostDate) {
            upsertData.next_post_date = nextPostDate;
          }
        } else {
          console.log(`[SupabaseAutomationService] ⚠️ NOT calculating next_post_date - missing data:`, {
            enabled: settings.autoPosting.enabled,
            schedule: settings.autoPosting.schedule,
            frequency: settings.autoPosting.frequency
          });
        }
      }
      if (settings.enabled !== undefined) upsertData.autoposting_enabled = settings.enabled;

      // Auto-reply settings - ENABLED BY DEFAULT for new locations
      if (settings.autoReply) {
        upsertData.autoreply_enabled = settings.autoReply.enabled !== undefined ? settings.autoReply.enabled : true;
      } else if (settings.autoReplyEnabled !== undefined) {
        upsertData.autoreply_enabled = settings.autoReplyEnabled;
      } else {
        // Check if this is a new location - if so, enable auto-reply by default
        const existing = await this.getSettings(gmailId, locationId);
        if (!existing) {
          console.log(`[SupabaseAutomationService] 🆕 New location ${locationId} - enabling auto-reply by DEFAULT`);
          upsertData.autoreply_enabled = true;
        }
      }

      // Update status
      if (upsertData.autoposting_enabled) upsertData.autoposting_status = 'active';
      if (upsertData.autoreply_enabled) upsertData.autoreply_status = 'active';

      console.log(`[SupabaseAutomationService] 📝 Upserting data:`, upsertData);

      const { data, error } = await this.client
        .from('user_locations')
        .upsert(upsertData, { onConflict: 'gmail_id,location_id' })
        .select()
        .single();

      if (error) throw error;

      console.log(`[SupabaseAutomationService] ✅ Settings saved for location: ${locationId}`);
      console.log(`[SupabaseAutomationService] 📊 Saved data from DB:`, data);

      // Return the saved settings with next_post_date
      return {
        ...settings,
        nextPostDate: data?.next_post_date || upsertData.next_post_date || null
      };
    } catch (error) {
      console.error('[SupabaseAutomationService] Error saving settings:', error);
      throw error;
    }
  }

  /**
   * Get automation settings for a location
   */
  async getSettings(gmailId, locationId) {
    try {
      const { data, error } = await this.client
        .from('user_locations')
        .select('*')
        .eq('gmail_id', gmailId)
        .eq('location_id', locationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.formatSettings(data);
    } catch (error) {
      console.error('[SupabaseAutomationService] Error getting settings:', error);
      return null;
    }
  }

  /**
   * Get all settings for a user
   */
  async getAllSettingsForUser(gmailId) {
    try {
      const { data, error } = await this.client
        .from('user_locations')
        .select('*')
        .eq('gmail_id', gmailId);

      if (error) throw error;
      return (data || []).map(s => this.formatSettings(s));
    } catch (error) {
      console.error('[SupabaseAutomationService] Error getting all settings:', error);
      return [];
    }
  }

  /**
   * Get all enabled automations (for scheduler)
   * Joins with users table to get tokens
   */
  async getAllEnabledAutomations() {
    try {
      const { data, error } = await this.client
        .from('user_locations')
        .select(`
          *,
          users!inner (
            gmail_id,
            google_access_token,
            google_refresh_token,
            google_token_expiry,
            google_account_id,
            subscription_status,
            has_valid_token,
            is_admin
          )
        `)
        .or('autoposting_enabled.eq.true,autoreply_enabled.eq.true');

      if (error) throw error;

      console.log(`[SupabaseAutomationService] 📊 Found ${(data || []).length} locations with automation enabled`);

      // Log each location's status for debugging
      for (const loc of (data || [])) {
        const status = (loc.users?.subscription_status || '').trim().toLowerCase();
        const hasToken = loc.users?.has_valid_token;
        // 'none' and '' are allowed - subscriptionGuard will auto-grant trial
        const isValid = ['active', 'trial', 'admin', 'none', ''].includes(status) && hasToken;

        console.log(`[SupabaseAutomationService] 📍 Location ${loc.location_id}:`);
        console.log(`   - Business: ${loc.business_name || 'Unknown'}`);
        console.log(`   - User: ${loc.gmail_id}`);
        console.log(`   - Subscription: ${status || 'NONE'} ${status === 'none' || status === '' ? '(will get auto-trial)' : ''}`);
        console.log(`   - Has Token: ${hasToken}`);
        console.log(`   - AutoReply Enabled: ${loc.autoreply_enabled}`);
        console.log(`   - Will be monitored: ${isValid ? '✅ YES' : '❌ NO'}`);

        if (!isValid) {
          if (!hasToken) {
            console.log(`   ⚠️ BLOCKED: User needs to reconnect Google Business Profile`);
          }
          if (!['active', 'trial', 'admin', 'none', ''].includes(status)) {
            console.log(`   ⚠️ BLOCKED: Invalid subscription status (${status})`);
          }
        }
      }

      // Filter valid subscriptions - ALSO allow 'none' or empty status
      // (subscriptionGuard will auto-grant trial for these users)
      const validData = (data || []).filter(loc => {
        const status = (loc.users?.subscription_status || '').trim().toLowerCase();
        const hasToken = loc.users?.has_valid_token;

        // Allow: active, trial, admin, OR 'none'/empty (will get auto-trial)
        const statusAllowed = ['active', 'trial', 'admin', 'none', ''].includes(status);

        if (statusAllowed && hasToken) {
          return true;
        }

        // Log why location was excluded
        if (!hasToken) {
          console.log(`[SupabaseAutomationService] ⏭️ Skipping ${loc.location_id} - no valid token`);
        } else if (!statusAllowed) {
          console.log(`[SupabaseAutomationService] ⏭️ Skipping ${loc.location_id} - status '${status}' not allowed`);
        }

        return false;
      });

      console.log(`[SupabaseAutomationService] ✅ ${validData.length} locations passed validation and will be monitored`);

      return validData.map(s => this.formatSettings(s));
    } catch (error) {
      console.error('[SupabaseAutomationService] Error getting enabled automations:', error);
      return [];
    }
  }

  /**
   * Get all autoposting enabled locations
   */
  async getAutopostingLocations() {
    try {
      const { data, error } = await this.client
        .from('user_locations')
        .select(`
          *,
          users!inner (
            gmail_id,
            google_access_token,
            google_refresh_token,
            google_token_expiry,
            google_account_id,
            subscription_status,
            has_valid_token
          )
        `)
        .eq('autoposting_enabled', true);

      if (error) throw error;

      return (data || []).filter(loc => {
        const status = (loc.users?.subscription_status || '').trim();
        return ['active', 'trial', 'admin'].includes(status) && loc.users?.has_valid_token;
      }).map(s => this.formatSettings(s));
    } catch (error) {
      console.error('[SupabaseAutomationService] Error getting autoposting locations:', error);
      return [];
    }
  }

  /**
   * Get all autoreply enabled locations
   */
  async getAutoreplyLocations() {
    try {
      const { data, error } = await this.client
        .from('user_locations')
        .select(`
          *,
          users!inner (
            gmail_id,
            google_access_token,
            google_refresh_token,
            google_token_expiry,
            google_account_id,
            subscription_status,
            has_valid_token
          )
        `)
        .eq('autoreply_enabled', true);

      if (error) throw error;

      return (data || []).filter(loc => {
        const status = (loc.users?.subscription_status || '').trim();
        return ['active', 'trial', 'admin'].includes(status) && loc.users?.has_valid_token;
      }).map(s => this.formatSettings(s));
    } catch (error) {
      console.error('[SupabaseAutomationService] Error getting autoreply locations:', error);
      return [];
    }
  }

  /**
   * Update post result
   */
  async updatePostResult(gmailId, locationId, success, errorMsg = null) {
    try {
      const updateData = {
        last_post_date: new Date().toISOString(),
        last_post_success: success,
        updated_at: new Date().toISOString()
      };

      if (success) {
        updateData.last_post_error = null;
        // Increment total posts
        const { data: current } = await this.client
          .from('user_locations')
          .select('total_posts_created')
          .eq('gmail_id', gmailId)
          .eq('location_id', locationId)
          .single();
        updateData.total_posts_created = (current?.total_posts_created || 0) + 1;
      } else {
        updateData.last_post_error = errorMsg;
      }

      const { error } = await this.client
        .from('user_locations')
        .update(updateData)
        .eq('gmail_id', gmailId)
        .eq('location_id', locationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[SupabaseAutomationService] Error updating post result:', error);
      return false;
    }
  }

  /**
   * Calculate next post date based on schedule and frequency
   * IMPORTANT: Schedule is in IST (e.g., "17:10")
   * Stored in database as UTC (e.g., 17:10 IST = 11:40 UTC)
   * Based on working whitelabeled version
   */
  calculateNextPostDate(schedule, frequency, timezone = 'Asia/Kolkata', lastRun = null) {
    try {
      const [scheduleHours, scheduleMinutes] = schedule.split(':').map(Number);
      const now = new Date();

      // IST offset: +5:30 from UTC
      const IST_OFFSET_HOURS = 5;
      const IST_OFFSET_MINUTES = 30;

      console.log(`[SupabaseAutomationService] 🕐 Calculating next post date:`);
      console.log(`  - Schedule: ${schedule} (${scheduleHours}:${scheduleMinutes}) IST`);
      console.log(`  - Frequency: ${frequency}`);
      console.log(`  - Current time (UTC): ${now.toISOString()}`);

      // Get current time in IST
      const nowIstHours = (now.getUTCHours() + IST_OFFSET_HOURS +
        Math.floor((now.getUTCMinutes() + IST_OFFSET_MINUTES) / 60)) % 24;
      const nowIstMinutes = (now.getUTCMinutes() + IST_OFFSET_MINUTES) % 60;
      const nowTotalMinutes = nowIstHours * 60 + nowIstMinutes;
      const scheduleTotalMinutes = scheduleHours * 60 + scheduleMinutes;

      console.log(`  - Current IST time: ${nowIstHours}:${nowIstMinutes.toString().padStart(2, '0')}`);

      // Check if scheduled time has passed today (in IST)
      const scheduledTimePassed = nowTotalMinutes >= scheduleTotalMinutes;
      console.log(`  - Scheduled time passed today? ${scheduledTimePassed}`);

      // Calculate days to add based on frequency
      let daysToAdd = 0;
      if (scheduledTimePassed) {
        switch (frequency) {
          case 'daily':
            daysToAdd = 1;
            break;
          case 'alternative':
            daysToAdd = 2;
            break;
          case 'weekly':
            daysToAdd = 7;
            break;
          default:
            daysToAdd = 1;
        }
      }

      // Create target date starting from today
      const targetDate = new Date(now);
      targetDate.setUTCDate(targetDate.getUTCDate() + daysToAdd);

      // Convert IST schedule time to UTC: UTC = IST - 5:30
      let targetUtcHours = scheduleHours - IST_OFFSET_HOURS;
      let targetUtcMinutes = scheduleMinutes - IST_OFFSET_MINUTES;

      // Handle underflow (e.g., 00:10 IST = 18:40 UTC previous day)
      if (targetUtcMinutes < 0) {
        targetUtcMinutes += 60;
        targetUtcHours -= 1;
      }
      if (targetUtcHours < 0) {
        targetUtcHours += 24;
        targetDate.setUTCDate(targetDate.getUTCDate() - 1);
      }

      targetDate.setUTCHours(targetUtcHours, targetUtcMinutes, 0, 0);

      console.log(`  - Days to add: ${daysToAdd}`);
      console.log(`  - Target UTC hours: ${targetUtcHours}:${targetUtcMinutes}`);
      console.log(`  - Final next post (UTC): ${targetDate.toISOString()}`);
      console.log(`  - Final next post (IST): ${scheduleHours}:${scheduleMinutes.toString().padStart(2, '0')}`);

      // Special case: test mode
      if (frequency === 'test30s') {
        const testDate = new Date(now.getTime() + 30 * 1000);
        console.log(`  - Test mode: next post in 30 seconds`);
        return testDate.toISOString();
      }

      return targetDate.toISOString();
    } catch (error) {
      console.error('[SupabaseAutomationService] Error calculating next post date:', error);
      return null;
    }
  }

  /**
   * Format settings from database to API format
   */
  formatSettings(data) {
    if (!data) return null;

    const formatted = {
      gmailId: data.gmail_id,
      userId: data.gmail_id, // Alias for compatibility
      locationId: data.location_id,
      businessName: data.business_name,
      address: data.address,
      category: data.category,
      keywords: data.keywords,
      enabled: data.autoposting_enabled,
      autoPosting: {
        enabled: data.autoposting_enabled,
        schedule: data.autoposting_schedule,
        frequency: data.autoposting_frequency,
        timezone: data.autoposting_timezone,
        keywords: data.keywords
      },
      autoReply: {
        enabled: data.autoreply_enabled
      },
      autoReplyEnabled: data.autoreply_enabled,
      autopostingStatus: data.autoposting_status,
      autoreplyStatus: data.autoreply_status,
      lastPostDate: data.last_post_date,
      lastPostSuccess: data.last_post_success,
      lastPostError: data.last_post_error,
      nextPostDate: data.next_post_date,
      totalPostsCreated: data.total_posts_created,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    // Include user data if joined
    if (data.users) {
      formatted.accessToken = data.users.google_access_token;
      formatted.refreshToken = data.users.google_refresh_token;
      formatted.tokenExpiry = data.users.google_token_expiry;
      formatted.accountId = data.users.google_account_id;
      formatted.subscriptionStatus = data.users.subscription_status;
      formatted.hasValidToken = data.users.has_valid_token;
    }

    // Log if accountId is missing - will be fetched from GBP API at runtime
    if (!formatted.accountId) {
      console.log(`[SupabaseAutomationService] ⚠️ accountId missing for ${formatted.gmailId} - will be fetched from GBP API at runtime`);
    }

    return formatted;
  }

  /**
   * Update only the next_post_date field in the database
   * Used when recalculating after the scheduled time has passed
   */
  async updateNextPostDate(gmailId, locationId, nextPostDate) {
    try {
      if (!this.client) {
        console.error('[SupabaseAutomationService] Client not initialized');
        return false;
      }

      console.log(`[SupabaseAutomationService] Updating next_post_date for ${gmailId}, location ${locationId}`);
      console.log(`[SupabaseAutomationService] New next_post_date: ${nextPostDate}`);

      const { error } = await this.client
        .from('user_locations')
        .update({
          next_post_date: nextPostDate,
          updated_at: new Date().toISOString()
        })
        .eq('gmail_id', gmailId)
        .eq('location_id', locationId);

      if (error) {
        console.error('[SupabaseAutomationService] Error updating next_post_date:', error);
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all locations for a user (by gmail_id)
   * Used to disable all automations on logout/disconnect
   */
  async getLocationsForUser(gmailId) {
    try {
      const { data, error } = await this.client
        .from('user_locations')
        .select('location_id, business_name, autoposting_enabled, autoreply_enabled')
        .eq('gmail_id', gmailId);

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Log automation activity to automation_logs table
   * Used for tracking posts created, reviews replied, etc.
   * @param {string} userId - User's Gmail ID or user ID
   * @param {string} locationId - GBP Location ID
   * @param {string} actionType - Type of action: 'post_created', 'post_failed', 'review_replied', 'reply_failed'
   * @param {string|null} reviewId - Review ID (for review-related actions)
   * @param {string} status - 'success' or 'failed'
   * @param {object} details - Additional details as JSON
   * @param {string|null} errorMessage - Error message if failed
   */
  async logActivity(userId, locationId, actionType, reviewId = null, status = 'success', details = {}, errorMessage = null) {
    try {
      console.log(`[SupabaseAutomationService] 📝 Logging activity: ${actionType} for ${userId}, location: ${locationId}`);

      const logEntry = {
        user_id: userId,
        location_id: locationId,
        action_type: actionType,
        review_id: reviewId,
        status: status,
        details: details,
        error_message: errorMessage,
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.client
        .from('automation_logs')
        .insert(logEntry)
        .select()
        .single();

      if (error) {
        console.error('[SupabaseAutomationService] ❌ Error logging activity:', error);
        return false;
      }

      console.log(`[SupabaseAutomationService] ✅ Activity logged: ${actionType} (ID: ${data?.id})`);
      return true;
    } catch (error) {
      console.error('[SupabaseAutomationService] ❌ Exception logging activity:', error);
      return false;
    }
  }
}

const supabaseAutomationService = new SupabaseAutomationService();
export default supabaseAutomationService;
