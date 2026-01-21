/**
 * User Service
 * Handles user management and subscription status checks
 * Uses the new schema with gmail_id as primary identifier
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[UserService] ❌ Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

class UserService {
  constructor() {
    console.log('[UserService] ✅ Initialized');
  }

  /**
   * Check if a user's subscription is valid
   * IMPORTANT: Uses .trim() to handle whitespace in subscription_status
   *
   * @param {string} gmailId - User's email
   * @returns {Object} { isValid: boolean, status: string, reason: string }
   */
  async checkSubscriptionStatus(gmailId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('subscription_status, trial_start_date, trial_end_date, subscription_start_date, subscription_end_date, is_admin')
        .eq('gmail_id', gmailId)
        .single();

      if (error || !user) {
        return {
          isValid: false,
          status: 'not_found',
          reason: 'User not found in database'
        };
      }

      // CRITICAL: Trim whitespace from subscription_status
      const subscriptionStatus = (user.subscription_status || '').trim();

      // Admin users always have access
      if (subscriptionStatus === 'admin' || user.is_admin) {
        return {
          isValid: true,
          status: 'admin',
          reason: 'Admin user - unlimited access'
        };
      }

      // Active subscription
      if (subscriptionStatus === 'active') {
        // Check if subscription has expired
        if (user.subscription_end_date) {
          const endDate = new Date(user.subscription_end_date);
          if (endDate < new Date()) {
            return {
              isValid: false,
              status: 'expired',
              reason: `Subscription expired on ${endDate.toLocaleDateString()}`
            };
          }
        }
        return {
          isValid: true,
          status: 'active',
          reason: 'Active subscription'
        };
      }

      // Trial subscription
      if (subscriptionStatus === 'trial') {
        // Check if trial has expired
        if (user.trial_end_date) {
          const trialEnd = new Date(user.trial_end_date);
          const now = new Date();
          if (trialEnd < now) {
            return {
              isValid: false,
              status: 'trial_expired',
              daysRemaining: 0,
              trialEndDate: user.trial_end_date,
              reason: `Trial expired on ${trialEnd.toLocaleDateString()}`
            };
          }
          // Calculate days remaining
          const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
          return {
            isValid: true,
            status: 'trial',
            daysRemaining: daysRemaining,
            trialEndDate: user.trial_end_date,
            reason: `Trial subscription active - ${daysRemaining} days remaining`
          };
        }
        // Trial with no end date - default to 7 days
        return {
          isValid: true,
          status: 'trial',
          daysRemaining: 7,
          trialEndDate: null,
          reason: 'Trial subscription active'
        };
      }

      // Expired status
      if (subscriptionStatus === 'expired') {
        return {
          isValid: false,
          status: 'expired',
          reason: 'Subscription has expired'
        };
      }

      // Unknown status
      return {
        isValid: false,
        status: subscriptionStatus || 'unknown',
        reason: `Unknown subscription status: ${subscriptionStatus}`
      };

    } catch (error) {
      console.error('[UserService] Error checking subscription status:', error);
      return {
        isValid: false,
        status: 'error',
        reason: `Error checking subscription: ${error.message}`
      };
    }
  }

  /**
   * Get user by gmail_id
   */
  async getUser(gmailId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('gmail_id', gmailId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[UserService] Error getting user:', error);
      throw error;
    }
  }

  /**
   * Get user's token data
   */
  async getUserToken(gmailId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('google_access_token, google_refresh_token, google_token_expiry, google_account_id, has_valid_token')
        .eq('gmail_id', gmailId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[UserService] Error getting user token:', error);
      throw error;
    }
  }

  /**
   * Refresh a user's token
   * Uses Google OAuth to get a new access token from refresh token
   */
  async refreshToken(gmailId) {
    try {
      const user = await this.getUserToken(gmailId);

      if (!user || !user.google_refresh_token) {
        throw new Error('No refresh token available');
      }

      // Use googleapis to refresh the token
      const { google } = await import('googleapis');

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        refresh_token: user.google_refresh_token
      });

      const { credentials } = await oauth2Client.refreshAccessToken();

      // Update user with new token
      const { data, error } = await supabase
        .from('users')
        .update({
          google_access_token: credentials.access_token,
          google_token_expiry: credentials.expiry_date,
          has_valid_token: true,
          token_last_refreshed: new Date().toISOString(),
          token_error: null,
          updated_at: new Date().toISOString()
        })
        .eq('gmail_id', gmailId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`[UserService] ✅ Token refreshed for user: ${gmailId}`);
      return {
        access_token: credentials.access_token,
        refresh_token: user.google_refresh_token,
        expiry_date: credentials.expiry_date
      };

    } catch (error) {
      console.error('[UserService] Error refreshing token:', error);

      // Mark token as invalid
      await supabase
        .from('users')
        .update({
          has_valid_token: false,
          token_error: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('gmail_id', gmailId);

      throw error;
    }
  }

  /**
   * Get all users with automation enabled
   */
  async getUsersWithAutomation() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_locations (*)
        `)
        .eq('has_valid_token', true)
        .in('subscription_status', ['active', 'trial', 'admin']);

      if (error) {
        throw error;
      }

      // Filter to only include users with at least one automation enabled
      const usersWithAutomation = (data || []).filter(user => {
        return user.user_locations?.some(loc =>
          loc.autoposting_enabled || loc.autoreply_enabled
        );
      });

      return usersWithAutomation;

    } catch (error) {
      console.error('[UserService] Error getting users with automation:', error);
      throw error;
    }
  }

  /**
   * Get all admin users
   */
  async getAdminUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('gmail_id, display_name')
        .or('is_admin.eq.true,subscription_status.eq.admin');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[UserService] Error getting admin users:', error);
      throw error;
    }
  }

  /**
   * Check if user is admin
   */
  async isAdmin(gmailId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_admin, subscription_status')
        .eq('gmail_id', gmailId)
        .single();

      if (error || !data) {
        return false;
      }

      const status = (data.subscription_status || '').trim();
      return data.is_admin === true || status === 'admin';

    } catch (error) {
      console.error('[UserService] Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Set user as admin
   */
  async setAdmin(gmailId, isAdmin = true) {
    try {
      const updateData = {
        is_admin: isAdmin,
        updated_at: new Date().toISOString()
      };

      if (isAdmin) {
        updateData.subscription_status = 'admin';
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('gmail_id', gmailId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`[UserService] ✅ Admin status set for ${gmailId}: ${isAdmin}`);
      return data;

    } catch (error) {
      console.error('[UserService] Error setting admin status:', error);
      throw error;
    }
  }

  /**
   * Get user's profile count (number of locations)
   */
  async getProfileCount(gmailId) {
    try {
      const { count, error } = await supabase
        .from('user_locations')
        .select('*', { count: 'exact', head: true })
        .eq('gmail_id', gmailId);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('[UserService] Error getting profile count:', error);
      return 0;
    }
  }

  /**
   * Update user's profile count
   */
  async updateProfileCount(gmailId) {
    try {
      const count = await this.getProfileCount(gmailId);

      const { data, error } = await supabase
        .from('users')
        .update({
          profile_count: count,
          updated_at: new Date().toISOString()
        })
        .eq('gmail_id', gmailId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[UserService] Error updating profile count:', error);
      throw error;
    }
  }

  /**
   * Get all users (for admin dashboard)
   */
  async getAllUsers(limit = 100, offset = 0) {
    try {
      const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return { users: data || [], total: count };
    } catch (error) {
      console.error('[UserService] Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Search users by email
   */
  async searchUsers(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('gmail_id', `%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[UserService] Error searching users:', error);
      throw error;
    }
  }

  /**
   * Update subscription after successful payment
   * THIS IS THE CORRECT METHOD - updates the users table directly
   */
  async updateSubscriptionAfterPayment(gmailId, paymentData) {
    try {
      console.log('[UserService] 🔄 Updating subscription for:', gmailId);
      console.log('[UserService] Payment data:', JSON.stringify(paymentData, null, 2));

      const now = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription

      const updateData = {
        subscription_status: 'active',
        subscription_start_date: now.toISOString(),
        subscription_end_date: endDate.toISOString(),
        profile_count: paymentData.profileCount || 1,
        razorpay_payment_id: paymentData.razorpayPaymentId,
        razorpay_order_id: paymentData.razorpayOrderId,
        amount_paid: paymentData.amount || 0,
        updated_at: now.toISOString()
      };

      console.log('[UserService] 📝 Update data:', JSON.stringify(updateData, null, 2));

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('gmail_id', gmailId)
        .select()
        .single();

      if (error) {
        console.error('[UserService] ❌ Update failed:', error);
        throw error;
      }

      console.log('[UserService] ✅ Subscription updated successfully!');
      console.log('[UserService] New status:', data.subscription_status);
      console.log('[UserService] Profile count:', data.profile_count);
      console.log('[UserService] End date:', data.subscription_end_date);

      return data;
    } catch (error) {
      console.error('[UserService] Error updating subscription:', error);
      throw error;
    }
  }

  /**
   * Delete user and all related data
   */
  async deleteUser(gmailId) {
    try {
      // Delete user (cascade will delete user_locations)
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('gmail_id', gmailId);

      if (error) {
        throw error;
      }

      console.log(`[UserService] ✅ User deleted: ${gmailId}`);
      return true;
    } catch (error) {
      console.error('[UserService] Error deleting user:', error);
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;
