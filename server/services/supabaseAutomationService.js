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

      // Auto-reply settings
      if (settings.autoReply) {
        upsertData.autoreply_enabled = settings.autoReply.enabled || false;
      }
      if (settings.autoReplyEnabled !== undefined) upsertData.autoreply_enabled = settings.autoReplyEnabled;

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

      // Filter valid subscriptions
      const validData = (data || []).filter(loc => {
        const status = (loc.users?.subscription_status || '').trim();
        return ['active', 'trial', 'admin'].includes(status) && loc.users?.has_valid_token;
      });

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
   * IMPORTANT: If the scheduled time is in the future TODAY, it should be scheduled for TODAY
   */
  calculateNextPostDate(schedule, frequency, timezone = 'Asia/Kolkata') {
    try {
      const [hour, minute] = schedule.split(':').map(Number);
      const now = new Date();

      console.log(`[SupabaseAutomationService] 🕐 Calculating next post date:`);
      console.log(`  - Schedule: ${schedule} (${hour}:${minute})`);
      console.log(`  - Frequency: ${frequency}`);
      console.log(`  - Current time: ${now.toISOString()}`);

      // Create date for the scheduled time TODAY
      let nextPost = new Date();
      nextPost.setHours(hour, minute, 0, 0);

      console.log(`  - Scheduled time today would be: ${nextPost.toISOString()}`);
      console.log(`  - Is scheduled time in the future? ${nextPost > now}`);

      switch (frequency) {
        case 'test30s':
          // Test mode: 30 seconds from now
          nextPost = new Date(now.getTime() + 30 * 1000);
          console.log(`  - Test mode: next post in 30 seconds`);
          break;
        case 'daily':
          // If scheduled time today has already passed, schedule for tomorrow
          // Otherwise, schedule for today
          if (nextPost <= now) {
            nextPost.setDate(nextPost.getDate() + 1);
            console.log(`  - Daily: Time passed today, scheduling for tomorrow`);
          } else {
            console.log(`  - Daily: Time hasn't passed, scheduling for TODAY`);
          }
          break;
        case 'alternative':
          // Every 2 days - if time passed today, add 2 days
          if (nextPost <= now) {
            nextPost.setDate(nextPost.getDate() + 2);
            console.log(`  - Alternative: Time passed, scheduling 2 days from now`);
          } else {
            console.log(`  - Alternative: Time hasn't passed, scheduling for TODAY`);
          }
          break;
        case 'weekly':
          if (nextPost <= now) {
            nextPost.setDate(nextPost.getDate() + 7);
            console.log(`  - Weekly: Time passed, scheduling 7 days from now`);
          } else {
            console.log(`  - Weekly: Time hasn't passed, scheduling for TODAY`);
          }
          break;
        case 'twice-weekly':
          // Next Monday or Thursday
          const dayOfWeek = nextPost.getDay();
          if (dayOfWeek < 1) {
            nextPost.setDate(nextPost.getDate() + 1); // Monday
          } else if (dayOfWeek < 4) {
            nextPost.setDate(nextPost.getDate() + (4 - dayOfWeek)); // Thursday
          } else if (dayOfWeek === 4 && nextPost > now) {
            // It's Thursday and time hasn't passed
          } else {
            nextPost.setDate(nextPost.getDate() + (8 - dayOfWeek)); // Next Monday
          }
          break;
        default:
          if (nextPost <= now) {
            nextPost.setDate(nextPost.getDate() + 1);
          }
      }

      console.log(`  - Final next post date: ${nextPost.toISOString()}`);
      return nextPost.toISOString();
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

    return formatted;
  }
}

const supabaseAutomationService = new SupabaseAutomationService();
export default supabaseAutomationService;
